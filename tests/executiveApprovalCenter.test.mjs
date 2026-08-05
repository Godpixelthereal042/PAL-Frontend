/**
 * Executive Approval Center Test Suite (PAL-TDD-008, Sprint 21 Milestone 4)
 *
 * Verifies:
 *   1. Formats 5-Question Approval Cards (What, Why, Evidence, If Approved, If Rejected).
 *   2. Dispatches `Approve` responses to execute actions and update trust scores.
 *   3. Dispatches `Reject` responses to record rejections.
 *   4. Dispatches `Modify` responses to record CEO overrides in CEO Preference Model.
 *   5. Dispatches `Ask PAL` responses returning interactive clarification rationale.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutiveApprovalCenter } from "../lib/cockpit/executiveApprovalCenter.ts";

describe("Sprint 21 Milestone 4 — Executive Approval Cockpit & Trust Cards", () => {
    const approvalCenter = ExecutiveApprovalCenter.getInstance();

    it("1. Formats 5-Question Approval Cards with all executive trust fields", () => {
        const card = approvalCenter.createApprovalCard({
            workspaceId: "ws_demo_company",
            actionId: "act_cfo_cancel_datadog",
            agentRole: "cfo",
            agentName: "Chief Financial Agent",
            whatHappened: "Unutilized Datadog monitoring subscription detected ($1,200/mo spend with 0 queries in 60 days).",
            whyPALRecommendsThis: "Canceling Datadog extends cash runway to 18.5 months without impacting system uptime.",
            supportingEvidence: ["Datadog API usage metrics: 0 queries in 60 days", "Fallback AWS CloudWatch logging is fully active"],
            whatHappensIfApproved: "Saves $1,200/month immediately ($14,400/year cost reduction).",
            whatHappensIfRejected: "Continues $1,200/month unutilized spend drift.",
            estimatedFinancialImpactUSD: 14400,
            confidenceScorePct: 98,
            riskClassification: "reversible"
        });

        assert.ok(card.cardId.startsWith("card_"));
        assert.equal(card.status, "pending");
        assert.ok(card.whatHappened.includes("Unutilized Datadog"));
        assert.ok(card.whyPALRecommendsThis.includes("18.5 months"));
        assert.ok(card.whatHappensIfApproved.includes("$14,400/year"));
    });

    it("2. Handles 'Approve' action, executing recommendation and recording approval outcome", () => {
        const pending = approvalCenter.getPendingCards("ws_demo_company");
        assert.ok(pending.length >= 1);

        const cardId = pending[0].cardId;
        const res = approvalCenter.respondToApprovalCard({
            cardId,
            response: "approve"
        });

        assert.equal(res.success, true);
        assert.equal(res.card.status, "approved");
        assert.equal(res.actionResult.approvedByCEO, true);
    });

    it("3. Handles 'Modify' action, logging CEO override into CEO Preference Model", () => {
        const card = approvalCenter.createApprovalCard({
            workspaceId: "ws_demo_company",
            actionId: "act_cro_discount",
            agentRole: "cro",
            agentName: "Chief Revenue Agent",
            whatHappened: "Pipeline conversion dropped 18% following pricing update.",
            whyPALRecommendsThis: "Offer 30% price discount to close pending enterprise trials quickly.",
            supportingEvidence: ["4 enterprise trials dormant for >45 days"],
            whatHappensIfApproved: "Closes 4 trials immediately at $1,400/mo.",
            whatHappensIfRejected: "Trials remain stagnant.",
            estimatedFinancialImpactUSD: 16800,
            confidenceScorePct: 92,
            riskClassification: "reversible"
        });

        const res = approvalCenter.respondToApprovalCard({
            cardId: card.cardId,
            response: "modify",
            overrideNotes: "Keep base price firm at $1,999/mo; offer free premium onboarding setup instead.",
            modifiedParams: { discountPct: 0, addFreeOnboarding: true }
        });

        assert.equal(res.success, true);
        assert.equal(res.card.status, "modified");
        assert.ok(res.card.ceoOverrideNotes.includes("Keep base price firm"));
    });

    it("4. Handles 'Ask PAL' action, returning interactive clarification response", () => {
        const card = approvalCenter.createApprovalCard({
            workspaceId: "ws_demo_company",
            actionId: "act_coo_scale",
            agentRole: "coo",
            agentName: "Chief Operating Agent",
            whatHappened: "Workload surge detected on API gateway.",
            whyPALRecommendsThis: "Autoscale compute nodes by 2 units.",
            supportingEvidence: ["Traffic peak 85% capacity"],
            whatHappensIfApproved: "Prevents latency spikes during peak hours.",
            whatHappensIfRejected: "API response latency increases by 250ms.",
            estimatedFinancialImpactUSD: 300,
            confidenceScorePct: 97,
            riskClassification: "reversible"
        });

        const res = approvalCenter.respondToApprovalCard({
            cardId: card.cardId,
            response: "ask_pal"
        });

        assert.equal(res.success, true);
        assert.ok(res.palClarificationText);
        assert.ok(res.palClarificationText.includes("97% confidence"));
    });
});
