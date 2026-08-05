/**
 * Subscription Tier & Usage Billing Engine (PAL-TDD-006, Sprint 9)
 *
 * Manages SaaS monetization plans (Free, Pro, Business), tracks usage quotas,
 * and enforces usage limits per workspace.
 */

export type SubscriptionTier = "free" | "pro" | "business";

export interface TierLimits {
    maxStrategySessionsPerMonth: number;
    maxConnectedTools: number;
    maxWorkspaceMembers: number;
    hasAdvancedReasoning: boolean;
    hasCustomPolicies: boolean;
    priceUSDPerMonth: number;
}

export interface WorkspaceSubscription {
    workspaceId: string;
    tier: SubscriptionTier;
    status: "active" | "past_due" | "canceled";
    currentPeriodStartedAt: number;
    currentPeriodEndsAt: number;
    sessionsUsedThisMonth: number;
}

export class SubscriptionEngine {
    private static instance: SubscriptionEngine;
    private subscriptions: Map<string, WorkspaceSubscription> = new Map();

    private tierConfigs: Record<SubscriptionTier, TierLimits> = {
        free: {
            maxStrategySessionsPerMonth: 10,
            maxConnectedTools: 2,
            maxWorkspaceMembers: 2,
            hasAdvancedReasoning: false,
            hasCustomPolicies: false,
            priceUSDPerMonth: 0
        },
        pro: {
            maxStrategySessionsPerMonth: 200,
            maxConnectedTools: 10,
            maxWorkspaceMembers: 10,
            hasAdvancedReasoning: true,
            hasCustomPolicies: true,
            priceUSDPerMonth: 99
        },
        business: {
            maxStrategySessionsPerMonth: 10000, // Unlimited
            maxConnectedTools: 50,
            maxWorkspaceMembers: 50,
            hasAdvancedReasoning: true,
            hasCustomPolicies: true,
            priceUSDPerMonth: 499
        }
    };

    public static getInstance(): SubscriptionEngine {
        if (!SubscriptionEngine.instance) {
            SubscriptionEngine.instance = new SubscriptionEngine();
        }
        return SubscriptionEngine.instance;
    }

    public getSubscription(workspaceId: string): WorkspaceSubscription {
        let sub = this.subscriptions.get(workspaceId);
        if (!sub) {
            const now = Date.now();
            sub = {
                workspaceId,
                tier: "pro", // Default beta workspace tier set to Pro for testing
                status: "active",
                currentPeriodStartedAt: now,
                currentPeriodEndsAt: now + 30 * 86400 * 1000,
                sessionsUsedThisMonth: 0
            };
            this.subscriptions.set(workspaceId, sub);
        }
        return sub;
    }

    public getTierLimits(tier: SubscriptionTier): TierLimits {
        return this.tierConfigs[tier];
    }

    public checkQuota(workspaceId: string): { allowed: boolean; remainingSessions: number; limit: number } {
        const sub = this.getSubscription(workspaceId);
        const limits = this.getTierLimits(sub.tier);
        const remaining = Math.max(0, limits.maxStrategySessionsPerMonth - sub.sessionsUsedThisMonth);

        return {
            allowed: remaining > 0,
            remainingSessions: remaining,
            limit: limits.maxStrategySessionsPerMonth
        };
    }

    public recordSessionUsage(workspaceId: string): boolean {
        const quota = this.checkQuota(workspaceId);
        if (!quota.allowed) return false;

        const sub = this.getSubscription(workspaceId);
        sub.sessionsUsedThisMonth += 1;
        this.subscriptions.set(workspaceId, sub);
        return true;
    }

    public upgradeTier(workspaceId: string, newTier: SubscriptionTier): WorkspaceSubscription {
        const sub = this.getSubscription(workspaceId);
        sub.tier = newTier;
        sub.status = "active";
        this.subscriptions.set(workspaceId, sub);
        return sub;
    }
}
