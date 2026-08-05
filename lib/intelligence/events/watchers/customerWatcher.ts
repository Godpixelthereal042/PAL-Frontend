import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class CustomerWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_customer";
    }

    getName(): string {
        return "Customer Churn Risk Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        return {
            id: `evt_cust_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "business",
            domain: "support",
            eventType: "HIGH_TIER_TICKET_OPEN",
            source: "Zendesk Connector",
            severity: "high",
            title: "Tier-1 Customer Ticket Open > 24 Hours",
            summary: "Unresolved support ticket for Enterprise Account 'Globex Corp'.",
            metadata: { customerTier: "enterprise", ticketAgeHours: 26 },
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
            averageExecutionDurationMs: 14,
        };
    }
}
