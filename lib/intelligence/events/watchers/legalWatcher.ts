import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class LegalWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_legal";
    }

    getName(): string {
        return "Legal & Contract Expiration Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        return {
            id: `evt_legal_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "business",
            domain: "legal",
            eventType: "VENDOR_CONTRACT_EXPIRING",
            source: "Ironclad Connector",
            severity: "medium",
            title: "Key Vendor Contract Expiring < 30 Days",
            summary: "AWS Enterprise Master Agreement expires in 28 days.",
            metadata: { vendorName: "Amazon Web Services", daysRemaining: 28 },
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
            averageExecutionDurationMs: 11,
        };
    }
}
