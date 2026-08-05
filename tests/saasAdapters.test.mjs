import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ConnectorRuntime } from "../lib/integrations/connectorRuntime.ts";
import { ToolRegistry } from "../lib/tools/toolRegistry.ts";
import { ExecutionSandbox } from "../lib/tools/executionSandbox.ts";
import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";

import { GmailConnector } from "../lib/integrations/connectors/gmailConnector.ts";
import { StripeConnector } from "../lib/integrations/connectors/stripeConnector.ts";
import { GitHubConnector } from "../lib/integrations/connectors/githubConnector.ts";
import { HubSpotConnector } from "../lib/integrations/connectors/hubspotConnector.ts";
import { SlackConnector } from "../lib/integrations/connectors/slackConnector.ts";

describe("Sprint 5 — Milestone 3: Provider-Agnostic SaaS Connectors & Tool Bundles", () => {

    it("ConnectorRuntime registers all 5 decoupled connector drivers and exposes metadata", () => {
        const runtime = new ConnectorRuntime();

        const gmail = new GmailConnector();
        const stripe = new StripeConnector();
        const github = new GitHubConnector();
        const hubspot = new HubSpotConnector();
        const slack = new SlackConnector();

        runtime.registerProvider(gmail);
        runtime.registerProvider(stripe);
        runtime.registerProvider(github);
        runtime.registerProvider(hubspot);
        runtime.registerProvider(slack);

        const tools = runtime.discoverTools();
        assert.ok(tools.length >= 8);

        // Verify metadata certification compliance on drivers
        [gmail, stripe, github, hubspot, slack].forEach((driver) => {
            const meta = driver.getMetadata();
            assert.ok(meta.connectorId);
            assert.ok(meta.provider);
            assert.equal(meta.supportsSandbox, true);
            assert.equal(meta.supportsToolDiscovery, true);
            assert.equal(meta.supportsRefresh, true);
        });
    });

    it("ToolRegistry & ExecutionSandbox execute tools via generic contracts (Worker -> Tool -> Connector -> Provider)", async () => {
        const runtime = new ConnectorRuntime();
        const registry = new ToolRegistry();
        const hydrator = new ContextHydrator();

        const gmail = new GmailConnector();
        const stripe = new StripeConnector();
        const github = new GitHubConnector();

        runtime.registerProvider(gmail);
        runtime.registerProvider(stripe);
        runtime.registerProvider(github);

        // Register tools into registry with runtime execution handler
        runtime.discoverTools().forEach((contract) => {
            registry.registerTool(contract, async (params) => {
                return runtime.executeTool(contract.connectorId, contract.toolId, params, {});
            });
        });

        const sandbox = new ExecutionSandbox(registry);
        const context = hydrator.hydrateContext("inst_m3_test", {
            workspaceId: "tenant_acme",
            correlationId: "corr_saas_001",
            workerRole: "email",
            taskDescription: "Execute multi-tool pipeline",
            userId: "user_ops",
            grantedPermissions: ["email.send", "stripe:write", "github:write"]
        });

        // 1. Gmail Tool Invocation
        const gmailResult = await sandbox.executeTool({
            toolId: "google_workspace.send_email",
            inputParameters: { recipient: "cfo@company.com", subject: "Q3 Report", body: "Attached" },
            context,
            isDryRun: true
        });
        assert.equal(gmailResult.status, "dry_run_success");
        assert.equal(gmailResult.sanitizedParameters.recipient, "cfo@company.com");

        // 2. Stripe Tool Invocation
        const stripeResult = await sandbox.executeTool({
            toolId: "stripe.refund_payment",
            inputParameters: { chargeId: "ch_999", amountUSD: 120, secretApiKey: "sk_test_SECRET_123" },
            context,
            isDryRun: true
        });
        assert.equal(stripeResult.status, "dry_run_success");
        assert.equal(stripeResult.sanitizedParameters.secretApiKey, "[REDACTED_SECRET]");

        // 3. GitHub Tool Invocation
        const githubResult = await sandbox.executeTool({
            toolId: "github.create_issue",
            inputParameters: { repo: "pal/pal-frontend", title: "Refactor Sandbox", body: "Details..." },
            context,
            isDryRun: true
        });
        assert.equal(githubResult.status, "dry_run_success");
        assert.equal(githubResult.sanitizedParameters.repo, "pal/pal-frontend");
    });
});
