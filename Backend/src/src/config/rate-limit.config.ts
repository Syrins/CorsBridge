export interface RateLimitConfig {
	readonly windowMs: number;
	readonly maxRequests: number;
	readonly dailyLimit: number;
	readonly skipFailedRequests: boolean;
	readonly skipSuccessfulRequests: boolean;
	readonly skipOptions: boolean;
	readonly warnThreshold: number;
	readonly alertThreshold: number;
	readonly enableRedis: boolean;
	readonly redisUrl?: string;
	readonly abuseMonitoringEnabled: boolean;
	readonly whitelistExact: string[];
	readonly whitelistCidrs: string[];
}

const parseIntWithFloor = (value: string | undefined, fallback: number, { allowZero = false }: { allowZero?: boolean } = {}): number => {
	if (typeof value === 'undefined') {
		return fallback;
	}
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return fallback;
	}
	if (parsed === 0 && !allowZero) {
		return fallback;
	}
	return Math.floor(parsed);
};

const parseWhitelist = (value: string | undefined): { exact: string[]; cidrs: string[] } => {
	if (!value) {
		return { exact: [], cidrs: [] };
	}

	const exact: string[] = [];
	const cidrs: string[] = [];

	for (const entry of value.split(',')) {
		const trimmed = entry.trim();
		if (!trimmed) {
			continue;
		}
		if (trimmed.includes('/')) {
			cidrs.push(trimmed);
		} else {
			exact.push(trimmed);
		}
	}

	return { exact, cidrs };
};

const redisUrl = process.env.REDIS_URL;
const redisEnabled = process.env.ENABLE_REDIS === 'true' && typeof redisUrl === 'string' && redisUrl.length > 0;
const whitelist = parseWhitelist(process.env.RATE_LIMIT_WHITELIST);

export const rateLimitConfig: RateLimitConfig = {
	windowMs: parseIntWithFloor(process.env.RATE_LIMIT_WINDOW_MS, 600_000),
	maxRequests: parseIntWithFloor(process.env.RATE_LIMIT_MAX_REQUESTS, 200),
	dailyLimit: parseIntWithFloor(process.env.RATE_LIMIT_DAILY_LIMIT, 2_000, { allowZero: true }),
	skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
	skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
	skipOptions: process.env.RATE_LIMIT_SKIP_OPTIONS === 'true',
	warnThreshold: parseIntWithFloor(process.env.ABUSE_WARN_THRESHOLD, 500, { allowZero: true }),
	alertThreshold: parseIntWithFloor(process.env.ABUSE_ALERT_THRESHOLD, 1_000, { allowZero: true }),
	enableRedis: redisEnabled,
	redisUrl,
	abuseMonitoringEnabled: process.env.ABUSE_DETECTION !== 'false',
	whitelistExact: whitelist.exact,
	whitelistCidrs: whitelist.cidrs,
};
