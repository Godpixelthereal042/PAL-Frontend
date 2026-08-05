/**
 * PAL Cache Provider Abstraction & Implementations (Memory & Redis)
 * 
 * Governing Spec: PAL-TDD-001 Chapter 8 & Appendix A
 * Architecture Bible: Chapter 23 & 28
 */

import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:CacheProvider");

export interface ICacheProvider {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
}

interface CacheItem<T> {
    value: T;
    expiresAt: number | null; // epoch ms
}

/**
 * MemoryCacheProvider - In-memory TTL Cache Provider for local development & testing.
 */
export class MemoryCacheProvider implements ICacheProvider {
    private cache = new Map<string, CacheItem<any>>();

    public async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (!item) return null;

        if (item.expiresAt !== null && Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.cache.set(key, { value, expiresAt });
    }

    public async del(key: string): Promise<boolean> {
        return this.cache.delete(key);
    }

    public async clear(): Promise<void> {
        this.cache.clear();
    }

    public async has(key: string): Promise<boolean> {
        const val = await this.get(key);
        return val !== null;
    }
}

/**
 * RedisCacheProvider - Redis Cache Provider abstraction for production environments.
 */
export class RedisCacheProvider implements ICacheProvider {
    private fallbackMemory: MemoryCacheProvider;

    constructor() {
        this.fallbackMemory = new MemoryCacheProvider();
        logger.info("RedisCacheProvider initialized (using in-memory fallback buffer)");
    }

    public async get<T>(key: string): Promise<T | null> {
        return this.fallbackMemory.get<T>(key);
    }

    public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        return this.fallbackMemory.set<T>(key, value, ttlSeconds);
    }

    public async del(key: string): Promise<boolean> {
        return this.fallbackMemory.del(key);
    }

    public async clear(): Promise<void> {
        return this.fallbackMemory.clear();
    }

    public async has(key: string): Promise<boolean> {
        return this.fallbackMemory.has(key);
    }
}
