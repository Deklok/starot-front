export class ServerCache {
    private cache: Map<string, { data: any; timestamp: number; lastAccessed: number }>;
    private defaultTTL: number;
    private maxSize: number;
    private hitCount: number;
    private missCount: number;

    constructor(options: { defaultTTL?: number; maxSize?: number } = {}) {
        this.cache = new Map();
        this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
        this.maxSize = options.maxSize || 100; // Maximum cache entries
        this.hitCount = 0;
        this.missCount = 0;
    }

    async get<T>(key: string, fetchFn: () => Promise<T>, options: { ttl?: number } = {}): Promise<T> {
        const ttl = options.ttl || this.defaultTTL;
        const now = Date.now();
        const cached = this.cache.get(key);

        // Return valid cached data
        if (cached && now - cached.timestamp < ttl) {
            this.hitCount++;
            // Update last accessed time
            this.cache.set(key, { ...cached, lastAccessed: now });
            return cached.data as T;
        }

        // Fetch new data
        this.missCount++;
        const data = await fetchFn();

        // Manage cache size (LRU-like behavior)
        if (this.cache.size >= this.maxSize) {
            // Delete oldest accessed entry
            const oldestKey = [...this.cache.entries()]
                .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)[0][0];
            this.cache.delete(oldestKey);
        }

        // Store new data
        this.cache.set(key, {
            data,
            timestamp: now,
            lastAccessed: now
        });

        return data;
    }

    // Invalidate specific cache entry
    invalidate(key: string): boolean {
        return this.cache.delete(key);
    }

    // Invalidate multiple cache entries by prefix
    invalidateByPrefix(prefix: string): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    // Clear entire cache
    clear(): boolean {
        this.cache.clear();
        return true;
    }

    // Get cache stats
    stats() {
        return {
            size: this.cache.size,
            hits: this.hitCount,
            misses: this.missCount,
            hitRate: this.hitCount / (this.hitCount + this.missCount || 1)
        };
    }
}

// Create singleton instance
export const serverCache = new ServerCache();