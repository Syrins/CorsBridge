import { fetch } from 'undici';
import { logger } from './logger.service';
import { matchesCidr, normalizeIp } from '../utils/ip.utils';

export class BlocklistService {
    private blocklistCount = 0;
    private trustlistCount = 0;

    private blockedIps = new Set<string>();
    private blockedCidrs: string[] = [];

    private trustedIps = new Set<string>();
    private trustedCidrs: string[] = [];

    private refreshInterval: NodeJS.Timeout | null = null;
    private readonly refreshIntervalMs = Number(process.env.COMMUNITY_LIST_REFRESH_INTERVAL_MS ?? 6 * 60 * 60 * 1000);

    constructor() {
        // Initial fetch if configured
        if (process.env.COMMUNITY_BLOCKLIST_URL || process.env.COMMUNITY_TRUSTLIST_URL) {
            void this.refreshLists();
            this.refreshInterval = setInterval(() => void this.refreshLists(), this.refreshIntervalMs).unref();
            logger.info('Community BlocklistService initialized');
        }
    }

    isBlocked(ip: string): boolean {
        if (this.blockedIps.has(ip)) return true;
        return this.blockedCidrs.some(cidr => matchesCidr(ip, cidr));
    }

    isTrusted(ip: string): boolean {
        if (this.trustedIps.has(ip)) return true;
        return this.trustedCidrs.some(cidr => matchesCidr(ip, cidr));
    }

    private async refreshLists() {
        const blocklistUrl = process.env.COMMUNITY_BLOCKLIST_URL;
        const trustlistUrl = process.env.COMMUNITY_TRUSTLIST_URL;

        if (blocklistUrl) {
            try {
                const { ips, cidrs } = await this.fetchAndParse(blocklistUrl);
                this.blockedIps = ips;
                this.blockedCidrs = cidrs;
                this.blocklistCount = ips.size + cidrs.length;
                logger.info({ count: this.blocklistCount }, 'Updated community blocklist');
            } catch (error) {
                logger.error({ error }, 'Failed to refresh community blocklist');
            }
        }

        if (trustlistUrl) {
            try {
                const { ips, cidrs } = await this.fetchAndParse(trustlistUrl);
                this.trustedIps = ips;
                this.trustedCidrs = cidrs;
                this.trustlistCount = ips.size + cidrs.length;
                logger.info({ count: this.trustlistCount }, 'Updated community trustlist');
            } catch (error) {
                logger.error({ error }, 'Failed to refresh community trustlist');
            }
        }
    }

    private async fetchAndParse(url: string): Promise<{ ips: Set<string>; cidrs: string[] }> {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch list: ${res.status} ${res.statusText}`);
        }

        const text = await res.text();
        const ips = new Set<string>();
        const cidrs: string[] = [];

        const lines = text.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Basic cleanup (remove inline comments)
            const entry = trimmed.split('#')[0].trim();
            if (!entry) continue;

            if (entry.includes('/')) {
                cidrs.push(entry);
            } else {
                ips.add(normalizeIp(entry));
            }
        }

        return { ips, cidrs };
    }
}

export const blocklistService = new BlocklistService();
