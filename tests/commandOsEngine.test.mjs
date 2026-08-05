/**
 * Command OS Engine Verification Suite (PAL-TDD-007, Sprint 20 Milestone 1)
 *
 * Verifies:
 *   1. Health score calculation matches composite dimension weights.
 *   2. Health grade thresholds operate correctly (A+ >= 95 down to F < 40).
 *   3. Risk alerts are properly classified and aggregated.
 *   4. Growth opportunities present estimated revenue impact and confidence scores.
 *   5. Pending decisions are ranked by composite (urgency × impact) rating.
 *   6. AI workforce telemetry accurately reflects executive agent statuses.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PalCommandOsEngine } from "../lib/commandOs/commandOsEngine.ts";

describe("Sprint 20 Milestone 1 — PAL Enterprise Command OS Engine", () => {
    const engine = PalCommandOsEngine.getInstance();

    it("1. Calculates composite health score accurately according to dimension weights", () => {
        const report = engine.generateCompanyHealthReport("ws_demo_company");

        // Verify dimensions sum of weights = 1.0
        const totalWeight = report.dimensions.reduce((acc, d) => acc + d.weight, 0);
        assert.equal(Math.round(totalWeight * 100) / 100, 1.0);

        // Expected score: (94*0.25) + (91*0.20) + (88*0.20) + (95*0.15) + (92*0.20) = 23.5 + 18.2 + 17.6 + 14.25 + 18.4 = 91.95 -> 92
        assert.equal(report.healthScore, 92);
    });

    it("2. Maps composite health scores to correct health grade thresholds", () => {
        assert.equal(engine.calculateHealthGrade(97), "A+");
        assert.equal(engine.calculateHealthGrade(92), "A");
        assert.equal(engine.calculateHealthGrade(75), "B");
        assert.equal(engine.calculateHealthGrade(60), "C");
        assert.equal(engine.calculateHealthGrade(45), "D");
        assert.equal(engine.calculateHealthGrade(30), "F");
    });

    it("3. Classifies and aggregates active enterprise risks", () => {
        const report = engine.generateCompanyHealthReport("ws_demo_company");

        assert.ok(report.activeRisks.length >= 3);
        const trialRisk = report.activeRisks.find(r => r.riskId === "rsk_001");
        assert.ok(trialRisk);
        assert.equal(trialRisk.severity, "medium");
        assert.equal(trialRisk.affectedDimension, "revenue");
    });

    it("4. Identifies growth opportunities with revenue impact and confidence scores", () => {
        const report = engine.generateCompanyHealthReport("ws_demo_company");

        assert.ok(report.growthOpportunities.length >= 2);
        const discountOpp = report.growthOpportunities.find(o => o.opportunityId === "opp_001");
        assert.ok(discountOpp);
        assert.equal(discountOpp.estimatedRevenueUSD, 45000);
        assert.equal(discountOpp.confidenceScore, 0.94);
    });

    it("5. Ranks pending decisions by composite urgency-impact score", () => {
        const report = engine.generateCompanyHealthReport("ws_demo_company");

        assert.ok(report.pendingDecisions.length >= 2);
        // Critical decision (92 * 1.5 = 138) should rank higher than High decision (85 * 1.2 = 102)
        assert.ok(report.pendingDecisions[0].urgencyImpactRank > report.pendingDecisions[1].urgencyImpactRank);
        assert.equal(report.pendingDecisions[0].decisionId, "dec_102");
    });

    it("6. Reports AI workforce operational telemetry across executive agents", () => {
        const report = engine.generateCompanyHealthReport("ws_demo_company");

        assert.ok(report.aiWorkforceStatus.length >= 4);
        const cfoAgent = report.aiWorkforceStatus.find(a => a.agentRole === "cfo");
        assert.ok(cfoAgent);
        assert.equal(cfoAgent.agentName, "Chief Financial Agent");
        assert.equal(cfoAgent.status, "executing");
    });
});
