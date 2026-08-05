import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class HiringWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_hiring";
    }

    getName(): string {
        return "Hiring Pipeline Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        return {
            id: `evt_hr_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "business",
            domain: "hr",
            eventType: "EXECUTIVE_REQ_OPEN",
            source: "Greenhouse Connector",
            severity: "medium",
            title: "Executive Role Open > 45 Days",
            summary: "Requisition 'VP Engineering' open for 48 days without offer extension.",
            metadata: { roleName: "VP Engineering", openDays: 48 },
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
            averageExecutionDurationMs: 9,
        };
    }
}
