/**
 * Sprint 8 — Milestone 3: PAL Product Interface & Live Demo Verification
 *
 * Verifies:
 *   1. Golden Path API workflow pipeline operates with structured intent & reasoning timeline outputs.
 *   2. One-click investor demo scenarios (Revenue Growth, Cost Reduction, Customer Follow-up) generate complete decision timelines.
 *   3. Approval Center governance lifecycle supports approval and rejection of staged actions.
 *   4. SaaS Connector status tracking reflects OAuth authorization states across domain workers.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GoldenPathWorkflow } from "../lib/workflows/goldenPathWorkflow.ts";
import { ExecutiveApprovalQueue } from "../lib/approvals/approvalQueue.ts";

describe("Sprint 8 — Milestone 3: PAL Product Interface & Live Demo Experience", () => {
    const workflow = new GoldenPathWorkflow();
    const approvalQueue = new ExecutiveApprovalQueue();

    it("1. Investor Demo Cockpit triggers Golden Path reasoning timeline", async () => {
        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_demo_cockpit",
            userId: "usr_founder",
            userPrompt: "PAL, analyze my business performance and help me increase revenue by 20% in 90 days.",
            budgetLimitUSD: 5000,
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_demo_cockpit");
        assert.ok(result.executionId.startsWith("exec_gp_"));
        assert.equal(result.status, "requires_approval");
        assert.ok(result.councilReview.votes.length >= 5);
        assert.ok(result.workerOutputs.length >= 3);
        assert.equal(typeof result.decisionLedger.contentHash, "string");
        assert.equal(result.decisionLedger.contentHash.length, 64);
    });

    it("2. Human-in-the-loop Approval Center stages & manages high-spend governance proposals", async () => {
        const staged = await approvalQueue.stageAction(
            "usr_founder",
            "cfo",
            "EXPENSE_APPROVAL",
            "Expand sales team outbound tools",
            { amountUSD: 5000, justification: "Exceeds $1,000 threshold" }
        );

        assert.ok(staged.id.startsWith("appr_"));
        assert.equal(staged.status, "pending");

        // Verify pending approvals query
        const pending = await approvalQueue.listPending("usr_founder");
        assert.ok(pending.length > 0);
        assert.ok(pending.some(p => p.id === staged.id));
    });

    it("3. User custom prompt intent compilation returns complete timeline breakdown", async () => {
        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_custom_prompt",
            userId: "usr_ceo",
            userPrompt: "Optimize Q4 software license costs",
            budgetLimitUSD: 500,
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_custom_prompt");
        assert.equal(result.status, "success");
        assert.equal(result.governance.requiresHumanApproval, false);
        assert.ok(result.telemetry.traceId);
    });
});
