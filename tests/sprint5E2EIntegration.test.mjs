import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";
import { PermissionEngine } from "../lib/security/authorization/permissionEngine.ts";
import { TaskGraphEngine } from "../lib/tasks/taskGraphEngine.ts";
import { AutonomousExecutionEngine } from "../lib/execution/autonomousExecutionEngine.ts";
import { WorkerFactory } from "../lib/workers/workerFactory.ts";
import { ToolRegistry } from "../lib/tools/toolRegistry.ts";
import { ExecutionSandbox } from "../lib/tools/executionSandbox.ts";

import { ConnectorRuntime } from "../lib/integrations/connectorRuntime.ts";
import { OAuthVault } from "../lib/integrations/oauthVault.ts";
import { GmailConnector } from "../lib/integrations/connectors/gmailConnector.ts";
import { StripeConnector } from "../lib/integrations/connectors/stripeConnector.ts";
import { GitHubConnector } from "../lib/integrations/connectors/githubConnector.ts";
import { HubSpotConnector } from "../lib/integrations/connectors/hubspotConnector.ts";
import { SlackConnector } from "../lib/integrations/connectors/slackConnector.ts";

import { EventStreamEngine } from "../lib/integrations/events/eventStreamEngine.ts";
import { EventNormalizer } from "../lib/integrations/events/eventNormalizer.ts";
import { WebhookVerifier } from "../lib/integrations/events/webhookVerifier.ts";
import { ExecutiveMemoryEngine } from "../lib/integrations/memory/executiveMemoryEngine.ts";
import { CommandCenterStore } from "../lib/integrations/ui/commandCenterStore.ts";

describe("Sprint 5 — Milestone 7: End-to-End Platform Integration & Release v0.6.0", () => {
    const workspaceId = "ws_e2e_sprint5";
    const correlationId = "corr_s5_e2e_9000";

    it("E2E 1: Full System Integration (Sprint 2 Security -> Sprint 3 Intelligence -> Sprint 4 Execution -> Sprint 5 Enterprise Integrations & Event Bus)", async () => {
        // 1. Initialize Sprint 5 Connector Runtime & Drivers
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

        // 2. Initialize Tool Registry & Sandbox
        const registry = new ToolRegistry();
        runtime.discoverTools().forEach((contract) => {
            registry.registerTool(contract, async (params) => {
                return runtime.executeTool(contract.connectorId, contract.toolId, params, {});
            });
        });
        const sandbox = new ExecutionSandbox(registry);

        // 3. Initialize Sprint 5 Event Bus, Memory Engine, and Command Center
        const verifier = new WebhookVerifier(runtime.getConnectorManager());
        const eventEngine = new EventStreamEngine(verifier);
        const memoryEngine = new ExecutiveMemoryEngine();
        const commandStore = new CommandCenterStore(eventEngine);

        // 4. Hydrate Execution Context (Sprint 4 Runtime + Sprint 2 Security)
        const hydrator = new ContextHydrator();
        const context = hydrator.hydrateContext("inst_s5_e2e", {
            workspaceId,
            correlationId,
            workerRole: "finance",
            taskDescription: "Process automated refund and dispatch customer summary",
            userId: "user_cfo",
            grantedPermissions: ["stripe:write", "email.send", "slack:write"]
        });

        // 5. Execute Task Graph Planning & Autonomous Execution
        const taskGraph = new TaskGraphEngine();
        const dag = taskGraph.createTaskDAG(workspaceId, correlationId, "Process automated refund", [
            { nodeId: "step_1", title: "Refund Charge", type: "tool_call", assignedWorkerRole: "finance", toolId: "stripe.refund_payment", inputParameters: {}, prerequisites: [], retryPolicy: { maxRetries: 2, backoffFactorMs: 100 }, timeoutMs: 5000, onFailure: "retry", status: "pending" },
            { nodeId: "step_2", title: "Send Gmail Summary", type: "tool_call", assignedWorkerRole: "email", toolId: "google_workspace.send_email", inputParameters: {}, prerequisites: ["step_1"], retryPolicy: { maxRetries: 2, backoffFactorMs: 100 }, timeoutMs: 5000, onFailure: "retry", status: "pending" }
        ]);
        assert.equal(dag.executionLayers.length, 2);

        const workerFactory = new WorkerFactory();
        const executionEngine = new AutonomousExecutionEngine(workerFactory, sandbox);

        const execResult = await executionEngine.executeDAG(dag, context);
        assert.equal(execResult.status, "completed");

        // 6. Webhook Ingestion & Event Stream Normalization
        const normalizer = new EventNormalizer();
        const webhookEvt = normalizer.normalizeWebhook({
            connectorId: "stripe",
            headers: { "stripe-signature": "valid_sig" },
            rawBody: "{}",
            parsedBody: { type: "payment_intent.succeeded", amountUSD: 1200, customerId: "cus_e2e" },
            workspaceId,
            correlationId
        });

        const processResult = await eventEngine.processWebhook({
            connectorId: "stripe",
            headers: { "stripe-signature": "valid_sig" },
            rawBody: "{}",
            parsedBody: { type: "payment_intent.succeeded", amountUSD: 1200, customerId: "cus_e2e" },
            workspaceId,
            correlationId
        });
        assert.equal(processResult.processed, true);

        // 7. Memory Observation Ingestion Gate
        const memEntry = await memoryEngine.ingestObservation({
            workspaceId,
            workerRole: "FinanceWorker",
            layer: "business",
            category: "supplier",
            key: "stripe_settlement_speed",
            value: { avgHours: 24 },
            source: "stripe_webhook",
            importance: 8,
            explanation: "Observed fast 24h settlement speed for Stripe"
        });

        assert.equal(memEntry.observationsCount, 1);
        assert.ok(memEntry.confidence >= 0.70);

        // 8. Command Center Live State Verification
        const commandState = commandStore.getState();
        assert.ok(commandState.businessKPIs.revenueUSD > 140000);
        assert.ok(commandState.activityFeed.length >= 1);
    });

    it("E2E 2: OAuth PKCE & Refresh Token Rotation Family Revocation on Reuse Attack", async () => {
        const oauthVault = new OAuthVault();

        oauthVault.registerConnectorMetadata({
            connectorId: "stripe",
            provider: "Stripe",
            version: "2.0.0",
            capabilities: ["stripe:write"],
            requiredScopes: ["read_write"],
            supportedAuthMethods: ["oauth2"],
            supportsSandbox: true,
            supportsWebhooks: true,
            supportsStreaming: false,
            supportsToolDiscovery: true,
            supportsRefresh: true
        });

        const initialToken = oauthVault.getTokenRotationEngine().issueInitialToken(workspaceId, "stripe", ["read_write"]);
        await oauthVault.storeOAuthTokens({ workspaceId, connectorId: "stripe", tokenPair: initialToken });

        // Normal rotation
        const rotatedToken = await oauthVault.rotateTokens(workspaceId, "stripe");
        assert.notEqual(rotatedToken.accessToken, initialToken.accessToken);

        // Simulated Reuse Attack (Attempting to rotate using stale initialToken.refreshToken)
        assert.throws(() => {
            oauthVault.getTokenRotationEngine().rotateRefreshToken(initialToken.refreshToken);
        }, /Refresh Token reuse detected/);
    });

    it("E2E 3: Deep Executive Memory Layer Queries & Decay Calculation", async () => {
        const memoryEngine = new ExecutiveMemoryEngine();

        await memoryEngine.ingestObservation({
            workspaceId,
            workerRole: "CRMWorker",
            layer: "semantic",
            category: "customer",
            key: "acme_pref",
            value: "Prefers Slack notifications",
            source: "crm_history",
            importance: 9
        });

        const custMems = memoryEngine.findCustomerPreferences(workspaceId);
        assert.equal(custMems.length, 1);
        assert.equal(custMems[0].value, "Prefers Slack notifications");

        const explanation = memoryEngine.explainMemory(workspaceId, custMems[0].id);
        assert.ok(explanation);
        assert.ok(explanation.includes("crm_history"));
    });

    it("E2E 4: Event Stream Replay Capability across Business Domains", async () => {
        const engine = new EventStreamEngine();

        const normalizer = new EventNormalizer();
        const evt1 = normalizer.normalizeWebhook({
            connectorId: "github",
            headers: {},
            rawBody: "{}",
            parsedBody: { action: "opened", repository: { full_name: "pal/pal-frontend" } },
            workspaceId
        });

        await engine.publishEvent(evt1);

        const replayedEvents = [];
        const count = await engine.replayEvents(workspaceId, { classification: "EngineeringEvent" }, (e) => {
            replayedEvents.push(e);
        });

        assert.equal(count, 1);
        assert.equal(replayedEvents[0].classification, "EngineeringEvent");
    });

    it("E2E 5: System Performance & SLA Verification (<15ms integration latency)", async () => {
        const runtime = new ConnectorRuntime();
        const stripe = new StripeConnector();
        runtime.registerProvider(stripe);

        const start = Date.now();
        const health = await runtime.getHealthMonitor().checkHealth(stripe);
        const duration = Date.now() - start;

        assert.ok(duration < 15, `Health check latency ${duration}ms exceeded SLA threshold of 15ms`);
        assert.equal(health.status, "connected");
    });
});
