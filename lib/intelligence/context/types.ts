/**
 * PAL Executive Context Engine Types (PAL-TDD-002)
 */

export interface ContextFreshnessMetadata {
    source: string;
    lastUpdated: number; // unix ms
    confidenceLevel: number; // 0.0 - 1.0
    stalenessIndicator: "fresh" | "degraded" | "stale";
    refreshPolicy: "realtime" | "hourly" | "daily";
}

export interface PersistentContext {
    companyProfile: { name: string; industry: string; stage: string };
    governancePolicies: string[];
    objectivesSummary: string[];
    freshness: ContextFreshnessMetadata;
}

export interface OperationalContext {
    worldModelSummary: {
        runwayMonths: number;
        arr: number;
        openIncidents: number;
        sprintProgress: number;
    };
    activeProjects: Array<{ name: string; status: string; progress: number }>;
    urgentApprovalsCount: number;
    freshness: ContextFreshnessMetadata;
}

export interface ConversationalContext {
    recentMessages: Array<{ sender: string; text: string; timestamp: number }>;
    currentDomainFocus?: string;
    freshness: ContextFreshnessMetadata;
}

export interface EnvironmentalContext {
    timezone: string;
    currentTime: number;
    userLocation?: string;
    calendarEvents: Array<{ title: string; startTime: number; attendees: string[] }>;
    freshness: ContextFreshnessMetadata;
}

export interface ExternalContext {
    connectorStatuses: Record<string, "healthy" | "degraded" | "disconnected">;
    marketSignalsSummary?: string[];
    freshness: ContextFreshnessMetadata;
}

export interface LayeredExecutiveContext {
    workspaceId: string;
    timestamp: number;
    persistent: PersistentContext;
    operational: OperationalContext;
    conversational: ConversationalContext;
    environmental: EnvironmentalContext;
    external: ExternalContext;
    tokenBudgetUsage: {
        totalTokensAllocated: number;
        totalTokensUsed: number;
        isBudgetTruncated: boolean;
    };
}

export interface IContextEngine {
    getUnifiedContext(
        workspaceId: string,
        domainFocus?: string,
        maxTokenBudget?: number
    ): Promise<LayeredExecutiveContext>;
}
