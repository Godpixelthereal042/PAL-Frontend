/**
 * Stripe Connector Driver (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ConnectionState, ConnectorConnectionConfig, ConnectorHealthStatus, IConnectorProvider, TokenRefreshResult, WebhookVerificationResult } from "../connectorTypes.ts";
import type { ConnectorMetadata } from "../oauthVault.ts";
import type { ToolContract } from "../../tools/types.ts";
import type { ExecutionContext } from "../../runtime/types.ts";
import { STRIPE_TOOLS } from "../tools/stripeTools.ts";

export class StripeConnector implements IConnectorProvider {
    private metadata: ConnectorMetadata = {
        connectorId: "stripe",
        provider: "Stripe Payments",
        version: "2.0.0",
        capabilities: ["stripe:write", "stripe:read"],
        requiredScopes: ["read_write"],
        supportedAuthMethods: ["api_key", "oauth2"],
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
        return { success: true, expiresAt: Date.now() + 86400000 };
    }

    async health(): Promise<ConnectorHealthStatus> {
        return {
            connectorId: this.getConnectorId(),
            status: "connected",
            latencyMs: 18,
            consecutiveFailures: 0,
            lastCheckedAt: Date.now(),
            rateLimitRemaining: 100
        };
    }

    discoverTools(): ToolContract[] {
        return STRIPE_TOOLS;
    }

    async executeTool(toolId: string, params: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
        if (toolId === "stripe.refund_payment") {
            return {
                refundId: `re_stripe_${Date.now()}`,
                chargeId: params.chargeId,
                amountUSD: params.amountUSD,
                status: "succeeded",
                isSandbox: true
            };
        }
        return { invoiceId: `in_stripe_${Date.now()}`, customerId: params.customerId, status: "draft" };
    }

    async verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookVerificationResult> {
        return { valid: Boolean(headers["stripe-signature"]) };
    }
}
