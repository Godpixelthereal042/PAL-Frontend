/**
 * Enterprise Connectivity Framework - TypeScript Contracts
 *
 * PAL Milestone 8C — Enterprise Connectivity Framework
 */

export type AuthType = "oauth2" | "api_key" | "service_account";

export type ConnectorStatus = "connected" | "disconnected" | "error" | "reauthenticating";

export interface ConnectorMetadata {
    id: string;
    name: string;
    version: string;
    category: string;
    authType: AuthType;
    description: string;
    icon?: string;
    scopes: string[];
    supportedEvents: string[];
    supportedActions: string[];
}

export interface ConnectorHealth {
    status: "healthy" | "degraded" | "error";
    lastSyncTimestamp?: number;
    errorRate: number; // 0.0 to 1.0
    quotaUsed: number;
    quotaLimit: number;
    rateLimitRemaining?: number;
    lastErrorMsg?: string;
}

export interface ConnectorAuthCredentials {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    apiKey?: string;
    serviceAccountJson?: string;
    scopes: string[];
}

export interface ConnectorEventPayload {
    eventType: string;
    source: string;
    payload: any;
    timestamp: number;
    relatedEntities?: {
        projectId?: string;
        personId?: string;
        invoiceId?: string;
        workflowId?: string;
    };
}

export interface ConnectorActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    executionTimeMs: number;
}
