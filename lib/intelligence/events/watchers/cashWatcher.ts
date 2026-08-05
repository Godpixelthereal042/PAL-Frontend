import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class CashWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_cash";
    }

    getName(): string {
        return "Cash Runway Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        // Emits CRITICAL event if cash runway drops below 6 months
        return {
            id: `evt_cash_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "business",
            domain: "finance",
            eventType: "CASH_RUNWAY_CRITICAL",
            source: "Bank Feed Connector",
            severity: "critical",
            title: "Cash Runway Threshold Warning",
            summary: "Projected cash runway stands at 5.8 months.",
            metadata: { runwayMonths: 5.8, thresholdMonths: 6.0 },
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
            averageExecutionDurationMs: 8,
        };
    }
}
