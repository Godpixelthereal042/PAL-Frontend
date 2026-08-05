/**
 * Growth Strategy Engine Test Suite (PAL-TDD-011, Sprint 24 Milestone 2)
 *
 * Verifies:
 *   1. Evaluates strategic growth opportunities (pricing, market expansion, hiring).
 *   2. Quantifies expected USD revenue impact and high AI confidence scores (>85%).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GrowthStrategyEngine } from "../lib/growth/growthStrategyEngine.ts";

describe("Sprint 24 Milestone 2 — Autonomous Growth Advisor", () => {
    const growthEngine = GrowthStrategyEngine.getInstance();

    it("1. Evaluates growth opportunities across pricing, market expansion, and hiring categories", () => {
        const opportunities = growthEngine.evaluateGrowthOpportunities("ws_acme_saas_prod");

        assert.ok(opportunities.length >= 3);
        const pricingOpp = opportunities.find(o => o.category === "pricing");
        const emeaOpp = opportunities.find(o => o.category === "expansion");

        assert.ok(pricingOpp);
        assert.equal(pricingOpp.expectedRevenueImpactUsd, 54000);
        assert.equal(pricingOpp.confidenceScorePct, 96);

        assert.ok(emeaOpp);
        assert.equal(emeaOpp.expectedRevenueImpactUsd, 82000);
    });

    it("2. Verifies high confidence scores (>85%) on strategic revenue recommendations", () => {
        const opportunities = growthEngine.evaluateGrowthOpportunities("ws_acme_saas_prod");

        for (const opp of opportunities) {
            assert.ok(opp.confidenceScorePct >= 85);
            assert.ok(opp.expectedRevenueImpactUsd > 0);
        }
    });
});
