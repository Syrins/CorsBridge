import { logger } from './logger.service';

/**
 * Circuit breaker states
 */
enum CircuitState {
	CLOSED = 'CLOSED',
	OPEN = 'OPEN',
	HALF_OPEN = 'HALF_OPEN',
}

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerConfig {
	failureThreshold: number;
	successThreshold: number;
	timeout: number;
	windowSize: number;
}

/**
 * Circuit breaker for a single target
 */
class Circuit {
	private state: CircuitState = CircuitState.CLOSED;
	private failureCount = 0;
	private successCount = 0;
	private nextAttemptTime = 0;
	private failures: number[] = [];
  private lastTouched = Date.now();

	constructor(
		private readonly target: string,
		private readonly config: CircuitBreakerConfig,
	) {}

	/**
	 * Check if request should be allowed
	 */
	canAttempt(): boolean {
		const now = Date.now();

		this.failures = this.failures.filter((time) => now - time < this.config.windowSize);
		this.failureCount = this.failures.length;

		switch (this.state) {
			case CircuitState.CLOSED:
				return true;

			case CircuitState.OPEN:
				if (now >= this.nextAttemptTime) {
					this.transitionTo(CircuitState.HALF_OPEN);
					logger.info(
						{
							target: this.target,
							state: this.state,
						},
						'Circuit breaker entering half-open state',
					);
					return true;
				}
				return false;

			case CircuitState.HALF_OPEN:
				return true;

			default:
				return true;
		}
	}

	/**
	 * Record a successful request
	 */
	recordSuccess(): void {
		const now = Date.now();
    this.lastTouched = now;

		switch (this.state) {
			case CircuitState.HALF_OPEN:
				this.successCount += 1;
				if (this.successCount >= this.config.successThreshold) {
					this.transitionTo(CircuitState.CLOSED);
					this.failureCount = 0;
					this.successCount = 0;
					this.failures = [];
					logger.info(
						{
							target: this.target,
							state: this.state,
						},
						'Circuit breaker closed after successful recovery',
					);
				}
				break;

			case CircuitState.CLOSED:
				this.failures = this.failures.filter((time) => now - time < this.config.windowSize);
				this.failureCount = this.failures.length;
				break;

			default:
				break;
		}
	}

	/**
	 * Record a failed request
	 */
	recordFailure(): void {
		const now = Date.now();
		this.failures.push(now);
    this.lastTouched = now;

		this.failures = this.failures.filter((time) => now - time < this.config.windowSize);
		this.failureCount = this.failures.length;

		switch (this.state) {
			case CircuitState.CLOSED:
				if (this.failureCount >= this.config.failureThreshold) {
					this.transitionTo(CircuitState.OPEN);
					this.nextAttemptTime = now + this.config.timeout;
					logger.warn(
						{
							target: this.target,
							failureCount: this.failureCount,
							threshold: this.config.failureThreshold,
						},
						'Circuit breaker opened due to failures',
					);
				}
				break;

			case CircuitState.HALF_OPEN:
				this.transitionTo(CircuitState.OPEN);
				this.nextAttemptTime = now + this.config.timeout;
				this.successCount = 0;
				logger.warn(
					{
						target: this.target,
					},
					'Circuit breaker reopened after failed recovery attempt',
				);
				break;

			default:
				break;
		}
	}

	private transitionTo(newState: CircuitState): void {
		this.state = newState;
	}

	getState(): CircuitState {
		return this.state;
	}

	getFailureCount(): number {
		return this.failureCount;
	}

  get lastUpdated(): number {
    return this.lastTouched;
  }
}

/**
 * Circuit breaker service to manage multiple target circuits
 */
class CircuitBreakerService {
	private readonly circuits = new Map<string, Circuit>();

	private readonly defaultConfig: CircuitBreakerConfig = {
		failureThreshold: Number(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5,
		successThreshold: Number(process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD) || 2,
		timeout: Number(process.env.CIRCUIT_BREAKER_TIMEOUT_MS) || 60_000,
		windowSize: Number(process.env.CIRCUIT_BREAKER_WINDOW_MS) || 120_000,
	};

  private readonly maxCircuits = Number(process.env.CIRCUIT_BREAKER_MAX_TARGETS ?? 1000);
  private readonly circuitTtlMs = Number(process.env.CIRCUIT_BREAKER_TTL_MS ?? 30 * 60 * 1000);

	/**
	 * Get or create circuit for a target
	 */
	private getCircuit(target: string): Circuit {
		let circuit = this.circuits.get(target);
		if (!circuit) {
			circuit = new Circuit(target, this.defaultConfig);
			this.circuits.set(target, circuit);
      this.pruneCircuits();
		}
		return circuit;
	}

	/**
	 * Check if request to target should be allowed
	 */
	canAttempt(target: string): boolean {
		const circuit = this.getCircuit(target);
		return circuit.canAttempt();
	}

	/**
	 * Record successful request
	 */
	recordSuccess(target: string): void {
		const circuit = this.getCircuit(target);
		circuit.recordSuccess();
	}

	/**
	 * Record failed request
	 */
	recordFailure(target: string): void {
		const circuit = this.getCircuit(target);
		circuit.recordFailure();
	}

	/**
	 * Get circuit state for a target
	 */
	getState(target: string): CircuitState {
		const circuit = this.circuits.get(target);
		return circuit ? circuit.getState() : CircuitState.CLOSED;
	}

	/**
	 * Get all circuit states
	 */
	getAllStates(): Array<{ target: string; state: CircuitState; failures: number }> {
		return Array.from(this.circuits.entries()).map(([target, circuit]) => ({
			target,
			state: circuit.getState(),
			failures: circuit.getFailureCount(),
		}));
	}

	/**
	 * Reset a specific circuit
	 */
	reset(target: string): void {
		this.circuits.delete(target);
		logger.info({ target }, 'Circuit breaker reset');
	}

	/**
	 * Reset all circuits
	 */
	resetAll(): void {
		this.circuits.clear();
		logger.info('All circuit breakers reset');
	}

	private pruneCircuits(): void {
		const now = Date.now();
		for (const [target, circuit] of this.circuits.entries()) {
			if (now - circuit.lastUpdated > this.circuitTtlMs) {
				this.circuits.delete(target);
			}
		}

		if (this.circuits.size <= this.maxCircuits) {
			return;
		}

		const sorted = Array.from(this.circuits.entries()).sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);
		for (const [target] of sorted.slice(0, Math.max(0, this.circuits.size - this.maxCircuits))) {
			this.circuits.delete(target);
		}
	}
}

export const circuitBreakerService = new CircuitBreakerService();
export { CircuitState };
