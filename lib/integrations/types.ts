/**
 * TypeScript Interfaces and Contracts for PAL Integration Framework
 *
 * PAL Milestone 4A — Integration Framework
 */

export type IntegrationProvider = string;

export type HealthStatusType = "healthy" | "degraded" | "unhealthy" | "disconnected";

export interface PermissionScope {
    id: string;
    name: string;
    description: string;
    requiredForOperations?: string[];
}

export interface AuthContext {
    integrationId?: string;
    provider: IntegrationProvider;
    userId: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: number;
    config?: Record<string, any>;
    grantedScopes: string[];
    status: "connected" | "disconnected" | "error" | "expired";
}

export interface ConnectorMetadata {
    id: string;
    provider: IntegrationProvider;
    name: string;
    version: string;
    description: string;
    supportedOperations: string[];
    requiredScopes: PermissionScope[];
}

export interface HealthCheckResult {
    status: HealthStatusType;
    latencyMs: number;
    message?: string;
    details?: Record<string, any>;
    checkedAt: number;
}

export interface ExecutionRequest<TParams = Record<string, any>> {
    provider: IntegrationProvider;
    connectorId?: string;
    operation: string;
    params: TParams;
    userId: string;
    metadata?: Record<string, any>;
}

export interface IntegrationError {
    code: string;
    message: string;
    details?: any;
    isRetryable?: boolean;
}

export interface ExecutionResponse<TData = any> {
    success: boolean;
    provider: IntegrationProvider;
    connectorId: string;
    operation: string;
    data?: TData;
    error?: IntegrationError;
    executionTimeMs: number;
    executedAt: number;
}

export interface AuditLogEntry {
    id: string;
    integrationId?: string;
    provider: IntegrationProvider;
    connectorId: string;
    userId: string;
    operation: string;
    status: "success" | "error" | "unauthorized";
    requestPayload?: string;
    responsePayload?: string;
    errorMessage?: string;
    executionTimeMs: number;
    createdAt: number;
}

export interface Connector {
    metadata: ConnectorMetadata;
    checkHealth(authContext: AuthContext): Promise<HealthCheckResult>;
    execute(request: ExecutionRequest, authContext: AuthContext): Promise<ExecutionResponse>;
    validatePermissions(operation: string, authContext: AuthContext): { valid: boolean; missingScopes: string[] };
}
