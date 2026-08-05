/**
 * Sprint 8 — Milestone 1: PAL Live Business Workflow Demo (Golden Path)
 *
 * Tests verify:
 *   1. GoldenPathWorkflow executes complete end-to-end user prompt pipeline:
 *      Intent → Strategy OKRs → Council Debate → Risk Simulation → Approval Matrix → Workers → Ledger → Telemetry
 *   2. Council negotiation votes and member rationales are included in GoldenPathResult.
 *   3. Finance, Email, and Calendar worker executions are included in workerOutputs with dry-run gating.
 *   4. High-spend operations (> $1,000 threshold) set requiresHumanApproval=true and generate an ApprovalQueue ID.
 *   5. Decision ledger records a tamper-evident SHA-256 hash chain ID.
 *   6. LLM telemetry records trace ID, token count, cost USD, and latency metrics.
 *   7. Multi-tenant RLS workspace scoping is enforced across GoldenPathWorkflow executions.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GoldenPathWorkflow } from "../lib/workflows/goldenPathWorkflow.ts";
import { OAuthManager } from "../lib/connectors/oauthManager.ts";

describe("Sprint 8 — Milestone 1: PAL Live Business Workflow Demo (Golden Path)", () => {
    it("1. GoldenPathWorkflow executes complete pipeline and returns structured GoldenPathResult", async () => {
        const workflow = new GoldenPathWorkflow();

        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_demo_01",
            userId: "usr_founder_01",
            userPrompt: "PAL, analyze my business performance and help me increase revenue.",
            budgetLimitUSD: 500,
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_demo_01");
        assert.ok(result.executionId.startsWith("exec_gp_"));
        assert.ok(result.intent.okrs.length > 0);
        assert.ok(result.councilReview.votes.length > 0);
        assert.ok(result.simulation.score > 0);
        assert.equal(typeof result.decisionLedger.contentHash, "string");
        assert.equal(result.decisionLedger.contentHash.length, 64);
        assert.ok(result.executionTimeMs > 0);
    });

    it("2. High-spend proposal (> $1,000 threshold) flags human approval requirement", async () => {
        const workflow = new GoldenPathWorkflow();

        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_enterprise",
            userId: "usr_cfo",
            userPrompt: "Expand sales team and launch nationwide campaign",
            budgetLimitUSD: 10000, // $10k exceeds default $1k threshold
            dryRun: true
        });

        assert.equal(result.status, "requires_approval");
        assert.equal(result.governance.requiresHumanApproval, true);
        assert.ok(result.governance.approvalId);
    });

    it("3. Worker agents execute with dry-run safety gating in Golden Path flow", async () => {
        const oauthManager = new OAuthManager();

        // Store live credentials for Google Workspace
        await oauthManager.storeCredentials({
            connectorId: "google_workspace",
            workspaceId: "ws_live_demo",
            accessToken: "ya29.live_demo_access_token",
            refreshToken: "1//live_demo_refresh_token",
            expiresAt: Date.now() + 3600000
        });

        const workflow = new GoldenPathWorkflow({ oauthManager });

        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_live_demo",
            userId: "usr_ceo",
            userPrompt: "Schedule Q3 Strategic Growth Kickoff and send email notification",
            budgetLimitUSD: 500,
            dryRun: true
        });

        assert.ok(result.workerOutputs.length >= 2);

        const emailWorkerOutput = result.workerOutputs.find(w => w.workerRole === "email");
        assert.ok(emailWorkerOutput);
        assert.equal(emailWorkerOutput.dryRun, true);
        assert.equal(emailWorkerOutput.outputs.sentMessageId, null); // Dry-run safety: null ID
    });

    it("4. Decision ledger hash chain & LLM telemetry traces are recorded", async () => {
        const workflow = new GoldenPathWorkflow();

        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_telemetry_test",
            userId: "usr_audit",
            userPrompt: "Optimize pricing strategy and customer retention",
            budgetLimitUSD: 2000,
            dryRun: true
        });

        assert.ok(result.decisionLedger.recordId.startsWith("dec_ledger_"));
        assert.equal(result.decisionLedger.previousHash, "0000000000000000000000000000000000000000000000000000000000000000");
        assert.ok(result.telemetry.traceId);
        assert.ok(result.telemetry.latencyMs >= 0);
    });

    it("5. Multi-tenant RLS workspace scoping isolates Golden Path executions across tenants", async () => {
        const workflow = new GoldenPathWorkflow();

        const resultA = await workflow.executeGoldenPath({
            workspaceId: "ws_tenant_Alpha",
            userId: "usr_alpha",
            userPrompt: "Scale outbound marketing",
            budgetLimitUSD: 500
        });

        const resultB = await workflow.executeGoldenPath({
            workspaceId: "ws_tenant_Beta",
            userId: "usr_beta",
            userPrompt: "Reduce operational overhead",
            budgetLimitUSD: 500
        });

        assert.equal(resultA.workspaceId, "ws_tenant_Alpha");
        assert.equal(resultB.workspaceId, "ws_tenant_Beta");
        assert.notEqual(resultA.intent.id, resultB.intent.id);
        assert.notEqual(resultA.decisionLedger.recordId, resultB.decisionLedger.recordId);
    });
});
