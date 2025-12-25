interface TargetStat {
	target: string;
	count: number;
}

interface ResponseTimePercentiles {
	p50: number;
	p95: number;
	p99: number;
}

type CacheEvent = 'hit' | 'miss' | 'bypass' | 'dedupe' | 'error';

class MetricsService {
	private totalRequests = 0;

	private totalDuration = 0;

	private errorCount = 0;

	private readonly maxTrackedTargets = Number(process.env.METRICS_MAX_TARGETS ?? 200);

	private readonly maxResponseTimeSamples = Number(process.env.METRICS_MAX_RESPONSE_SAMPLES ?? 10_000);

	private targetCounts = new Map<string, number>();

	private methodCounts = new Map<string, number>();

	private statusCodeCounts = new Map<number, number>();

	private cacheEvents: Record<CacheEvent, number> = {
		hit: 0,
		miss: 0,
		bypass: 0,
		dedupe: 0,
		error: 0,
	};

	private rateLimitHits = 0;

	private throttledRequests = 0;

	private totalThrottleDelay = 0;

	private readonly responseTimes = new Float64Array(this.maxResponseTimeSamples);

	private responseSampleCount = 0;

	private responseSampleIndex = 0;

	recordRequest(statusCode: number, duration: number, method: string, target?: string): void {
		this.totalRequests += 1;
		this.totalDuration += duration;
		const normalizedMethod = method.toUpperCase();
		this.methodCounts.set(normalizedMethod, (this.methodCounts.get(normalizedMethod) ?? 0) + 1);
		this.statusCodeCounts.set(statusCode, (this.statusCodeCounts.get(statusCode) ?? 0) + 1);
		this.recordResponseTime(duration);

		if (statusCode >= 500) {
			this.errorCount += 1;
		}

		if (target) {
			this.recordTarget(target);
		}
	}

	recordCache(event: CacheEvent): void {
		this.cacheEvents[event] += 1;
	}

	recordRateLimitHit(): void {
		this.rateLimitHits += 1;
	}

	recordThrottle(delay: number): void {
		this.throttledRequests += 1;
		this.totalThrottleDelay += delay;
	}

	private recordTarget(target: string): void {
		this.targetCounts.set(target, (this.targetCounts.get(target) ?? 0) + 1);

		// Optimization: Only prune periodically (e.g. every 100 requests) or when size >> max
		// to avoid O(N log N) sort on every single request.
		const PRUNE_THRESHOLD_FACTOR = 1.25;

		if (this.targetCounts.size <= this.maxTrackedTargets * PRUNE_THRESHOLD_FACTOR) {
			return;
		}

		// Prune down to maxTrackedTargets
		const sorted = Array.from(this.targetCounts.entries()).sort((a, b) => b[1] - a[1]); // Descending

		// Keep top N, delete the rest
		const toRemove = sorted.slice(this.maxTrackedTargets);
		for (const [targetKey] of toRemove) {
			this.targetCounts.delete(targetKey);
		}
	}

	private recordResponseTime(duration: number): void {
		if (this.maxResponseTimeSamples === 0) {
			return;
		}

		this.responseTimes[this.responseSampleIndex] = duration;
		this.responseSampleIndex = (this.responseSampleIndex + 1) % this.maxResponseTimeSamples;
		this.responseSampleCount = Math.min(this.responseSampleCount + 1, this.maxResponseTimeSamples);
	}

	private getResponseSamples(): number[] {
		const count = this.responseSampleCount;
		if (count === 0) {
			return [];
		}

		const samples = new Array<number>(count);
		for (let i = 0; i < count; i += 1) {
			const index = (this.responseSampleIndex - count + i + this.maxResponseTimeSamples) % this.maxResponseTimeSamples;
			samples[i] = this.responseTimes[index];
		}

		return samples;
	}

	private calculatePercentiles(): ResponseTimePercentiles {
		const samples = this.getResponseSamples();
		if (samples.length === 0) {
			return { p50: 0, p95: 0, p99: 0 };
		}

		samples.sort((a, b) => a - b);
		const getPercentile = (p: number): number => {
			const index = Math.min(samples.length - 1, Math.max(0, Math.ceil((p / 100) * samples.length) - 1));
			return samples[index];
		};

		return {
			p50: getPercentile(50),
			p95: getPercentile(95),
			p99: getPercentile(99),
		};
	}

	getMetrics(): object {
		return this.getSnapshot();
	}

	getSnapshot(): object {
		const avgResponseTime = this.totalRequests === 0 ? 0 : this.totalDuration / this.totalRequests;
		const errorRate = this.totalRequests === 0 ? 0 : this.errorCount / this.totalRequests;

		const topTargets = Array.from(this.targetCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([target, count]) => ({ target, count }));

		const methodDistribution = Array.from(this.methodCounts.entries()).map(([method, count]) => ({ method, count }));

		const statusCodeDistribution = Array.from(this.statusCodeCounts.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([statusCode, count]) => ({ statusCode, count }));

		return {
			totalRequests: this.totalRequests,
			errorRate,
			avgResponseTime,
			percentiles: this.calculatePercentiles(),
			topTargets,
			methodDistribution,
			statusCodeDistribution,
			rateLimitHits: this.rateLimitHits,
			throttledRequests: this.throttledRequests,
			cache: { ...this.cacheEvents },
			uptime: process.uptime(),
			memory: process.memoryUsage(),
		};
	}

	/**
	 * Export metrics in Prometheus text format
	 */
	exportPrometheus(): string {
		const lines: string[] = [];
		const percentiles = this.calculatePercentiles();
		const errorRate = this.totalRequests === 0 ? 0 : this.errorCount / this.totalRequests;
		const avgResponseTime = this.totalRequests === 0 ? 0 : this.totalDuration / this.totalRequests;

		lines.push('# HELP http_requests_total Total number of HTTP requests');
		lines.push('# TYPE http_requests_total counter');
		lines.push(`http_requests_total ${this.totalRequests}`);
		lines.push('');

		lines.push('# HELP http_errors_total Total number of HTTP errors (5xx)');
		lines.push('# TYPE http_errors_total counter');
		lines.push(`http_errors_total ${this.errorCount}`);
		lines.push('');

		lines.push('# HELP http_error_rate HTTP error rate');
		lines.push('# TYPE http_error_rate gauge');
		lines.push(`http_error_rate ${errorRate.toFixed(4)}`);
		lines.push('');

		lines.push('# HELP http_response_time_milliseconds_avg Average HTTP response time');
		lines.push('# TYPE http_response_time_milliseconds_avg gauge');
		lines.push(`http_response_time_milliseconds_avg ${avgResponseTime.toFixed(2)}`);
		lines.push('');

		lines.push('# HELP http_response_time_milliseconds HTTP response time percentiles');
		lines.push('# TYPE http_response_time_milliseconds summary');
		lines.push(`http_response_time_milliseconds{quantile="0.5"} ${percentiles.p50.toFixed(2)}`);
		lines.push(`http_response_time_milliseconds{quantile="0.95"} ${percentiles.p95.toFixed(2)}`);
		lines.push(`http_response_time_milliseconds{quantile="0.99"} ${percentiles.p99.toFixed(2)}`);
		lines.push('');

		lines.push('# HELP http_rate_limit_hits_total Total number of rate limit hits');
		lines.push('# TYPE http_rate_limit_hits_total counter');
		lines.push(`http_rate_limit_hits_total ${this.rateLimitHits}`);
		lines.push('');

		lines.push('# HELP http_cache_events_total Cache interaction counters');
		lines.push('# TYPE http_cache_events_total counter');
		for (const [event, count] of Object.entries(this.cacheEvents)) {
			lines.push(`http_cache_events_total{event="${event}"} ${count}`);
		}
		lines.push('');

		lines.push('# HELP http_requests_by_method_total Total requests by HTTP method');
		lines.push('# TYPE http_requests_by_method_total counter');
		for (const [method, count] of this.methodCounts.entries()) {
			lines.push(`http_requests_by_method_total{method="${method}"} ${count}`);
		}
		lines.push('');

		lines.push('# HELP http_requests_by_status_total Total requests by status code');
		lines.push('# TYPE http_requests_by_status_total counter');
		for (const [statusCode, count] of this.statusCodeCounts.entries()) {
			lines.push(`http_requests_by_status_total{status="${statusCode}"} ${count}`);
		}
		lines.push('');

		lines.push('# HELP process_uptime_seconds Process uptime in seconds');
		lines.push('# TYPE process_uptime_seconds gauge');
		lines.push(`process_uptime_seconds ${process.uptime().toFixed(2)}`);
		lines.push('');

		const mem = process.memoryUsage();
		lines.push('# HELP process_memory_bytes Process memory usage');
		lines.push('# TYPE process_memory_bytes gauge');
		lines.push(`process_memory_bytes{type="rss"} ${mem.rss}`);
		lines.push(`process_memory_bytes{type="heapTotal"} ${mem.heapTotal}`);
		lines.push(`process_memory_bytes{type="heapUsed"} ${mem.heapUsed}`);
		lines.push(`process_memory_bytes{type="external"} ${mem.external}`);
		lines.push('');

		return lines.join('\n');
	}
}

export const metricsService = new MetricsService();
