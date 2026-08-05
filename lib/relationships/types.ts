export type BuiltInRelationshipType =
    | "Client"
    | "Investor"
    | "Team Member"
    | "Partner"
    | "Vendor"
    | "Advisor"
    | "Mentor"
    | "Lead"
    | "Prospect"
    | "Community Member";

export type RelationshipType = BuiltInRelationshipType | string;

export type InteractionSource =
    | "calendar"
    | "workflow"
    | "decision"
    | "notes"
    | "notification"
    | "manual"
    | "email"
    | "slack"
    | "crm"
    | "whatsapp"
    | "phone";

export type InteractionType =
    | "meeting"
    | "call"
    | "email"
    | "chat"
    | "decision"
    | "workflow"
    | "note"
    | "invoice"
    | "follow_up";

export interface Person {
    id: string;
    userId: string;
    name: string;
    role?: string;
    organizationId?: string;
    email?: string;
    phone?: string;
    relationshipType: RelationshipType;
    tags: string[];
    notes?: string;
    lastInteraction?: number;
    createdAt: number;
    updatedAt: number;
    metadata?: Record<string, any>;
}

export interface Organization {
    id: string;
    userId: string;
    name: string;
    industry?: string;
    website?: string;
    description?: string;
    relationshipStrength: "strong" | "healthy" | "at_risk" | "inactive";
    notes?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Interaction {
    id: string;
    personId: string;
    userId: string;
    type: InteractionType;
    summary: string;
    source: InteractionSource;
    timestamp: number;
    followUpDate?: string;
    metadata?: Record<string, any>;
}

export interface RelationshipScore {
    personId: string;
    score: number; // 0 - 100
    status: "strong" | "healthy" | "at_risk" | "inactive";
    trend: "improving" | "stable" | "declining";
    confidence: number; // 0 - 100
    explanation: string;
    updatedAt: number;
}

export interface RelationshipInsight {
    id: string;
    personId: string;
    personName: string;
    organizationName?: string;
    relationshipType: RelationshipType;
    category:
        | "overdue_follow_up"
        | "inactive_client"
        | "investor_attention"
        | "at_risk"
        | "strong_momentum"
        | "key_contact";
    title: string;
    description: string;
    supportingData: string[];
    severity: "low" | "medium" | "high" | "critical";
}

export interface TimelineEvent {
    id: string;
    personId: string;
    eventType:
        | "relationship_created"
        | "interaction"
        | "meeting"
        | "decision"
        | "task"
        | "invoice"
        | "workflow";
    summary: string;
    timestamp: number;
    details?: Record<string, any>;
}

export interface RelationshipFilter {
    name?: string;
    organizationId?: string;
    relationshipType?: RelationshipType;
    tag?: string;
    query?: string;
}

export interface RelationshipContext {
    people: Array<{
        id: string;
        name: string;
        role?: string;
        organizationName?: string;
        relationshipType: string;
        lastInteractionDaysAgo?: number;
        score?: number;
        status?: string;
        pendingFollowUp?: string;
    }>;
    insights: RelationshipInsight[];
    totalPeople: number;
    atRiskCount: number;
    overdueFollowUpCount: number;
}
