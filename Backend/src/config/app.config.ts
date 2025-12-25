import { z } from 'zod';
import { envSchema } from './env.schema';

// Helper to parse booleans loosely
const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (typeof value === 'undefined') {
        return fallback;
    }
    switch (value.toLowerCase()) {
        case '1':
        case 'true':
        case 'yes':
        case 'on':
            return true;
        case '0':
        case 'false':
        case 'no':
        case 'off':
            return false;
        default:
            return fallback;
    }
};

const parseNumber = (value: string | undefined, fallback: number): number => {
    if (typeof value === 'undefined') {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export interface AppConfig {
    readonly port: number;
    readonly host: string;
    readonly nodeEnv: 'development' | 'production' | 'test';
    readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    readonly serviceName: string;
    readonly proxyVersion: string;
    readonly showHelpOnRoot: boolean;
    readonly allowPrivateNetworks: boolean;
    readonly dnsCacheTtlMs: number;

    // Health & Monitoring
    readonly errorTrackingDsn?: string;
    readonly memoryRestartThresholdMb: number;
    readonly memoryGuardIntervalMs: number;
    readonly healthMemoryWarningPercent: number;
    readonly healthMinHeapMb: number;

    // Community Lists
    readonly communityBlocklistUrl?: string;
    readonly communityTrustlistUrl?: string;
    readonly communityListRefreshIntervalMs: number;
}

export const appConfig: AppConfig = {
    port: parseNumber(process.env.PORT, 3000),
    host: process.env.HOST ?? '0.0.0.0',
    nodeEnv: (process.env.NODE_ENV as any) ?? 'development',
    logLevel: (process.env.LOG_LEVEL as any) ?? 'info',
    serviceName: process.env.SERVICE_NAME ?? 'corsbridge-backend',
    proxyVersion: process.env.PROXY_VERSION ?? '0.1.0',
    showHelpOnRoot: parseBoolean(process.env.SHOW_HELP_ON_ROOT, true),
    allowPrivateNetworks: parseBoolean(process.env.ALLOW_PRIVATE_NETWORKS, false),
    dnsCacheTtlMs: parseNumber(process.env.DNS_CACHE_TTL_MS, 60000),

    errorTrackingDsn: process.env.ERROR_TRACKING_DSN,
    memoryRestartThresholdMb: parseNumber(process.env.MEMORY_RESTART_THRESHOLD_MB, 0),
    memoryGuardIntervalMs: parseNumber(process.env.MEMORY_GUARD_INTERVAL_MS, 60000),
    healthMemoryWarningPercent: parseNumber(process.env.HEALTH_MEMORY_WARNING_PERCENT, 80),
    healthMinHeapMb: parseNumber(process.env.HEALTH_MIN_HEAP_MB, 50),

    communityBlocklistUrl: process.env.COMMUNITY_BLOCKLIST_URL,
    communityTrustlistUrl: process.env.COMMUNITY_TRUSTLIST_URL,
    communityListRefreshIntervalMs: parseNumber(process.env.COMMUNITY_LIST_REFRESH_INTERVAL_MS, 21600000),
};
