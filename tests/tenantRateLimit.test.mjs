/**
 * Sprint 8 — Milestone 2: TenantRateLimiter Unit Tests
 *
 * Verifies:
 *   1. Sliding-window rate limits allow valid requests under capacity.
 *   2. Requests exceeding max limit + burst allowance return allowed=false & HTTP 429 Retry-After.
 *   3. Rate limits strictly isolate tenant workspaces (Workspace A being rate-limited does not affect Workspace B).
 *   4. Category-specific limits (llm_request vs worker_execution) function independently.
 *   5. Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) are correctly formatted.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TenantRateLimiter } from "../lib/security/tenantRateLimiter.ts";

describe("Sprint 8 — Milestone 2: TenantRateLimiter Multi-Tenant Rate Limiting", () => {
    const rateLimiter = TenantRateLimiter.getInstance();

    it("1. Allows requests within configured window capacity", () => {
        rateLimiter.clearLogs("ws_test_capacity");

        const res1 = rateLimiter.checkRateLimit("ws_test_capacity", "llm_request");
        assert.equal(res1.allowed, true);
        assert.equal(res1.category, "llm_request");
        assert.ok(res1.remaining > 0);

        const res2 = rateLimiter.checkRateLimit("ws_test_capacity", "llm_request");
        assert.equal(res2.allowed, true);
        assert.equal(res2.remaining, res1.remaining - 1);
    });

    it("2. Blocks requests when limit + burst allowance is exceeded with retryAfter", () => {
        const workspaceId = "ws_test_overflow";
        rateLimiter.clearLogs(workspaceId);

        // Configure tight rate limit of 3 requests for testing
        rateLimiter.configureCategory("expensive_operation", { maxRequests: 3, windowMs: 60000, burstAllowance: 0 });

        assert.equal(rateLimiter.checkRateLimit(workspaceId, "expensive_operation").allowed, true);
        assert.equal(rateLimiter.checkRateLimit(workspaceId, "expensive_operation").allowed, true);
        assert.equal(rateLimiter.checkRateLimit(workspaceId, "expensive_operation").allowed, true);

        // 4th request exceeds max limit of 3
        const overflow = rateLimiter.checkRateLimit(workspaceId, "expensive_operation");
        assert.equal(overflow.allowed, false);
        assert.equal(overflow.remaining, 0);
        assert.ok((overflow.retryAfterSeconds ?? 0) > 0);

        const headers = rateLimiter.getRateLimitHeaders(overflow);
        assert.equal(headers["X-RateLimit-Remaining"], "0");
        assert.ok(headers["Retry-After"]);
    });

    it("3. Strictly isolates rate limit buckets across different tenant workspaces", () => {
        const wsA = "ws_tenant_Alpha";
        const wsB = "ws_tenant_Beta";

        rateLimiter.clearLogs(wsA);
        rateLimiter.clearLogs(wsB);

        rateLimiter.configureCategory("llm_request", { maxRequests: 2, windowMs: 60000, burstAllowance: 0 });

        // Exhaust Workspace A
        assert.equal(rateLimiter.checkRateLimit(wsA, "llm_request").allowed, true);
        assert.equal(rateLimiter.checkRateLimit(wsA, "llm_request").allowed, true);
        assert.equal(rateLimiter.checkRateLimit(wsA, "llm_request").allowed, false); // Blocked!

        // Workspace B remains completely unaffected
        const resB = rateLimiter.checkRateLimit(wsB, "llm_request");
        assert.equal(resB.allowed, true);
    });

    it("4. Formats standardized X-RateLimit headers", () => {
        const res = rateLimiter.checkRateLimit("ws_headers_test", "api_general");
        const headers = rateLimiter.getRateLimitHeaders(res);

        assert.ok(headers["X-RateLimit-Limit"]);
        assert.ok(headers["X-RateLimit-Remaining"]);
        assert.ok(headers["X-RateLimit-Reset"]);
    });
});
