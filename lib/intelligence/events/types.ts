/**
 * PAL Event Engine, Watchers & Timeline Types (PAL-TDD-002)
 */

export type EventSeverity = "info" | "medium" | "high" | "critical";
export type EventCategory = "business" | "connector" | "user" | "system" | "ai_governance";

export interface BusinessEvent {
    id: string;
    workspaceId: string;
    correlationId: string;
    category: EventCategory;
    domain: string;
    eventType: string;
    source: string;
    severity: EventSeverity;
    title: string;
    summary: string;
    metadata: Record<string, any>;
    status: "open" | "acknowledged" | "resolved";
    timestamp: number;
}

export interface WatcherHealth {
    watcherId: string;
    name: string;
    lastExecutionTimestamp: number;
    lastSuccessfulRun: number;
    lastFailure?: number;
    healthStatus: "healthy" | "degraded" | "failing";
    consecutiveFailures: number;
    averageExecutionDurationMs: number;
}

export interface IExecutiveWatcher {
    getWatcherId(): string;
    getName(): string;
    checkCondition(workspaceId: string): Promise<BusinessEvent | null>;
    getHealth(): WatcherHealth;
}

export interface IEventEngine {
    publishEvent(event: BusinessEvent): Promise<void>;
    registerWatcher(watcher: IExecutiveWatcher): void;
    executeWatchers(workspaceId: string): Promise<BusinessEvent[]>;
    getPriorityQueue(): BusinessEvent[];
}

export interface ITimelineEngine {
    logEvent(event: BusinessEvent): Promise<void>;
    getTimeline(
        workspaceId: string,
        category?: EventCategory,
        severity?: EventSeverity,
        limit?: number
    ): Promise<BusinessEvent[]>;
}
