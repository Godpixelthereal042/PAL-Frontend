import { test, describe } from "node:test";
import assert from "node:assert";
import { ServiceAccountManager } from "../lib/security/connectors/serviceAccountManager.ts";
import { ConnectorAuthEngine } from "../lib/security/connectors/connectorAuthEngine.ts";
import { PluginSecurityManager } from "../lib/security/plugins/pluginSecurityManager.ts";

describe("Milestone 5: Service Accounts, Connectors & Plugin Security", () => {
    test("ServiceAccountManager generates, verifies SHA-256 API keys, and revokes accounts", async () => {
        const sam = new ServiceAccountManager();
        const workspaceId = `ws_sa_${Date.now()}`;

        const { serviceAccount, apiKey } = await sam.createServiceAccount({
            workspaceId,
            name: "GitHub Sync Service",
            scopes: ["repo:read", "repo:write"]
        });

        assert.strictEqual(serviceAccount.name, "GitHub Sync Service");
        assert.strictEqual(apiKey.rawKey.startsWith("pal_sk_"), true);
        assert.strictEqual(apiKey.keyHash.length, 64); // SHA-256 hex length

        // Verify API Key
        const verified = await sam.verifyAPIKey(apiKey.rawKey);
        assert.strictEqual(verified.serviceAccountId, serviceAccount.id);

        // Revoke Service Account
        const revoked = await sam.revokeServiceAccount(serviceAccount.id, "usr_admin_1");
        assert.strictEqual(revoked, true);

        // Verify API Key fails after revocation
        await assert.rejects(async () => {
            await sam.verifyAPIKey(apiKey.rawKey);
        }, (err) => {
            assert.strictEqual(err.name, "UnauthorizedError");
            return true;
        });
    });

    test("ConnectorAuthEngine encrypts OAuth tokens via AES-256-GCM and enforces workspace isolation", async () => {
        const authEngine = new ConnectorAuthEngine();
        const plainToken = "ya29.a0AfH6SMA_oauth_access_token_secret_12345";

        // 1. AES-256-GCM Encryption / Decryption
        const { encrypted, iv, authTag } = authEngine.encryptToken(plainToken);
        assert.notStrictEqual(encrypted, plainToken);

        const decrypted = authEngine.decryptToken(encrypted, iv, authTag);
        assert.strictEqual(decrypted, plainToken);

        // 2. Connector Token Storage & Workspace Isolation
        const connectorId = `conn_${Date.now()}`;
        const workspaceId = `ws_conn_${Date.now()}`;

        await authEngine.storeConnectorTokens({
            connectorId,
            workspaceId,
            provider: "google_calendar",
            tokens: {
                accessToken: plainToken,
                scopes: ["calendar:read"]
            }
        });

        // Valid access within same workspace
        const hasAccess = await authEngine.validateConnectorAccess(connectorId, workspaceId, "calendar:read");
        assert.strictEqual(hasAccess, true);

        // Cross-workspace access attempt (Must fail)
        await assert.rejects(async () => {
            await authEngine.validateConnectorAccess(connectorId, "ws_other_workspace", "calendar:read");
        }, (err) => {
            assert.strictEqual(err.name, "ForbiddenError");
            assert.strictEqual(err.message.includes("boundary violation"), true);
            return true;
        });
    });

    test("PluginSecurityManager enforces capability sandboxing and runtime permission checks", async () => {
        const pluginManager = new PluginSecurityManager();
        const workspaceId = `ws_plug_${Date.now()}`;

        const sandbox = await pluginManager.registerPlugin({
            workspaceId,
            pluginName: "Slack Executive Notifier",
            version: "1.0.0",
            requestedCapabilities: ["notifications:send"]
        });

        assert.strictEqual(sandbox.isApproved, true);

        // Valid Granted Capability
        const allowed = pluginManager.enforceRuntimePermission(sandbox, "notifications:send");
        assert.strictEqual(allowed, true);

        // Missing Capability Violation (Must fail)
        assert.throws(() => {
            pluginManager.enforceRuntimePermission(sandbox, "database:drop");
        }, (err) => {
            assert.strictEqual(err.name, "ForbiddenError");
            assert.strictEqual(err.message.includes("sandbox violation"), true);
            return true;
        });
    });
});
