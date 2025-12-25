import { z } from 'zod';

const booleanSchema = z
    .enum(['true', 'false', '1', '0'])
    .transform((value) => value === 'true' || value === '1')
    .or(z.boolean());

const numberSchema = z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) {
        throw new Error('Invalid number');
    }
    return parsed;
}).or(z.number());

export const envSchema = z.object({
    // -------------------------------------------------------------------------
    // 1. CORE SERVER CONFIGURATION
    // -------------------------------------------------------------------------
    PORT: numberSchema.default(3000),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    SERVICE_NAME: z.string().default('corsbridge-backend'),
    PROXY_VERSION: z.string().default('0.1.0'),
    SHOW_HELP_ON_ROOT: booleanSchema.default(true),

    // -------------------------------------------------------------------------
    // 2. REDIS CONFIGURATION
    // -------------------------------------------------------------------------
    REDIS_URL: z.string().optional(),

    // -------------------------------------------------------------------------
    // 3. CACHING STRATEGY
    // -------------------------------------------------------------------------
    ENABLE_CACHE: booleanSchema.default(true),
    CACHE_DRIVER: z.enum(['memory', 'redis']).default('memory'),
    CACHE_TTL: numberSchema.default(60), // seconds
    CACHE_MAX_SIZE: numberSchema.default(1000), // count
    CACHE_MAX_BODY_SIZE: z.string().default('1mb'),

    CACHE_REDIS_URL: z.string().optional(),
    CACHE_REDIS_KEY_PREFIX: z.string().default('corsbridge:cache:'),
    CACHE_REDIS_CONNECT_TIMEOUT_MS: numberSchema.default(5000),

    // -------------------------------------------------------------------------
    // 4. RATE LIMITING
    // -------------------------------------------------------------------------
    RATE_LIMIT_DAILY_MAX: numberSchema.default(200000),
    RATE_LIMIT_MAX_REQUESTS: numberSchema.default(100),
    RATE_LIMIT_WINDOW_MS: numberSchema.default(60000),

    ENABLE_REDIS: booleanSchema.default(false), // Checked by some code
    RATE_LIMIT_ENABLE_REDIS: booleanSchema.default(false),
    RATE_LIMIT_REDIS_URL: z.string().optional(),

    RATE_LIMIT_WHITELIST: z.string().optional(),

    RATE_LIMIT_SKIP_FAILED: booleanSchema.default(false),
    RATE_LIMIT_SKIP_SUCCESSFUL: booleanSchema.default(false),
    RATE_LIMIT_SKIP_OPTIONS: booleanSchema.default(true),

    ABUSE_MONITOR_ENABLED: booleanSchema.default(true),
    ABUSE_BLOCK_DURATION_MINUTES: numberSchema.default(15),
    ABUSE_SPIKE_THRESHOLD: numberSchema.default(200),
    RATE_LIMIT_WARN_THRESHOLD: numberSchema.default(0),
    RATE_LIMIT_ALERT_THRESHOLD: numberSchema.default(0),

    // -------------------------------------------------------------------------
    // 5. CIRCUIT BREAKER
    // -------------------------------------------------------------------------
    CIRCUIT_BREAKER_DRIVER: z.enum(['memory', 'redis']).default('memory'),
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: numberSchema.default(5),
    CIRCUIT_BREAKER_SUCCESS_THRESHOLD: numberSchema.default(2),
    CIRCUIT_BREAKER_TIMEOUT_MS: numberSchema.default(60000),
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: numberSchema.default(60000),
    CIRCUIT_BREAKER_WINDOW_MS: numberSchema.default(120000),
    CIRCUIT_BREAKER_MAX_TARGETS: numberSchema.default(1000),
    CIRCUIT_BREAKER_TTL_MS: numberSchema.default(1800000),
    CIRCUIT_BREAKER_REDIS_KEY_PREFIX: z.string().default('circuit:'),

    // -------------------------------------------------------------------------
    // 6. DEDUPLICATION
    // -------------------------------------------------------------------------
    ENABLE_DEDUPE: booleanSchema.default(true),
    DEDUPE_LOCK_TTL_MS: numberSchema.default(15000),
    DEDUPE_WAIT_TIMEOUT_MS: numberSchema.default(14000),
    DEDUPE_POLL_INTERVAL_MS: numberSchema.default(75),
    DEDUPE_REDIS_KEY_PREFIX: z.string().default('corsbridge:dedupe:'),

    // -------------------------------------------------------------------------
    // 7. SECURITY & LIMITS
    // -------------------------------------------------------------------------
    ALLOW_PRIVATE_NETWORKS: booleanSchema.default(false),
    DNS_CACHE_TTL_MS: numberSchema.default(60000),

    // Timeouts
    REQUEST_TIMEOUT: numberSchema.default(30000),
    KEEP_ALIVE_TIMEOUT: numberSchema.default(31000),
    HEADERS_TIMEOUT: numberSchema.default(32000),

    // Sizes
    MAX_URL_LENGTH: numberSchema.default(4096),
    MAX_HEADER_SIZE: numberSchema.default(16384),
    MAX_REQUEST_SIZE: z.string().default('10mb'),
    MAX_RESPONSE_SIZE: z.string().default('10mb'),
    MAX_JSON_BODY_SIZE: numberSchema.default(1048576),
    MAX_TEXT_BODY_SIZE: numberSchema.default(1048576),
    MAX_REDIRECTS: numberSchema.default(5),

    // -------------------------------------------------------------------------
    // 8. PROXY BEHAVIOR
    // -------------------------------------------------------------------------
    PROXY_TIMEOUT: numberSchema.default(30000),
    PROXY_PROXY_TIMEOUT: numberSchema.default(30000),

    PROXY_CHANGE_ORIGIN: booleanSchema.default(true),
    PROXY_SECURE: booleanSchema.default(true),
    PROXY_FOLLOW_REDIRECTS: booleanSchema.default(true),
    PROXY_OPTIONS_PASSTHROUGH: booleanSchema.default(true),
    PROXY_PRESERVE_HOST: booleanSchema.default(false),
    PROXY_PRESERVE_HOST_HEADER: booleanSchema.default(false).optional(), // Legacy/Alternate name support if needed

    ALLOWED_METHODS: z.string().optional(),
    STRIP_HEADERS: z.string().optional(),

    // -------------------------------------------------------------------------
    // 9. CORS
    // -------------------------------------------------------------------------
    CORS_ALLOWED_ORIGINS: z.string().default('*'),
    CORS_ALLOW_CREDENTIALS: booleanSchema.default(false),
    CORS_ALLOWED_HEADERS: z.string().optional(),
    CORS_ALLOWED_METHODS: z.string().optional(),
    CORS_EXPOSE_HEADERS: z.string().optional(),
    CORS_MAX_AGE: numberSchema.optional(),
    SEND_POWERED_BY_HEADER: booleanSchema.default(false),

    // -------------------------------------------------------------------------
    // 10. OBSERVABILITY
    // -------------------------------------------------------------------------
    METRICS_MAX_TARGETS: numberSchema.default(200),
    METRICS_MAX_RESPONSE_SAMPLES: numberSchema.default(10000),
    ERROR_TRACKING_DSN: z.string().optional(),
    MEMORY_RESTART_THRESHOLD_MB: numberSchema.default(0),
    MEMORY_GUARD_INTERVAL_MS: numberSchema.default(60000),
    HEALTH_MEMORY_WARNING_PERCENT: numberSchema.default(80),
    HEALTH_MIN_HEAP_MB: numberSchema.default(50),

    // -------------------------------------------------------------------------
    // 11. COMMUNITY LISTS
    // -------------------------------------------------------------------------
    COMMUNITY_BLOCKLIST_URL: z.string().optional(),
    COMMUNITY_TRUSTLIST_URL: z.string().optional(),
    COMMUNITY_LIST_REFRESH_INTERVAL_MS: numberSchema.default(21600000),

    // -------------------------------------------------------------------------
    // 12. ORIGIN ANALYSIS
    // -------------------------------------------------------------------------
    TRACK_ORIGINS: booleanSchema.default(true),
    ORIGIN_TRACK_TOP: booleanSchema.default(true),
    ORIGIN_TRACK_USAGE: booleanSchema.default(true),
    ORIGIN_WARN_THRESHOLD: numberSchema.default(10000),
    ORIGIN_ALERT_THRESHOLD: numberSchema.default(50000),
    ORIGIN_AUTO_BLOCK: booleanSchema.default(false),
    ORIGIN_BLOCK_LIST: z.string().optional(),

    // -------------------------------------------------------------------------
    // 13. DEPLOYMENT & PROXY AGENTS
    // -------------------------------------------------------------------------
    PM2_INSTANCES: z.string().optional(),
    HTTP_PROXY: z.string().optional(),
    HTTPS_PROXY: z.string().optional(),
    NO_PROXY: z.string().optional(),

    MAX_SOCKETS: numberSchema.default(50),
    MAX_FREE_SOCKETS: numberSchema.default(10),
    MAX_CACHED_SESSIONS: numberSchema.default(0),

    PROXY_MAX_UPSTREAM_AGENTS: numberSchema.default(200),
    PROXY_UPSTREAM_AGENT_TTL_MS: numberSchema.default(900000),

    // Extra headers control
    PROXY_EXPOSE_HEADERS: z.string().optional(),
    PROXY_REJECT_UNSECURE: booleanSchema.default(false), // Logic inverted in code? code has secure: process.env.PROXY_REJECT_UNSECURE !== 'true', so default is secure=true
    ENABLE_REDIRECTS: booleanSchema.default(true),
    PROXY_PASSTHROUGH_ORIGIN: booleanSchema.default(false),
    PROXY_STRIP_HEADERS: z.string().optional(),
    PROXY_ALLOWED_METHODS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
        process.exit(1);
    }

    return result.data;
}

