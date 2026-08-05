/**
 * PAL Distributed Cache & Invalidation Bridge (PAL-TDD-006, PAL-ARCH-DOC-042)
 *
 * Features:
 *   - ICacheProvider contract with typed get/set/delete/clear/invalidatePattern/getStats
 *   - InMemoryCacheProvider with TTL, maxKeys LRU eviction, and real-time hit/miss metrics
 *   - RedisCacheProvider with Upstash REST API integration and graceful in-memory fallback
 *   - CacheBridge unified facade for application-wide cache orchestration
 */

export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
    accessIndex: number;
}

export interface CacheStats {
    hits: number;
    misses: number;
    hitRatio: number;
    size: number;
    evictions: number;
}

export interface ICacheProvider {
    name: string;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    invalidatePattern(pattern: string): Promise<number>;
    getStats(): Promise<CacheStats>;
}

export class InMemoryCacheProvider implements ICacheProvider {
    name = "InMemoryCacheProvider";
    private store: Map<string, CacheEntry<any>> = new Map();
    private maxKeys: number;
    private hits: number = 0;
    private misses: number = 0;
    private evictions: number = 0;
    private accessCounter: number = 0;

    constructor(maxKeys: number = 5000) {
        this.maxKeys = maxKeys;
    }

    async get<T>(key: string): Promise<T | undefined> {
        const entry = this.store.get(key);
        if (!entry) {
            this.misses++;
            return undefined;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.misses++;
            return undefined;
        }
        entry.accessIndex = ++this.accessCounter;
        this.hits++;
        return entry.value as T;
    }

    async set<T>(key: string, value: T, ttlMs: number = 300000): Promise<void> {
        const now = Date.now();

        // Evict LRU entry if maxKeys capacity is reached
        if (!this.store.has(key) && this.store.size >= this.maxKeys) {
            this.evictLRU();
        }

        this.store.set(key, {
            value,
            expiresAt: now + ttlMs,
            accessIndex: ++this.accessCounter
        });
    }

    async delete(key: string): Promise<boolean> {
        return this.store.delete(key);
    }

    async clear(): Promise<void> {
        this.store.clear();
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
        this.accessCounter = 0;
    }

    async invalidatePattern(pattern: string): Promise<number> {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        let count = 0;
        for (const key of Array.from(this.store.keys())) {
            if (regex.test(key)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }

    async getStats(): Promise<CacheStats> {
        const total = this.hits + this.misses;
        const hitRatio = total > 0 ? Number((this.hits / total).toFixed(4)) : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRatio,
            size: this.store.size,
            evictions: this.evictions
        };
    }

    private evictLRU(): void {
        let oldestKey: string | undefined;
        let lowestIndex = Infinity;

        for (const [key, entry] of this.store.entries()) {
            if (entry.accessIndex < lowestIndex) {
                lowestIndex = entry.accessIndex;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.store.delete(oldestKey);
            this.evictions++;
        }
    }
}

export class RedisCacheProvider implements ICacheProvider {
    name = "RedisCacheProvider";
    private fallback: InMemoryCacheProvider;
    private redisUrl?: string;
    private redisToken?: string;
    private hits: number = 0;
    private misses: number = 0;

    constructor(redisUrl?: string, redisToken?: string, maxKeys: number = 5000) {
        this.redisUrl = redisUrl || process.env.UPSTASH_REDIS_REST_URL;
        this.redisToken = redisToken || process.env.UPSTASH_REDIS_REST_TOKEN;
        this.fallback = new InMemoryCacheProvider(maxKeys);
    }

    private isRedisConfigured(): boolean {
        return Boolean(this.redisUrl && this.redisToken);
    }

    async get<T>(key: string): Promise<T | undefined> {
        if (!this.isRedisConfigured()) {
            return this.fallback.get<T>(key);
        }

        try {
            const url = `${this.redisUrl}/get/${encodeURIComponent(key)}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${this.redisToken}` }
            });

            if (!response.ok) return this.fallback.get<T>(key);
            const data = await response.json();
            if (!data.result) {
                this.misses++;
                return undefined;
            }
            this.hits++;
            return JSON.parse(data.result) as T;
        } catch {
            return this.fallback.get<T>(key);
        }
    }

    async set<T>(key: string, value: T, ttlMs: number = 300000): Promise<void> {
        if (!this.isRedisConfigured()) {
            return this.fallback.set(key, value, ttlMs);
        }

        try {
            const ttlSeconds = Math.ceil(ttlMs / 1000);
            const serialized = JSON.stringify(value);
            const url = `${this.redisUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(serialized)}?EX=${ttlSeconds}`;
            await fetch(url, {
                headers: { Authorization: `Bearer ${this.redisToken}` }
            });
        } catch {
            await this.fallback.set(key, value, ttlMs);
        }
    }

    async delete(key: string): Promise<boolean> {
        if (!this.isRedisConfigured()) {
            return this.fallback.delete(key);
        }

        try {
            const url = `${this.redisUrl}/del/${encodeURIComponent(key)}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${this.redisToken}` }
            });
            const data = await response.json();
            return (data.result || 0) > 0;
        } catch {
            return this.fallback.delete(key);
        }
    }

    async clear(): Promise<void> {
        this.hits = 0;
        this.misses = 0;
        if (!this.isRedisConfigured()) {
            return this.fallback.clear();
        }
        await this.fallback.clear();
    }

    async invalidatePattern(pattern: string): Promise<number> {
        if (!this.isRedisConfigured()) {
            return this.fallback.invalidatePattern(pattern);
        }

        try {
            const url = `${this.redisUrl}/keys/${encodeURIComponent(pattern)}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${this.redisToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                const keys: string[] = data.result || [];
                for (const key of keys) {
                    await this.delete(key);
                }
                return keys.length;
            }
        } catch {
            // Fall through to fallback
        }
        return this.fallback.invalidatePattern(pattern);
    }

    async getStats(): Promise<CacheStats> {
        if (!this.isRedisConfigured()) {
            return this.fallback.getStats();
        }
        const total = this.hits + this.misses;
        const hitRatio = total > 0 ? Number((this.hits / total).toFixed(4)) : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRatio,
            size: 0,
            evictions: 0
        };
    }
}

export class CacheBridge {
    private provider: ICacheProvider;

    constructor(provider?: ICacheProvider) {
        this.provider = provider || new RedisCacheProvider();
    }

    getProvider(): ICacheProvider {
        return this.provider;
    }

    async get<T>(key: string): Promise<T | undefined> {
        return this.provider.get<T>(key);
    }

    async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
        return this.provider.set<T>(key, value, ttlMs);
    }

    async invalidate(key: string): Promise<boolean> {
        return this.provider.delete(key);
    }

    async invalidatePattern(pattern: string): Promise<number> {
        return this.provider.invalidatePattern(pattern);
    }

    async clear(): Promise<void> {
        return this.provider.clear();
    }

    async getStats(): Promise<CacheStats> {
        return this.provider.getStats();
    }
}
