import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class RiskWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_risk";
    }

    getName(): string {
        return "Operational Risk Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        return {
            id: `evt_risk_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "system",
            domain: "technology",
            eventType: "ERROR_RATE_ELEVATED",
            source: "Sentry / Datadog Connector",
            severity: "high",
            title: "Elevated Error Rate Spike",
            summary: "API error rate spiked to 1.4% following deployment v2.4.1.",
            metadata: { errorRate: 0.014, threshold: 0.01 },
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
            averageExecutionDurationMs: 10,
        };
    }
}
