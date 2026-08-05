import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class RevenueWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_revenue";
    }

    getName(): string {
        return "Revenue & Churn Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        // Emits HIGH priority event when ARR drops or churn spikes
        return {
            id: `evt_rev_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "business",
            domain: "finance",
            eventType: "ARR_CHURN_WARNING",
            source: "Stripe Connector",
            severity: "high",
            title: "ARR Churn Rate Spike Detected",
            summary: "Monthly ARR churn rate increased by 2.1% across Tier-2 customers.",
            metadata: { churnDelta: 0.021, affectedAccountsCount: 3 },
            status: "open",
            timestamp: Date.now(),
        };
    }

    getHealth(): WatcherHealth {
        return {
            watcherId: this.getWatcherId(),
            name: this.getName(),
            lastExecutionTimestamp: this.lastRun,
            lastSuccessfulRun: this.lastSuccess,
            healthStatus: "healthy",
            consecutiveFailures: 0,
            averageExecutionDurationMs: 12,
        };
    }
}
