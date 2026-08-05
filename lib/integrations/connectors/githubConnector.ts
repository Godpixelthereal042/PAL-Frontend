/**
 * GitHub Connector Driver (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ConnectionState, ConnectorConnectionConfig, ConnectorHealthStatus, IConnectorProvider, TokenRefreshResult, WebhookVerificationResult } from "../connectorTypes.ts";
import type { ConnectorMetadata } from "../oauthVault.ts";
import type { ToolContract } from "../../tools/types.ts";
import type { ExecutionContext } from "../../runtime/types.ts";
import { GITHUB_TOOLS } from "../tools/githubTools.ts";

export class GitHubConnector implements IConnectorProvider {
    private metadata: ConnectorMetadata = {
        connectorId: "github",
        provider: "GitHub DevOps",
        version: "3.1.0",
        capabilities: ["github:write", "github:read"],
        requiredScopes: ["repo", "workflow"],
        supportedAuthMethods: ["oauth2", "api_key"],
        supportsSandbox: true,
        supportsWebhooks: true,
        supportsStreaming: true,
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
        return { success: true, expiresAt: Date.now() + 28800000 };
    }

    async health(): Promise<ConnectorHealthStatus> {
        return {
            connectorId: this.getConnectorId(),
            status: "connected",
            latencyMs: 22,
            consecutiveFailures: 0,
            lastCheckedAt: Date.now(),
            rateLimitRemaining: 5000
        };
    }

    discoverTools(): ToolContract[] {
        return GITHUB_TOOLS;
    }

    async executeTool(toolId: string, params: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
        if (toolId === "github.create_issue") {
            return {
                issueNumber: 101,
                issueUrl: `https://github.com/${params.repo}/issues/101`,
                title: params.title,
                isSandbox: true
            };
        }
        return {
            prNumber: 42,
            prUrl: `https://github.com/${params.repo}/pull/42`,
            title: params.title,
            isSandbox: true
        };
    }

    async verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookVerificationResult> {
        return { valid: Boolean(headers["x-hub-signature-256"]) };
    }
}
