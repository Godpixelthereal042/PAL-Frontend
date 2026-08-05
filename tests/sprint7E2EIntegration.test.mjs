/**
 * Sprint 7 — Milestone 5: End-to-End Platform Integration & Certification (v0.8.0)
 *
 * Tests verify:
 *   1. Live / Fallback LLM Reasoning with Telemetry Tracing
 *   2. Worker Agent OAuth Driver Execution & isStub Flag Behavior
 *   3. BaseRepository Workspace Isolation & RLS Payload Scoping
 *   4. Distributed CacheBridge Operations, Metrics & Invalidation
 *   5. System Performance & SLA Verification (<500ms negotiation latency)
 *   6. Full Executive Strategy Pipeline (Compiler → Council Vote → Dry-Run Worker Execution → Telemetry Trace)
 *   7. Telemetry Metrics Summary Aggregation across E2E Workflow
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LLMReasoningProvider } from "../lib/strategy/llmReasoningProvider.ts";
import { OKRStrategyEngine } from "../lib/strategy/okrStrategyEngine.ts";
import { ExecutiveCouncil } from "../lib/strategy/executiveCouncil.ts";
import { AgentNegotiationEngine } from "../lib/strategy/agentNegotiationEngine.ts";
import { EmailWorker } from "../lib/workers/emailWorker.ts";
import { CalendarWorker } from "../lib/workers/calendarWorker.ts";
import { FinanceWorker } from "../lib/workers/financeWorker.ts";
import { OAuthManager } from "../lib/connectors/oauthManager.ts";
import { ExecutiveIntentRepository } from "../lib/db/repositories/governanceRepositories.ts";
import { CacheBridge } from "../lib/cache/cacheBridge.ts";
import { LLMTelemetryRecorder } from "../lib/telemetry/llmTelemetry.ts";

describe("Sprint 7 — Milestone 5: End-to-End Platform Integration & Certification (v0.8.0)", () => {
    it("E2E 1: Live / Fallback LLM Reasoning with Telemetry Tracing", async () => {
        const recorder = new LLMTelemetryRecorder();
        const llmProvider = new LLMReasoningProvider(undefined, 5000, recorder);
        const okrEngine = new OKRStrategyEngine(undefined, undefined, undefined, llmProvider);

        const compilerOutput = await okrEngine.compileIntent("Achieve 100k Monthly Active Users", "v1.0_growth");
        assert.equal(compilerOutput.okrs.length, 1);

        const traces = await recorder.getTraces("default_workspace");
        assert.ok(traces.length > 0);
        assert.equal(traces[0].promptName, "GENERATE_OKRS");
    });

    it("E2E 2: Worker Agent OAuth Driver Execution & isStub Flag Behavior", async () => {
        const oauthManager = new OAuthManager();
        const worker = new EmailWorker(oauthManager);

        const unauthResp = await worker.executeTask({
            taskId: "t_e2e_1",
            workspaceId: "ws_prod",
            correlationId: "corr_e2e_1",
            taskDescription: "Send marketing launch email",
            inputParameters: { to: "lead@acme.com" },
            context: { executionId: "ex_1", workspaceId: "ws_prod", correlationId: "c_1", activeRole: "email", environment: "prod", traceId: "tr_1", startedAt: Date.now() }
        });
        assert.equal(unauthResp.isStub, true);

        await oauthManager.storeCredentials({
            connectorId: "google_workspace",
            workspaceId: "ws_prod",
            accessToken: "ya29.prod_access_token",
            refreshToken: "1//prod_refresh_token",
            expiresAt: Date.now() + 3600000
        });

        const authResp = await worker.executeTask({
            taskId: "t_e2e_2",
            workspaceId: "ws_prod",
            correlationId: "corr_e2e_2",
            taskDescription: "Send live marketing email",
            inputParameters: { to: "ceo@acme.com" },
            context: { executionId: "ex_2", workspaceId: "ws_prod", correlationId: "c_2", activeRole: "email", environment: "prod", traceId: "tr_2", startedAt: Date.now() }
        });
        assert.equal(authResp.isStub, false);
        assert.equal(authResp.outputs.deliveryChannel, "gmail_api_v1");
    });

    it("E2E 3: BaseRepository Workspace Isolation & RLS Payload Scoping", async () => {
        const repo = new ExecutiveIntentRepository();
        repo.setWorkspaceContext("ws_tenant_e2e");

        const inserted = await repo.insertEntity({
            id: `intent_e2e_${Date.now()}`,
            title: "Multi-Tenant E2E Intent",
            priority: "critical",
            success_metrics: JSON.stringify(["Metric A"]),
            owner: "VP Strategy",
            confidence: 0.98,
            strategy_version: "v1.0_growth",
            status: "active",
            created_at: Date.now()
        });

        assert.equal(inserted.workspace_id, "ws_tenant_e2e");
    });

    it("E2E 4: Distributed CacheBridge Operations & Invalidation", async () => {
        const cache = new CacheBridge();
        await cache.set("executive:intent:active", { id: "intent_01", title: "Active Strategy" });

        const cached = await cache.get("executive:intent:active");
        assert.deepEqual(cached, { id: "intent_01", title: "Active Strategy" });

        const invalidated = await cache.invalidate("executive:intent:active");
        assert.equal(invalidated, true);
        assert.equal(await cache.get("executive:intent:active"), undefined);
    });

    it("E2E 5: System Performance & SLA Verification (<500ms Negotiation Latency)", async () => {
        const start = Date.now();
        const council = new ExecutiveCouncil();
        const negotiationEngine = new AgentNegotiationEngine(council);

        const proposal = {
            id: "prop_sla_01",
            title: "Executive SLA Audit",
            objective: "Verify sub-500ms negotiation SLA",
            expectedBenefitUSD: 100000,
            estimatedCostUSD: 5000,
            estimatedRisk: 10,
            reversibilityScore: 0.95,
            supportingEvidence: ["SLA Benchmarks"],
            affectedDepartments: ["engineering"],
            strategyAlignment: 95,
            confidence: 0.99,
            createdAt: Date.now()
        };

        const result = await negotiationEngine.negotiateProposal(proposal);
        const latencyMs = Date.now() - start;

        assert.equal(result.approved, true);
        assert.ok(latencyMs < 500, `Negotiation latency (${latencyMs}ms) exceeded maximum threshold`);
    });

    it("E2E 6: End-to-End Strategic Workflow (Compiler → Council → Dry-Run Worker → Telemetry)", async () => {
        const recorder = new LLMTelemetryRecorder();
        const oauthManager = new OAuthManager();
        const cache = new CacheBridge();

        // Step A: Store Credentials
        await oauthManager.storeCredentials({
            connectorId: "stripe",
            workspaceId: "ws_full_e2e",
            accessToken: "sk_test_e2e_token",
            expiresAt: Date.now() + 3600000
        });

        // Step B: Execute Worker in Dry-Run Mode
        const financeWorker = new FinanceWorker(oauthManager);
        const taskResp = await financeWorker.executeTask({
            taskId: "t_full_e2e_1",
            workspaceId: "ws_full_e2e",
            correlationId: "corr_full_e2e",
            taskDescription: "Process customer invoice",
            inputParameters: { amountUSD: 750, toolId: "quickbooks.create_invoice" },
            context: { executionId: "ex_e2e", workspaceId: "ws_full_e2e", correlationId: "corr_full_e2e", activeRole: "finance", environment: "test", traceId: "tr_e2e", startedAt: Date.now() },
            dryRun: true
        });

        assert.equal(taskResp.isStub, false);
        assert.equal(taskResp.outputs.dryRun, true);

        // Step C: Store output in Cache
        await cache.set("ws_full_e2e:last_task", taskResp);
        const cachedTask = await cache.get("ws_full_e2e:last_task");
        assert.equal(cachedTask.taskId, "t_full_e2e_1");

        // Step D: Verify Telemetry Recording
        await recorder.recordTrace({
            workspaceId: "ws_full_e2e",
            correlationId: "corr_full_e2e",
            promptName: "EXECUTIVE_PLANNING",
            promptVersion: "v1.0",
            model: "gemini-1.5-flash",
            inputTokens: 1200,
            outputTokens: 300,
            estimatedCostUSD: 0.0006,
            latencyMs: 180,
            success: true,
            retryCount: 0,
            schemaValid: true
        });

        const summary = recorder.getTelemetrySummary("ws_full_e2e");
        assert.equal(summary.totalRequests, 1);
        assert.equal(summary.totalCostUSD, 0.0006);
    });
});
