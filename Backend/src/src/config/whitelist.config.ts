export interface OriginMonitoringConfig {
  readonly enabled: boolean;
  readonly trackTopOrigins: boolean;
  readonly trackUsagePatterns: boolean;
  readonly warnThreshold: number;
  readonly alertThreshold: number;
  readonly autoBlock: boolean;
  readonly blockOrigins: string[];
}

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

const parseOriginList = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const originMonitoringConfig: OriginMonitoringConfig = {
  enabled: parseBoolean(process.env.TRACK_ORIGINS, true),
  trackTopOrigins: parseBoolean(process.env.ORIGIN_TRACK_TOP, true),
  trackUsagePatterns: parseBoolean(process.env.ORIGIN_TRACK_USAGE, true),
  warnThreshold: Number(process.env.ORIGIN_WARN_THRESHOLD ?? 10_000),
  alertThreshold: Number(process.env.ORIGIN_ALERT_THRESHOLD ?? 50_000),
  autoBlock: parseBoolean(process.env.ORIGIN_AUTO_BLOCK, false),
  blockOrigins: parseOriginList(process.env.ORIGIN_BLOCK_LIST),
};
