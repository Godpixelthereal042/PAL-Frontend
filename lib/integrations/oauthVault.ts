/**
 * Enterprise OAuth Vault & Credential Platform (PAL-TDD-004, PAL-ARCH-DOC-027)
 */

import { SecretVault } from "./secretVault.ts";
import { TokenRotationEngine, type OAuthTokenPair, type PKCEPair } from "./tokenRotationEngine.ts";

export interface ConnectorMetadata {
    connectorId: string;
    provider: string;
    version: string;
    capabilities: string[];
    requiredScopes: string[];
    supportedAuthMethods: ("oauth2" | "api_key" | "webhook_secret")[];
    supportsSandbox: boolean;
    supportsWebhooks: boolean;
    supportsStreaming: boolean;
    supportsToolDiscovery: boolean;
    supportsRefresh: boolean;
}

export class OAuthVault {
    private secretVault: SecretVault;
    private rotationEngine: TokenRotationEngine;
    private connectorMetadataMap: Map<string, ConnectorMetadata> = new Map();

    constructor(secretVault?: SecretVault, rotationEngine?: TokenRotationEngine) {
        this.secretVault = secretVault || new SecretVault();
        this.rotationEngine = rotationEngine || new TokenRotationEngine();
    }

    registerConnectorMetadata(metadata: ConnectorMetadata): void {
        this.connectorMetadataMap.set(metadata.connectorId, metadata);
    }

    getConnectorMetadata(connectorId: string): ConnectorMetadata | undefined {
        return this.connectorMetadataMap.get(connectorId);
    }

    initiateOAuthPKCE(): PKCEPair {
        return this.rotationEngine.generatePKCE();
    }

    async storeOAuthTokens(params: {
        workspaceId: string;
        connectorId: string;
        tokenPair: OAuthTokenPair;
        environment?: "sandbox" | "production";
        actorId?: string;
    }): Promise<void> {
        const { workspaceId, connectorId, tokenPair, environment = "sandbox", actorId = "system" } = params;

        await this.secretVault.storeSecret({
            workspaceId,
            connectorId,
            keyName: "access_token",
            secretValue: tokenPair.accessToken,
            environment,
            scopes: tokenPair.scopes,
            expiresAt: tokenPair.obtainedAt + tokenPair.expiresInSeconds * 1000,
            actorId
        });

        await this.secretVault.storeSecret({
            workspaceId,
            connectorId,
            keyName: "refresh_token",
            secretValue: tokenPair.refreshToken,
            environment,
            scopes: tokenPair.scopes,
            actorId
        });
    }

    async getAccessToken(workspaceId: string, connectorId: string): Promise<string | undefined> {
        return this.secretVault.getSecret(workspaceId, connectorId, "access_token");
    }

    async rotateTokens(workspaceId: string, connectorId: string): Promise<OAuthTokenPair> {
        const currentRefreshToken = await this.secretVault.getSecret(workspaceId, connectorId, "refresh_token");
        if (!currentRefreshToken) {
            throw new Error(`No refresh token found for workspace '${workspaceId}' and connector '${connectorId}'`);
        }

        const newPair = this.rotationEngine.rotateRefreshToken(currentRefreshToken);
        await this.storeOAuthTokens({ workspaceId, connectorId, tokenPair: newPair });
        return newPair;
    }

    getSecretVault(): SecretVault {
        return this.secretVault;
    }

    getTokenRotationEngine(): TokenRotationEngine {
        return this.rotationEngine;
    }
}
