import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { SecretVault } from "../lib/integrations/secretVault.ts";
import { TokenRotationEngine } from "../lib/integrations/tokenRotationEngine.ts";
import { OAuthVault } from "../lib/integrations/oauthVault.ts";

describe("Sprint 5 — Milestone 2: OAuth 2.0 & Enterprise Secret Vault", () => {
    const workspaceId = "ws_test_m2";
    const connectorId = "google_workspace";

    it("SecretVault enforces AES-256-GCM encryption, master key derivation, and secret masking", async () => {
        const vault = new SecretVault();
        const secretValue = "sk_live_1234567890abcdef_SECRET";

        const record = await vault.storeSecret({
            workspaceId,
            connectorId,
            keyName: "api_key",
            secretValue,
            environment: "production",
            scopes: ["gmail.send", "calendar.read"]
        });

        assert.equal(record.version, 1);
        assert.equal(record.environment, "production");
        assert.notEqual(record.encryptedData, secretValue);

        const fetched = await vault.getSecret(workspaceId, connectorId, "api_key");
        assert.equal(fetched, secretValue);

        // Verify Secret Masking
        const samplePayload = {
            user: "alice",
            apiToken: secretValue,
            nested: { secretKey: secretValue, publicId: "pub_123" }
        };
        const masked = vault.maskSecrets(samplePayload);
        assert.equal(masked.apiToken, "[REDACTED_SECRET]");
        assert.equal(masked.nested.secretKey, "[REDACTED_SECRET]");
        assert.equal(masked.nested.publicId, "pub_123");

        // Verify Audit Log Recording
        const audits = vault.getAuditHistory(workspaceId);
        assert.ok(audits.length >= 2);
    });

    it("TokenRotationEngine generates PKCE pairs and executes Refresh Token Rotation (RTR)", () => {
        const rotationEngine = new TokenRotationEngine();

        // PKCE test
        const pkce = rotationEngine.generatePKCE();
        assert.ok(pkce.codeVerifier);
        assert.ok(pkce.codeChallenge);
        assert.equal(pkce.challengeMethod, "S256");

        // Initial token issue
        const initial = rotationEngine.issueInitialToken(workspaceId, connectorId, ["read", "write"]);
        assert.ok(initial.accessToken.startsWith("access_"));
        assert.ok(initial.refreshToken.startsWith("ref_"));

        // Rotate Refresh Token
        const rotated = rotationEngine.rotateRefreshToken(initial.refreshToken);
        assert.notEqual(rotated.accessToken, initial.accessToken);
        assert.notEqual(rotated.refreshToken, initial.refreshToken);

        // Test Reuse Attack Detection (Re-using old refresh token must trigger revocation alert)
        assert.throws(() => {
            rotationEngine.rotateRefreshToken(initial.refreshToken);
        }, /Security Alert: Refresh Token reuse detected!/);
    });

    it("OAuthVault manages ConnectorMetadata and stores encrypted token pairs", async () => {
        const oauthVault = new OAuthVault();

        oauthVault.registerConnectorMetadata({
            connectorId,
            provider: "Google Workspace",
            version: "1.0.0",
            capabilities: ["email.send", "calendar.event.create"],
            requiredScopes: ["https://www.googleapis.com/auth/gmail.send"],
            supportedAuthMethods: ["oauth2"],
            supportsSandbox: true,
            supportsWebhooks: true,
            supportsStreaming: false,
            supportsToolDiscovery: true,
            supportsRefresh: true
        });

        const meta = oauthVault.getConnectorMetadata(connectorId);
        assert.ok(meta);
        assert.equal(meta.supportsRefresh, true);

        const tokenPair = oauthVault.getTokenRotationEngine().issueInitialToken(workspaceId, connectorId, meta.requiredScopes);
        await oauthVault.storeOAuthTokens({ workspaceId, connectorId, tokenPair });

        const retrievedAccessToken = await oauthVault.getAccessToken(workspaceId, connectorId);
        assert.equal(retrievedAccessToken, tokenPair.accessToken);

        // Perform token rotation via OAuthVault
        const rotatedPair = await oauthVault.rotateTokens(workspaceId, connectorId);
        assert.notEqual(rotatedPair.accessToken, tokenPair.accessToken);

        const updatedAccessToken = await oauthVault.getAccessToken(workspaceId, connectorId);
        assert.equal(updatedAccessToken, rotatedPair.accessToken);
    });
});
