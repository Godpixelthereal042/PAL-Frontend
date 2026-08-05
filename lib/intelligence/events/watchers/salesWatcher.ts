import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class SalesWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_sales";
    }

    getName(): string {
        return "Sales Deal Velocity Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        return {
            id: `evt_sales_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "business",
            domain: "sales",
            eventType: "DEAL_STALLED_WARNING",
            source: "Salesforce Connector",
            severity: "medium",
            title: "Enterprise Deal Stalled > 14 Days",
            summary: "Enterprise opportunity 'Acme Corp Renewal' ($120k ARR) stalled in Contract Review stage.",
            metadata: { dealId: "deal_123", stalledDays: 16 },
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
            averageExecutionDurationMs: 15,
        };
    }
}
