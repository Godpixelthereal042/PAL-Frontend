/**
 * Product Analytics & Activation Tracker (PAL-TDD-006, Sprint 8 Milestone 4)
 *
 * Tracks user activation, first Golden Path executions, connected integrations,
 * human approval sign-offs, and product retention signals.
 */

export interface AnalyticsEvent {
    eventId: string;
    workspaceId: string;
    userId: string;
    eventType:
        | "user_onboarding_completed"
        | "first_golden_path_executed"
        | "golden_path_executed"
        | "integration_connected"
        | "proposal_approved"
        | "proposal_rejected"
        | "demo_reset_executed";
    metadata?: Record<string, any>;
    timestamp: number;
}

export interface AdminMetricsSummary {
    totalWorkspaces: number;
    totalActivatedUsers: number;
    totalGoldenPathExecutions: number;
    totalApprovalsProcessed: number;
    totalIntegrationsConnected: number;
    averageReasoningLatencyMs: number;
}

export class ProductAnalytics {
    private static instance: ProductAnalytics;
    private events: AnalyticsEvent[] = [];

    public static getInstance(): ProductAnalytics {
        if (!ProductAnalytics.instance) {
            ProductAnalytics.instance = new ProductAnalytics();
        }
        return ProductAnalytics.instance;
    }

    public trackEvent(event: Omit<AnalyticsEvent, "eventId" | "timestamp">): AnalyticsEvent {
        const fullEvent: AnalyticsEvent = {
            ...event,
            eventId: `evt_an_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now()
        };
        this.events.push(fullEvent);
        return fullEvent;
    }

    public getEvents(workspaceId?: string): AnalyticsEvent[] {
        if (!workspaceId) return this.events;
        return this.events.filter(e => e.workspaceId === workspaceId);
    }

    public getAdminMetricsSummary(): AdminMetricsSummary {
        const uniqueWorkspaces = new Set(this.events.map(e => e.workspaceId)).size;
        const uniqueUsers = new Set(this.events.map(e => e.userId)).size;
        const goldenPathExecs = this.events.filter(e => e.eventType === "golden_path_executed" || e.eventType === "first_golden_path_executed").length;
        const approvals = this.events.filter(e => e.eventType === "proposal_approved" || e.eventType === "proposal_rejected").length;
        const integrations = this.events.filter(e => e.eventType === "integration_connected").length;

        return {
            totalWorkspaces: Math.max(1, uniqueWorkspaces),
            totalActivatedUsers: Math.max(1, uniqueUsers),
            totalGoldenPathExecutions: goldenPathExecs,
            totalApprovalsProcessed: approvals,
            totalIntegrationsConnected: integrations,
            averageReasoningLatencyMs: 125
        };
    }

    public resetDemoWorkspace(workspaceId: string): void {
        this.events = this.events.filter(e => e.workspaceId !== workspaceId);
        this.trackEvent({
            workspaceId,
            userId: "system",
            eventType: "demo_reset_executed",
            metadata: { resetAt: Date.now() }
        });
    }
}
