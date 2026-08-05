import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ConsensusConfidenceCalculator, ExecutiveCouncil } from "../lib/strategy/executiveCouncil.ts";
import { AgentNegotiationEngine } from "../lib/strategy/agentNegotiationEngine.ts";

describe("Sprint 6 — Milestone 3: Multi-Agent Negotiation & Executive Council Consensus", () => {
    it("ConsensusConfidenceCalculator evaluates weighted consensus score and aggregate confidence", () => {
        const calculator = new ConsensusConfidenceCalculator();

        const votes = [
            { memberId: "m1", memberName: "CFO", department: "finance", vote: "YES", confidence: 0.90, voteWeight: 3.0, rationale: "Approved", timestamp: Date.now() },
            { memberId: "m2", memberName: "CTO", department: "engineering", vote: "YES", confidence: 0.95, voteWeight: 3.0, rationale: "Approved", timestamp: Date.now() },
            { memberId: "m3", memberName: "CMO", department: "marketing", vote: "NO", confidence: 0.80, voteWeight: 2.0, rationale: "Too costly", timestamp: Date.now() }
        ];

        const res = calculator.calculateConsensus(votes);
        assert.ok(res.consensusScore > 0.70);
        assert.ok(res.aggregateConfidence >= 0.88);
    });

    it("AgentNegotiationEngine executes multi-round debate, proposal revision, weighted voting, and dissent recording", async () => {
        const engine = new AgentNegotiationEngine();

        const sampleProposal = {
            id: "prop_101",
            title: "Automate Enterprise Customer Onboarding Pipeline",
            objective: "Reduce onboarding cycle time from 5 days to 4 hours",
            expectedBenefitUSD: 25000,
            estimatedCostUSD: 18000,
            estimatedRisk: 30,
            reversibilityScore: 0.85,
            supportingEvidence: ["HubSpot deal conversion data", "Stripe payment history"],
            affectedDepartments: ["sales", "engineering", "finance"],
            strategyAlignment: 92,
            confidence: 0.90,
            createdAt: Date.now()
        };

        const result = await engine.negotiateProposal(sampleProposal);

        assert.equal(result.approved, true);
        assert.ok(result.consensusScore >= 0.65);
        assert.equal(result.history.length, 2);
        assert.ok(result.votes.length >= 5);

        // Verify Dissent Recording capability
        const highRiskProposal = {
            ...sampleProposal,
            id: "prop_high_risk",
            estimatedCostUSD: 50000, // Trigger CFO dissent (>20k)
            estimatedRisk: 80 // Trigger Legal dissent (>70)
        };

        const highRiskResult = await engine.negotiateProposal(highRiskProposal);
        assert.ok(highRiskResult.dissentingVotes.length >= 2);
        assert.ok(highRiskResult.dissentingVotes.some((d) => d.department === "finance"));
        assert.ok(highRiskResult.dissentingVotes.some((d) => d.department === "general"));
    });
});
