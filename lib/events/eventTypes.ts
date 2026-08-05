/**
 * Event-Driven Agent Framework - TypeScript Contracts
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

export type ExecutiveEventType =
    | "project_updated"
    | "invoice_overdue"
    | "calendar_changed"
    | "workflow_failed"
    | "relationship_declined"
    | "health_score_dropped"
    | "commitment_missed";

export type EventSeverity = "low" | "medium" | "high" | "critical";

export interface ExecutiveEvent {
    id: string;
    type: ExecutiveEventType;
    severity: EventSeverity;
    businessImpact: string;
    confidence: number;
    urgency: "low" | "medium" | "high" | "immediate";
    source: string;
    timestamp: number;
    relatedEntities?: {
        projectId?: string;
        personId?: string;
        invoiceId?: string;
        workflowId?: string;
    };
    payload?: any;
}

export interface EventWatcher {
    id: string;
    name: string;
    agentRole: string;
    eventTypes: ExecutiveEventType[];
    enabled: boolean;
}
