/**
 * Sprint 8 Milestone 1.5 — Product Reality Audit Demo Scenarios
 *
 * Tests 3 investor-level scenarios against GoldenPathWorkflow:
 *   Scenario A: Revenue Growth ("I want to increase revenue by 20% in 90 days.")
 *   Scenario B: Cost Reduction ("My expenses increased by 30%. Find the problem.")
 *   Scenario C: Customer Follow-up ("Follow up with my inactive customers.")
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GoldenPathWorkflow } from "../lib/workflows/goldenPathWorkflow.ts";
import { OAuthManager } from "../lib/connectors/oauthManager.ts";

describe("Sprint 8 Milestone 1.5 — Product Reality Audit Demo Scenarios", () => {
    const workflow = new GoldenPathWorkflow();

    it("Scenario A — Revenue Growth: 'I want to increase revenue by 20% in 90 days.'", async () => {
        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_demo_growth",
            userId: "usr_founder",
            userPrompt: "I want to increase revenue by 20% in 90 days.",
            budgetLimitUSD: 5000,
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_demo_growth");
        assert.equal(result.status, "requires_approval"); // $5k exceeds $1k threshold
        assert.ok(result.intent.okrs.length > 0);
        assert.ok(result.councilReview.votes.length >= 5);
        assert.equal(result.governance.requiresHumanApproval, true);
        assert.ok(result.workerOutputs.length >= 3);
        assert.equal(typeof result.decisionLedger.contentHash, "string");
        assert.equal(result.decisionLedger.contentHash.length, 64);
        assert.ok(result.telemetry.totalTokens > 0);
    });

    it("Scenario B — Cost Reduction: 'My expenses increased by 30%. Find the problem.'", async () => {
        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_demo_cost",
            userId: "usr_cfo",
            userPrompt: "My expenses increased by 30%. Find the problem.",
            budgetLimitUSD: 800, // Under $1,000 threshold
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_demo_cost");
        assert.equal(result.status, "success"); // $800 is under $1,000 threshold
        assert.equal(result.governance.requiresHumanApproval, false);
        assert.ok(result.intent.okrs.length > 0);
        assert.ok(result.councilReview.approved);
        assert.equal(result.simulation.riskLevel, "low");
        assert.ok(result.workerOutputs.some(w => w.workerRole === "finance"));
    });

    it("Scenario C — Customer Follow-up: 'Follow up with my inactive customers.'", async () => {
        const oauthManager = new OAuthManager();
        await oauthManager.storeCredentials({
            connectorId: "google_workspace",
            workspaceId: "ws_demo_crm",
            accessToken: "ya29.demo_token",
            refreshToken: "1//demo_refresh",
            expiresAt: Date.now() + 3600000
        });

        const liveWorkflow = new GoldenPathWorkflow({ oauthManager });

        const result = await liveWorkflow.executeGoldenPath({
            workspaceId: "ws_demo_crm",
            userId: "usr_cmo",
            userPrompt: "Follow up with my inactive customers.",
            budgetLimitUSD: 300,
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_demo_crm");
        assert.ok(result.workerOutputs.some(w => w.workerRole === "email"));
        assert.equal(result.workerOutputs.find(w => w.workerRole === "email")?.dryRun, true);
        assert.ok(result.decisionLedger.recordId.startsWith("dec_ledger_"));
    });
});
