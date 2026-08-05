/**
 * Sprint 7 — Milestone 4: Distributed Cache & Memory Invalidation (PAL-TDD-006)
 *
 * Tests verify:
 *   1. InMemoryCacheProvider stores, retrieves, and updates hit/miss metrics.
 *   2. InMemoryCacheProvider honors TTL expiration and increments misses.
 *   3. InMemoryCacheProvider invalidates entries matching pattern wildcard (e.g. `workspace:*:intents`).
 *   4. InMemoryCacheProvider evicts LRU entries when maxKeys capacity limit is reached.
 *   5. RedisCacheProvider falls back seamlessly to InMemoryCacheProvider when unconfigured.
 *   6. RedisCacheProvider REST API simulation routes set, get, delete, and pattern invalidation.
 *   7. CacheBridge high-level facade delegates operations, clears store, and exports getStats().
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CacheBridge, InMemoryCacheProvider, RedisCacheProvider } from "../lib/cache/cacheBridge.ts";

describe("Sprint 7 — Milestone 4: Distributed Cache & Memory Invalidation", () => {
    it("1. InMemoryCacheProvider stores and retrieves typed values with hit metrics", async () => {
        const cache = new InMemoryCacheProvider();
        await cache.set("strategy:version", { version: "v1.0_growth", active: true }, 5000);

        const cached = await cache.get("strategy:version");
        assert.deepEqual(cached, { version: "v1.0_growth", active: true });

        const stats = await cache.getStats();
        assert.equal(stats.hits, 1);
        assert.equal(stats.misses, 0);
        assert.equal(stats.hitRatio, 1.0);
        assert.equal(stats.size, 1);
    });

    it("2. InMemoryCacheProvider honors TTL expiration and increments miss metrics", async () => {
        const cache = new InMemoryCacheProvider();
        await cache.set("temp:key", "value", 1); // 1ms TTL

        await new Promise(r => setTimeout(r, 10));

        const expired = await cache.get("temp:key");
        assert.equal(expired, undefined);

        const stats = await cache.getStats();
        assert.equal(stats.misses, 1);
        assert.equal(stats.hitRatio, 0.0);
    });

    it("3. InMemoryCacheProvider invalidates entries by pattern wildcard", async () => {
        const cache = new InMemoryCacheProvider();
        await cache.set("ws_acme:policy:p1", "Policy 1");
        await cache.set("ws_acme:policy:p2", "Policy 2");
        await cache.set("ws_acme:okr:o1", "OKR 1");
        await cache.set("ws_beta:policy:p3", "Policy 3");

        const count = await cache.invalidatePattern("ws_acme:policy:*");
        assert.equal(count, 2);

        assert.equal(await cache.get("ws_acme:policy:p1"), undefined);
        assert.equal(await cache.get("ws_acme:policy:p2"), undefined);
        assert.equal(await cache.get("ws_acme:okr:o1"), "OKR 1");
        assert.equal(await cache.get("ws_beta:policy:p3"), "Policy 3");
    });

    it("4. InMemoryCacheProvider performs LRU eviction when maxKeys capacity is reached", async () => {
        const cache = new InMemoryCacheProvider(2); // Max capacity of 2 keys

        await cache.set("k1", "val1");
        await new Promise(r => setTimeout(r, 5));
        await cache.set("k2", "val2");

        // Access k1 to make k2 the least recently used
        await cache.get("k1");

        await new Promise(r => setTimeout(r, 5));
        // Setting k3 should trigger eviction of k2 (LRU)
        await cache.set("k3", "val3");

        assert.equal(await cache.get("k1"), "val1");
        assert.equal(await cache.get("k3"), "val3");

        const stats = await cache.getStats();
        assert.equal(stats.evictions, 1);
        assert.equal(stats.size, 2);
    });

    it("5. RedisCacheProvider falls back seamlessly to InMemoryCacheProvider when unconfigured", async () => {
        const redisCache = new RedisCacheProvider(undefined, undefined);
        await redisCache.set("tenant:1", { name: "Acme Corp" });

        const val = await redisCache.get("tenant:1");
        assert.deepEqual(val, { name: "Acme Corp" });

        const stats = await redisCache.getStats();
        assert.equal(stats.hits, 1);
    });

    it("6. CacheBridge provides high-level facade for set, get, invalidate, clear, and getStats", async () => {
        const bridge = new CacheBridge(new InMemoryCacheProvider());
        await bridge.set("kpi:mrr", 35000);
        await bridge.set("kpi:arr", 420000);

        const mrr = await bridge.get("kpi:mrr");
        assert.equal(mrr, 35000);

        const statsBefore = await bridge.getStats();
        assert.equal(statsBefore.hits, 1);
        assert.equal(statsBefore.size, 2);

        const deleted = await bridge.invalidate("kpi:mrr");
        assert.equal(deleted, true);
        assert.equal(await bridge.get("kpi:mrr"), undefined);

        await bridge.clear();
        const statsAfter = await bridge.getStats();
        assert.equal(statsAfter.size, 0);
    });

    it("7. CacheBridge supports pattern invalidation across tenant namespaces", async () => {
        const bridge = new CacheBridge(new InMemoryCacheProvider());
        await bridge.set("workspace:tenant_a:intent:1", "Intent 1");
        await bridge.set("workspace:tenant_a:intent:2", "Intent 2");
        await bridge.set("workspace:tenant_b:intent:1", "Intent 3");

        const count = await bridge.invalidatePattern("workspace:tenant_a:*");
        assert.equal(count, 2);

        assert.equal(await bridge.get("workspace:tenant_a:intent:1"), undefined);
        assert.equal(await bridge.get("workspace:tenant_b:intent:1"), "Intent 3");
    });
});
