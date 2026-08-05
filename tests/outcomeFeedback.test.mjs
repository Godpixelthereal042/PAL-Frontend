import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DecisionLedger } from "../lib/strategy/decisionLedger.ts";
import { OutcomeFeedbackEngine } from "../lib/strategy/outcomeFeedbackEngine.ts";
import { SimulatedKnowledgeGraphProvider } from "../lib/strategy/knowledgeGraphBridge.ts";

describe("Sprint 6 — Milestone 5: Organizational Learning & Outcome Feedback Flywheel", () => {
    it("DecisionLedger appends immutable decision entries with version lineage", () => {
        const ledger = new DecisionLedger();

        const entry = ledger.appendEntry({
            decisionId: "dec_101",
            proposalId: "prop_101",
            strategyVersion: "v1.0_growth",
            policyVersion: "v1.0",
            constraintVersion: "v1.0",
            memorySnapshotVersion: "mem_snap_501",
            simulationId: "sim_301",
            councilVotes: [{ memberId: "m1", vote: "YES" }],
            predictedOutcome: { mrr_usd: 28000, cash_runway_months: 18.0 }
        });

        assert.equal(entry.decisionId, "dec_101");
        assert.equal(entry.strategyVersion, "v1.0_growth");
        assert.equal(entry.memorySnapshotVersion, "mem_snap_501");

        // Verify Object.freeze immutability
        assert.throws(() => {
            // @ts-ignore
            entry.decisionId = "dec_mutated";
        });
    });

    it("OutcomeFeedbackEngine performs deviation analysis and recommends policy adjustments", async () => {
        const engine = new OutcomeFeedbackEngine();

        // 1. Log decision entry
        engine.getLedger().appendEntry({
            decisionId: "dec_102",
            proposalId: "prop_102",
            strategyVersion: "v1.0_growth",
            policyVersion: "v1.0",
            constraintVersion: "v1.0",
            memorySnapshotVersion: "mem_snap_502",
            simulationId: "sim_302",
            councilVotes: [{ memberId: "cfo", vote: "YES" }],
            predictedOutcome: { mrr_usd: 30000 }
        });

        // 2. Analyze observed outcome (Actual = 24,000 USD vs Predicted 30,000 USD -> -20% error)
        const learning = await engine.analyzeOutcome("dec_102", { mrr_usd: 24000 });

        assert.ok(learning);
        assert.equal(learning.decisionId, "dec_102");
        assert.equal(learning.deviations.length, 1);
        assert.equal(learning.deviations[0].errorPercentage, -20);
        assert.equal(learning.confidenceAdjustment, -0.10);
        assert.ok(learning.policyRecommendation);
        assert.ok(learning.policyRecommendation.includes("15% threshold"));
    });

    it("SimulatedKnowledgeGraphProvider stores entities and relationships", async () => {
        const graph = new SimulatedKnowledgeGraphProvider();

        await graph.addEntity("cust_101", "Customer", { arrUSD: 12000 });
        await graph.addEntity("strat_v1", "Strategy", { name: "Growth" });
        await graph.addRelationship("cust_101", "strat_v1", "AFFECTED_BY", { impactScore: 85 });

        const neighbors = await graph.queryNeighbors("cust_101", "AFFECTED_BY");
        assert.equal(neighbors.length, 1);
        assert.equal(neighbors[0].targetEntity.id, "strat_v1");
        assert.equal(neighbors[0].properties.impactScore, 85);
    });
});
