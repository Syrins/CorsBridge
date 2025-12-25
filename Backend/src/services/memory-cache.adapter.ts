import { LRUCache } from 'lru-cache';
import * as zlib from 'zlib';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { logger } from './logger.service';
import { Buffer } from 'buffer';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface CachedResponse {
    status: number;
    headers: Record<string, string | string[]>;
    body: Buffer;
}

interface SerializedEntry {
    s: number; // status
    h: Record<string, string | string[]>; // headers
    b: string; // body (base64)
    c: boolean; // compressed?
    t: number; // timestamp (for expiry check if needed, though LRU handles it)
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    count: number;
    compressionRatio: number;
}

interface AdvancedCacheOptions {
    maxEntries: number;
    ttlSeconds: number;
    snapshotFile?: string;
    compressThresholdBytes?: number; // Defaults to 1024
    maxSizeBytes?: number;
}

export class AdvancedMemoryCache {
    private cache: LRUCache<string, Buffer>;
    private options: AdvancedCacheOptions;
    private statsData: CacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
        count: 0,
        compressionRatio: 0,
    };
    private totalOriginalBytes = 0;
    private totalCompressedBytes = 0;
    private snapshotIntervalId: NodeJS.Timeout | null = null;
    private isSaving = false;

    constructor(options: AdvancedCacheOptions) {
        this.options = {
            compressThresholdBytes: 1024,
            maxSizeBytes: 256 * 1024 * 1024, // 256MB default
            ...options,
        };

        this.cache = new LRUCache<string, Buffer>({
            max: Math.max(this.options.maxEntries, 1),
            maxSize: this.options.maxSizeBytes,
            ttl: this.options.ttlSeconds * 1000,
            allowStale: false,
            updateAgeOnGet: true,
            // tracking size by length of buffer (approximate memory usage in bytes)
            sizeCalculation: (value) => value.length,
        });

        // Auto-load snapshot if configured
        if (this.options.snapshotFile) {
            void this.loadSnapshot();
            // Save every 5 minutes
            this.snapshotIntervalId = setInterval(() => void this.saveSnapshot(), 5 * 60 * 1000);
        }
    }

    async set(key: string, value: CachedResponse): Promise<void> {
        try {
            const bodyBuffer = value.body;
            const shouldCompress = bodyBuffer.length > (this.options.compressThresholdBytes ?? 1024);

            let processedBody: Buffer | string = bodyBuffer;
            let isCompressed = false;

            if (shouldCompress) {
                try {
                    processedBody = await gzip(bodyBuffer);
                    isCompressed = true;
                } catch (err) {
                    logger.warn({ err }, 'Failed to compress cache entry, storing uncompressed');
                    processedBody = bodyBuffer;
                }
            }

            // Track stats for compression ratio
            this.totalOriginalBytes += bodyBuffer.length;
            this.totalCompressedBytes += processedBody.length;

            // Serialize entire entry to simple JSON then Buffer to store in LRU
            // We store as Buffer to accurate return size for LRU eviction
            const entry: SerializedEntry = {
                s: value.status,
                h: value.headers,
                b: processedBody.toString('base64'),
                c: isCompressed,
                t: Date.now(),
            };

            const storedBuffer = Buffer.from(JSON.stringify(entry));
            this.cache.set(key, storedBuffer);
        } catch (error) {
            logger.error({ error, key }, 'Error setting cache entry');
        }
    }

    async get(key: string): Promise<CachedResponse | null> {
        const data = this.cache.get(key);
        if (!data) {
            this.statsData.misses++;
            return null;
        }

        try {
            const entry = JSON.parse(data.toString()) as SerializedEntry;
            let body = Buffer.from(entry.b, 'base64');

            if (entry.c) {
                body = await gunzip(body);
            }

            this.statsData.hits++;
            return {
                status: entry.s,
                headers: entry.h,
                body: body,
            };
        } catch (error) {
            logger.error({ error, key }, 'Error retrieving/decompressing cache entry');
            this.statsData.misses++;
            return null;
        }
    }

    async peek(key: string): Promise<CachedResponse | null> {
        const data = this.cache.peek(key);
        if (!data) {
            return null;
        }

        try {
            const entry = JSON.parse(data.toString()) as SerializedEntry;
            let body = Buffer.from(entry.b, 'base64');

            if (entry.c) {
                body = await gunzip(body);
            }

            // Do not update hits/misses for peek
            return {
                status: entry.s,
                headers: entry.h,
                body: body,
            };
        } catch (error) {
            logger.error({ error, key }, 'Error peering cache entry');
            return null;
        }
    }

    clear(): void {
        this.cache.clear();
        this.totalOriginalBytes = 0;
        this.totalCompressedBytes = 0;
        this.statsData.hits = 0;
        this.statsData.misses = 0;
    }

    async saveSnapshot(): Promise<void> {
        if (!this.options.snapshotFile || this.isSaving) return;
        this.isSaving = true;

        try {
            const dump = this.cache.dump();
            // dump returns [key, value][] basically, or internal structure.
            // lru-cache v10 dump/load returns array of [value, key, options] or similar
            // Checking lru-cache types: dump() returns Array<[Key, Entry<V>]>
            // Actually lru-cache dump returns serializable array.

            const serialized = JSON.stringify(dump);
            // Write to temp file then rename for atomic write
            const tempFile = `${this.options.snapshotFile}.tmp`;
            await fs.writeFile(tempFile, serialized, 'utf-8');
            await fs.rename(tempFile, this.options.snapshotFile);

            logger.info({ size: this.cache.size }, 'Cache snapshot saved');
        } catch (error) {
            logger.error({ error }, 'Failed to save cache snapshot');
        } finally {
            this.isSaving = false;
        }
    }

    async loadSnapshot(): Promise<void> {
        if (!this.options.snapshotFile) return;

        try {
            // Check if file exists
            try {
                await fs.access(this.options.snapshotFile);
            } catch {
                return; // File doesn't exist, start fresh
            }

            const data = await fs.readFile(this.options.snapshotFile, 'utf-8');
            const dump = JSON.parse(data, (key, value) => {
                if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
                    return Buffer.from(value.data);
                }
                return value;
            });
            this.cache.load(dump);
            logger.info({ count: this.cache.size }, 'Cache snapshot loaded');
        } catch (error) {
            logger.error({ error }, 'Failed to load cache snapshot');
        }
    }

    getStats(): CacheStats {
        const currentRatio = this.totalOriginalBytes > 0
            ? (1 - this.totalCompressedBytes / this.totalOriginalBytes) * 100
            : 0;

        return {
            hits: this.statsData.hits,
            misses: this.statsData.misses,
            size: this.cache.calculatedSize, // Total bytes in cache (approx)
            count: this.cache.size,
            compressionRatio: parseFloat(currentRatio.toFixed(2)),
        };
    }

    stop(): void {
        if (this.snapshotIntervalId) {
            clearInterval(this.snapshotIntervalId);
        }
    }
}
