/**
 * Gmail Connector Driver (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ConnectionState, ConnectorConnectionConfig, ConnectorHealthStatus, IConnectorProvider, TokenRefreshResult, WebhookVerificationResult } from "../connectorTypes.ts";
import type { ConnectorMetadata } from "../oauthVault.ts";
import type { ToolContract } from "../../tools/types.ts";
import type { ExecutionContext } from "../../runtime/types.ts";
import { GMAIL_TOOLS } from "../tools/gmailTools.ts";

export class GmailConnector implements IConnectorProvider {
    private metadata: ConnectorMetadata = {
        connectorId: "gmail",
        provider: "Google Workspace",
        version: "1.2.0",
        capabilities: ["email.send", "email.read"],
        requiredScopes: ["https://www.googleapis.com/auth/gmail.send"],
        supportedAuthMethods: ["oauth2"],
        supportsSandbox: true,
        supportsWebhooks: true,
        supportsStreaming: false,
        supportsToolDiscovery: true,
        supportsRefresh: true
    };

    getConnectorId(): string {
        return this.metadata.connectorId;
    }

    getName(): string {
        return this.metadata.provider;
    }

    getMetadata(): ConnectorMetadata {
        return this.metadata;
    }

    async connect(config: ConnectorConnectionConfig): Promise<ConnectionState> {
        return {
            connectorId: this.getConnectorId(),
            workspaceId: config.workspaceId,
            status: config.isSandbox !== false ? "sandbox" : "connected",
            connectedAt: Date.now(),
            lastPingAt: Date.now()
        };
    }

    async disconnect(): Promise<void> {}

    async refresh(): Promise<TokenRefreshResult> {
        return { success: true, expiresAt: Date.now() + 3600000 };
    }

    async health(): Promise<ConnectorHealthStatus> {
        return {
            connectorId: this.getConnectorId(),
            status: "connected",
            latencyMs: 14,
            consecutiveFailures: 0,
            lastCheckedAt: Date.now(),
            rateLimitRemaining: 250
        };
    }

    discoverTools(): ToolContract[] {
        return GMAIL_TOOLS;
    }

    async executeTool(toolId: string, params: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
        if (toolId === "google_workspace.send_email") {
            return {
                messageId: `msg_gmail_${Date.now()}`,
                recipient: params.recipient,
                subject: params.subject,
                status: "sent",
                isSandbox: true
            };
        }
        return { messages: [{ id: `msg_inbox_${Date.now()}`, snippet: "Sample email content" }] };
    }

    async verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookVerificationResult> {
        return { valid: Boolean(headers["x-goog-signature"] || headers["authorization"]) };
    }
}
