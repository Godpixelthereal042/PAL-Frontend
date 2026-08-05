/**
 * Enterprise Connector Runtime Types (PAL-TDD-004, PAL-ARCH-DOC-026)
 */

import type { ExecutionContext } from "../runtime/types.ts";
import type { ToolContract } from "../tools/types.ts";

export type ConnectorStatus = "connected" | "disconnected" | "degraded" | "error" | "sandbox";

export interface ConnectorConnectionConfig {
    connectorId: string;
    workspaceId: string;
    authType: "oauth2" | "api_key" | "webhook_secret";
    credentials?: Record<string, any>;
    isSandbox?: boolean;
}

export interface ConnectionState {
    connectorId: string;
    workspaceId: string;
    status: ConnectorStatus;
    connectedAt: number;
    lastPingAt: number;
    errorDetails?: string;
}

export interface TokenRefreshResult {
    success: boolean;
    expiresAt?: number;
    errorDetails?: string;
}

export interface ConnectorHealthStatus {
    connectorId: string;
    status: ConnectorStatus;
    latencyMs: number;
    consecutiveFailures: number;
    lastCheckedAt: number;
    rateLimitRemaining?: number;
}

export interface WebhookVerificationResult {
    valid: boolean;
    reason?: string;
}

export interface IConnectorProvider {
    getConnectorId(): string;
    getName(): string;
    connect(config: ConnectorConnectionConfig): Promise<ConnectionState>;
    disconnect(): Promise<void>;
    refresh(): Promise<TokenRefreshResult>;
    health(): Promise<ConnectorHealthStatus>;
    discoverTools(): ToolContract[];
    executeTool(toolId: string, params: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>>;
    verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookVerificationResult>;
}
