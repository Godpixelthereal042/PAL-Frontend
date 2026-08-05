/**
 * Universal PAL Event Stream Types (PAL-TDD-004, PAL-ARCH-DOC-029)
 */

export type PalEventClassification =
    | "FinancialEvent"
    | "CommunicationEvent"
    | "EngineeringEvent"
    | "CRMEvent"
    | "SchedulingEvent"
    | "DocumentEvent"
    | "SecurityEvent"
    | "AutomationEvent";

export interface PalEvent<T = Record<string, any>> {
    id: string;
    version: number;
    source: string;
    connectorId: string;
    provider: string;
    eventType: string;
    classification: PalEventClassification;
    occurredAt: number;
    receivedAt: number;
    workspaceId: string;
    correlationId: string;
    causationId: string;
    payload: T;
}

export interface RawWebhookPayload {
    connectorId: string;
    headers: Record<string, string>;
    rawBody: string;
    parsedBody: Record<string, any>;
    workspaceId: string;
    correlationId?: string;
    causationId?: string;
}
