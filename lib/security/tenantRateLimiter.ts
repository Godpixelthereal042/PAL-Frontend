/**
 * Workspace Sliding-Window Tenant Rate Limiter (PAL-TDD-006, Sprint 8 Milestone 2)
 *
 * Enforces multi-tenant sliding-window API rate limits per workspace across request categories:
 *   - LLM Reasoning requests
 *   - Worker Agent executions
 *   - SaaS Connector calls
 *   - High-cost / Expensive operations
 *   - General API routes
 */

export type RateLimitCategory =
    | "llm_request"
    | "worker_execution"
    | "connector_call"
    | "expensive_operation"
    | "api_general";

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number; // e.g. 60000 (1 minute)
    burstAllowance?: number;
}

export interface RateLimitResult {
    allowed: boolean;
    workspaceId: string;
    category: RateLimitCategory;
    limit: number;
    remaining: number;
    resetMs: number;
    retryAfterSeconds?: number;
}

export class TenantRateLimiter {
    private static instance: TenantRateLimiter;
    private requestLogs: Map<string, number[]> = new Map(); // key: workspaceId:category -> array of timestamps

    // Category default limits per workspace per 60s window
    private categoryConfigs: Record<RateLimitCategory, RateLimitConfig> = {
        llm_request: { maxRequests: 30, windowMs: 60000, burstAllowance: 5 },
        worker_execution: { maxRequests: 60, windowMs: 60000, burstAllowance: 10 },
        connector_call: { maxRequests: 100, windowMs: 60000, burstAllowance: 20 },
        expensive_operation: { maxRequests: 10, windowMs: 60000, burstAllowance: 2 },
        api_general: { maxRequests: 120, windowMs: 60000, burstAllowance: 30 }
    };

    constructor(customConfigs?: Partial<Record<RateLimitCategory, RateLimitConfig>>) {
        if (customConfigs) {
            Object.assign(this.categoryConfigs, customConfigs);
        }
    }

    public static getInstance(): TenantRateLimiter {
        if (!TenantRateLimiter.instance) {
            TenantRateLimiter.instance = new TenantRateLimiter();
        }
        return TenantRateLimiter.instance;
    }

    public configureCategory(category: RateLimitCategory, config: RateLimitConfig): void {
        this.categoryConfigs[category] = config;
    }

    public checkRateLimit(workspaceId: string, category: RateLimitCategory = "api_general"): RateLimitResult {
        const now = Date.now();
        const config = this.categoryConfigs[category] || this.categoryConfigs.api_general;
        const maxLimit = config.maxRequests + (config.burstAllowance || 0);
        const windowMs = config.windowMs;

        const key = `${workspaceId}:${category}`;
        const timestamps = this.requestLogs.get(key) || [];

        // Prune timestamps older than the sliding window
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

        if (validTimestamps.length >= maxLimit) {
            const oldestInWindow = validTimestamps[0];
            const resetMs = Math.max(0, windowMs - (now - oldestInWindow));
            const retryAfterSeconds = Math.ceil(resetMs / 1000);

            this.requestLogs.set(key, validTimestamps);

            return {
                allowed: false,
                workspaceId,
                category,
                limit: config.maxRequests,
                remaining: 0,
                resetMs,
                retryAfterSeconds
            };
        }

        // Record current request timestamp
        validTimestamps.push(now);
        this.requestLogs.set(key, validTimestamps);

        const remaining = Math.max(0, maxLimit - validTimestamps.length);
        const oldestInWindow = validTimestamps[0] || now;
        const resetMs = Math.max(0, windowMs - (now - oldestInWindow));

        return {
            allowed: true,
            workspaceId,
            category,
            limit: config.maxRequests,
            remaining,
            resetMs
        };
    }

    public getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
        const headers: Record<string, string> = {
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(Math.ceil(result.resetMs / 1000))
        };

        if (!result.allowed && result.retryAfterSeconds) {
            headers["Retry-After"] = String(result.retryAfterSeconds);
        }

        return headers;
    }

    public clearLogs(workspaceId?: string): void {
        if (!workspaceId) {
            this.requestLogs.clear();
            return;
        }

        for (const key of this.requestLogs.keys()) {
            if (key.startsWith(`${workspaceId}:`)) {
                this.requestLogs.delete(key);
            }
        }
    }
}
