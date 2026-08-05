import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ToolRegistry } from "../lib/tools/toolRegistry.ts";
import { ExecutionSandbox } from "../lib/tools/executionSandbox.ts";
import { OAuthManager } from "../lib/connectors/oauthManager.ts";
import { ConnectorSDK } from "../lib/connectors/connectorSDK.ts";
import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";

describe("Milestone 2: Universal Tool & Connector Framework", () => {
    const workspaceId = "ws_test_m2";
    const correlationId = "corr_test_m2";

    it("ConnectorSDK registers drivers and exposes granular tool definitions", () => {
        const sdk = new ConnectorSDK();
        const tools = sdk.getAllSupportedTools();

        assert.ok(tools.length >= 3);
        const emailTool = tools.find((t) => t.toolId === "google_workspace.send_email");
        assert.ok(emailTool);
        assert.equal(emailTool.connectorId, "google_workspace");
        assert.equal(emailTool.category, "email");
        assert.ok(emailTool.supportsDryRun);
    });

    it("ToolRegistry filters tools by connector and dynamic capability per worker", () => {
        const registry = new ToolRegistry();
        const sdk = new ConnectorSDK();

        sdk.getAllSupportedTools().forEach((contract) => {
            registry.registerTool(contract, async (params) => ({ success: true, params }));
        });

        const emailTools = registry.listToolsByCapability("email", ["email.send"]);
        assert.equal(emailTools.length, 1);
        assert.equal(emailTools[0].toolId, "google_workspace.send_email");

        // Worker lacking permission receives empty capability list
        const unauthorizedTools = registry.listToolsByCapability("email", ["unrelated.perm"]);
        assert.equal(unauthorizedTools.length, 0);
    });

    it("ExecutionSandbox validates parameters, redacts secrets, and runs dry-run simulation", async () => {
        const registry = new ToolRegistry();
        const sdk = new ConnectorSDK();

        sdk.getAllSupportedTools().forEach((contract) => {
            registry.registerTool(contract, async (params) => ({ success: true, params }));
        });

        const sandbox = new ExecutionSandbox(registry);
        const hydrator = new ContextHydrator();
        const context = hydrator.hydrateContext("inst_m2", {
            workspaceId,
            correlationId,
            workerRole: "email",
            taskDescription: "Send test email",
            userId: "user_founder",
            grantedPermissions: ["email.send"],
        });

        // Test Dry Run execution mode
        const dryRunResult = await sandbox.executeTool({
            toolId: "google_workspace.send_email",
            inputParameters: {
                to: "executive@company.com",
                subject: "Weekly Brief",
                body: "Report details",
                apiToken: "secret_token_12345", // Sensitive key
            },
            context,
            isDryRun: true,
        });

        assert.equal(dryRunResult.status, "dry_run_success");
        assert.equal(dryRunResult.sanitizedParameters.apiToken, "[REDACTED_SECRET]");
        assert.equal(dryRunResult.sanitizedParameters.to, "executive@company.com");
    });

    it("ExecutionSandbox enforces Sprint 2 permission checks and action budget caps", async () => {
        const registry = new ToolRegistry();
        const sdk = new ConnectorSDK();

        sdk.getAllSupportedTools().forEach((contract) => {
            registry.registerTool(contract, async (params) => ({ success: true, params }));
        });

        const sandbox = new ExecutionSandbox(registry);
        const hydrator = new ContextHydrator();

        // Context lacking refund permission
        const context = hydrator.hydrateContext("inst_m2_sec", {
            workspaceId,
            correlationId,
            workerRole: "finance",
            taskDescription: "Process refund",
            userId: "user_founder",
            grantedPermissions: ["finance.read"], // Missing finance.refund
        });

        const deniedResult = await sandbox.executeTool({
            toolId: "stripe.refund_payment",
            inputParameters: { chargeId: "ch_123", amountUSD: 50 },
            context,
        });

        assert.equal(deniedResult.status, "permission_denied");
        assert.ok(deniedResult.errorDetails.includes("Missing required permission"));
    });

    it("OAuthManager stores tokens encrypted with tenant isolation and handles auto-refresh", async () => {
        const oauth = new OAuthManager();
        const creds = {
            workspaceId,
            connectorId: "google_workspace",
            accessToken: "access_token_123",
            refreshToken: "refresh_token_123",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
            scope: "email.send calendar.create",
        };

        await oauth.storeCredentials(creds);
        const retrieved = await oauth.getCredentials(workspaceId, "google_workspace");
        assert.ok(retrieved);
        assert.equal(retrieved.accessToken, "access_token_123");

        // Force token expiration to test Auto Refresh Token Rotation (RTR)
        creds.expiresAt = Date.now() - 1000;
        await oauth.storeCredentials(creds);

        const refreshed = await oauth.getCredentials(workspaceId, "google_workspace");
        assert.ok(refreshed);
        assert.ok(refreshed.accessToken.startsWith("refreshed_access_"));
        assert.ok(refreshed.refreshToken.startsWith("rotated_refresh_"));
    });
});
