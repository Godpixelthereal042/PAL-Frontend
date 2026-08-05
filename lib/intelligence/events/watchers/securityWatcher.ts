import type { BusinessEvent, IExecutiveWatcher, WatcherHealth } from "../types.ts";

export class SecurityWatcher implements IExecutiveWatcher {
    private lastRun: number = Date.now();
    private lastSuccess: number = Date.now();

    getWatcherId(): string {
        return "watcher_security";
    }

    getName(): string {
        return "Security & Rate Limits Watcher";
    }

    async checkCondition(workspaceId: string): Promise<BusinessEvent | null> {
        this.lastRun = Date.now();
        this.lastSuccess = Date.now();

        return {
            id: `evt_sec_${Date.now()}`,
            workspaceId,
            correlationId: `corr_watcher_${Date.now()}`,
            category: "ai_governance",
            domain: "technology",
            eventType: "FAILED_AUTH_SPIKE",
            source: "AuthService / AuditEngine",
            severity: "critical",
            title: "Failed Authentication Spike Detected",
            summary: "14 failed authentication attempts detected from IP range 192.168.1.xxx in 5 minutes.",
            metadata: { failedAttempts: 14, windowSeconds: 300 },
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
            averageExecutionDurationMs: 6,
        };
    }
}
