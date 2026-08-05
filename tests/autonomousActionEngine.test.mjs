/**
 * PAL Autonomous Action Layer Test Suite (PAL-TDD-007, Sprint 20 Milestone 3)
 *
 * Verifies:
 *   1. Level 1 (Analyze) and Level 2 (Draft) actions run without approval.
 *   2. Level 3 actions require human executive sign-off.
 *   3. Level 4 autonomous execution requires agent trust score > 95%.
 *   4. Irreversible actions always require approval regardless of trust level.
 *   5. Daily domain spend caps block autonomous over-spend.
 *   6. Rollback plans are registered and executable for side-effecting actions.
 *   7. Every autonomous execution issues an auditable AI Decision Passport.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AutonomousActionEngine } from "../lib/autonomy/autonomousActionEngine.ts";
import { ActionPolicyEngine } from "../lib/autonomy/actionPolicyEngine.ts";

describe("Sprint 20 Milestone 3 — PAL Autonomous Action Layer", () => {
    const actionEngine = AutonomousActionEngine.getInstance();
    const policyEngine = ActionPolicyEngine.getInstance();

    it("1. Level 1 (Analyze) and Level 2 (Draft) actions run autonomously", () => {
        const resL1 = actionEngine.executeAction({
            actionId: "act_l1_001",
            agentRole: "cfo",
            domain: "finance",
            actionLevel: 1,
            title: "Analyze SaaS Spend Trends",
            description: "Scans subscriptions for unutilized licenses",
            estimatedCostUSD: 0,
            riskClassification: "reversible",
            rollbackPlan: "None required",
            agentTrustScorePct: 88
        });

        assert.equal(resL1.status, "executed");
        assert.equal(resL1.executedAutonomously, true);

        const resL2 = actionEngine.executeAction({
            actionId: "act_l2_001",
            agentRole: "cro",
            domain: "sales",
            actionLevel: 2,
            title: "Draft Annual Plan Offer Proposal",
            description: "Generates draft email templates for sales review",
            estimatedCostUSD: 0,
            riskClassification: "reversible",
            rollbackPlan: "Delete draft email templates",
            agentTrustScorePct: 88
        });

        assert.equal(resL2.status, "executed");
        assert.equal(resL2.executedAutonomously, true);
    });

    it("2. Level 3 actions always queue for human executive approval", () => {
        const resL3 = actionEngine.executeAction({
            actionId: "act_l3_001",
            agentRole: "cfo",
            domain: "finance",
            actionLevel: 3,
            title: "Cancel Datadog Subscription ($1,200/mo)",
            description: "Cancels inactive monitoring subscription",
            estimatedCostUSD: 1200,
            riskClassification: "reversible",
            rollbackPlan: "Re-activate Datadog account via API",
            agentTrustScorePct: 92
        });

        assert.equal(resL3.status, "queued_for_approval");
        assert.equal(resL3.executedAutonomously, false);
        assert.equal(resL3.requiresHumanSignoff, true);
    });

    it("3. Level 4 autonomous execution requires agent trust score > 95%", () => {
        // Low trust score (92%) -> Denied L4 autonomy, queued for approval
        const resLowTrust = actionEngine.executeAction({
            actionId: "act_l4_low_trust",
            agentRole: "coo",
            domain: "operations",
            actionLevel: 4,
            title: "Automated Operator Threshold Adjust",
            description: "Adjusts operator spend limit",
            estimatedCostUSD: 500,
            riskClassification: "reversible",
            rollbackPlan: "Restore previous threshold",
            agentTrustScorePct: 92
        });

        assert.equal(resLowTrust.status, "queued_for_approval");
        assert.ok(resLowTrust.policyReason.includes("below required 95% threshold"));

        // High trust score (98%) -> Granted L4 autonomy
        const resHighTrust = actionEngine.executeAction({
            actionId: "act_l4_high_trust",
            agentRole: "coo",
            domain: "operations",
            actionLevel: 4,
            title: "Automated Operational Scaling",
            description: "Scales compute instances for workload surge",
            estimatedCostUSD: 500,
            riskClassification: "reversible",
            rollbackPlan: "Scale down instances",
            agentTrustScorePct: 98
        });

        assert.equal(resHighTrust.status, "executed");
        assert.equal(resHighTrust.executedAutonomously, true);
        assert.ok(resHighTrust.passportId);
    });

    it("4. Irreversible actions always require approval regardless of trust score", () => {
        const resIrreversible = actionEngine.executeAction({
            actionId: "act_l4_irreversible",
            agentRole: "cfo",
            domain: "finance",
            actionLevel: 4,
            title: "Permanent Database Archive Deletion",
            description: "Deletes old database backups",
            estimatedCostUSD: 100,
            riskClassification: "irreversible",
            rollbackPlan: "Cannot be undone",
            agentTrustScorePct: 99
        });

        assert.equal(resIrreversible.status, "queued_for_approval");
        assert.ok(resIrreversible.policyReason.includes("Irreversible actions always require human sign-off"));
    });

    it("5. Daily domain spend caps block autonomous over-spend", () => {
        policyEngine.resetDailySpend();

        // Finance daily cap is $2,000. Executing $1,800 is allowed.
        const resAllowed = actionEngine.executeAction({
            actionId: "act_l4_spend_1",
            agentRole: "cfo",
            domain: "finance",
            actionLevel: 4,
            title: "SaaS License Payment",
            description: "Pays annual license fee",
            estimatedCostUSD: 1800,
            riskClassification: "reversible",
            rollbackPlan: "Request refund",
            agentTrustScorePct: 98
        });

        assert.equal(resAllowed.status, "executed");

        // Second payment of $500 pushes total spend to $2,300 ($2,300 > $2,000 cap) -> Queued
        const resOverCap = actionEngine.executeAction({
            actionId: "act_l4_spend_2",
            agentRole: "cfo",
            domain: "finance",
            actionLevel: 4,
            title: "Additional SaaS Payment",
            description: "Pays additional license fee",
            estimatedCostUSD: 500,
            riskClassification: "reversible",
            rollbackPlan: "Request refund",
            agentTrustScorePct: 98
        });

        assert.equal(resOverCap.status, "queued_for_approval");
        assert.ok(resOverCap.policyReason.includes("exceeds remaining daily finance spend cap"));
    });

    it("6. Registers and executes rollback plans for side-effecting actions", () => {
        const rollbackRes = actionEngine.rollbackAction("act_l4_high_trust");
        assert.equal(rollbackRes.success, true);
        assert.equal(rollbackRes.rollbackPlan, "Scale down instances");
    });
});
