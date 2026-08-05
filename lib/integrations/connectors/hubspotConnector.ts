/**
 * HubSpot Connector Driver (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ConnectionState, ConnectorConnectionConfig, ConnectorHealthStatus, IConnectorProvider, TokenRefreshResult, WebhookVerificationResult } from "../connectorTypes.ts";
import type { ConnectorMetadata } from "../oauthVault.ts";
import type { ToolContract } from "../../tools/types.ts";
import type { ExecutionContext } from "../../runtime/types.ts";
import { HUBSPOT_TOOLS } from "../tools/hubspotTools.ts";

export class HubSpotConnector implements IConnectorProvider {
    private metadata: ConnectorMetadata = {
        connectorId: "hubspot",
        provider: "HubSpot CRM",
        version: "2.1.0",
        capabilities: ["crm:write", "crm:read"],
        requiredScopes: ["contacts", "crm.objects.deals.read"],
        supportedAuthMethods: ["oauth2", "api_key"],
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
        return { success: true, expiresAt: Date.now() + 18000000 };
    }

    async health(): Promise<ConnectorHealthStatus> {
        return {
            connectorId: this.getConnectorId(),
            status: "connected",
            latencyMs: 16,
            consecutiveFailures: 0,
            lastCheckedAt: Date.now(),
            rateLimitRemaining: 150
        };
    }

    discoverTools(): ToolContract[] {
        return HUBSPOT_TOOLS;
    }

    async executeTool(toolId: string, params: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
        return {
            contactId: `hs_contact_${Date.now()}`,
            email: params.email,
            status: "created",
            isSandbox: true
        };
    }

    async verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookVerificationResult> {
        return { valid: Boolean(headers["x-hubspot-signature"]) };
    }
}
