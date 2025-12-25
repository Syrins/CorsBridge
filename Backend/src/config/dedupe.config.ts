const parseNumber = (
	value: string | undefined,
	fallback: number,
	{ allowZero = false }: { allowZero?: boolean } = {},
): number => {
	if (typeof value === 'undefined') {
		return fallback;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		return fallback;
	}

	if (parsed < 0) {
		return fallback;
	}

	if (parsed === 0 && !allowZero) {
		return fallback;
	}

	return parsed;
};

export interface DedupeConfig {
	readonly enabled: boolean;
	readonly lockTtlMs: number;
	readonly waitTimeoutMs: number;
	readonly pollIntervalMs: number;
	readonly redisKeyPrefix: string;
}

export const dedupeConfig: DedupeConfig = {
	enabled: process.env.ENABLE_DEDUPE !== 'false',
	lockTtlMs: Math.max(1_000, parseNumber(process.env.DEDUPE_LOCK_TTL_MS, 15_000)),
	waitTimeoutMs: Math.max(500, parseNumber(process.env.DEDUPE_WAIT_TIMEOUT_MS, 14_000)),
	pollIntervalMs: Math.max(25, parseNumber(process.env.DEDUPE_POLL_INTERVAL_MS, 75, { allowZero: false })),
	redisKeyPrefix: process.env.DEDUPE_REDIS_KEY_PREFIX ?? 'corsbridge:dedupe:',
};
