/**
 * PAL Sales Intelligence Engine Test Suite (PAL-TDD-012, Sprint 25 Milestone 1)
 *
 * Verifies:
 *   1. Qualifies prospect enterprise fit score (94%) and predicts 18.5x pre-deployment ROI.
 *   2. Recommends Enterprise Autonomous Suite tier and handles security/integration objections.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PalSalesIntelligenceEngine } from "../lib/sales/palSalesIntelligenceEngine.ts";

describe("Sprint 25 Milestone 1 — PAL Sales Intelligence Engine", () => {
    const salesEngine = PalSalesIntelligenceEngine.getInstance();

    it("1. Analyzes prospect domain, evaluates 94% enterprise fit score, and predicts 18.5x ROI", () => {
        const analysis = salesEngine.analyzeProspect("enterprise.com", "Enterprise Cloud Inc");

        assert.ok(analysis.analysisId.startsWith("sales_anl_"));
        assert.equal(analysis.enterpriseFitScorePct, 94);
        assert.equal(analysis.predictedAnnualRoiMultiple, 18.5);
        assert.equal(analysis.predictedAnnualValueUsd, 666000);
        assert.equal(analysis.readinessStatus, "DEPLOYMENT_READY");
    });

    it("2. Recommends Enterprise Autonomous suite tier and provides objection handling notes", () => {
        const analysis = salesEngine.analyzeProspect("enterprise.com", "Enterprise Cloud Inc");

        assert.equal(analysis.recommendedSuiteTier, "Enterprise Autonomous");
        assert.equal(analysis.objectionHandlingNotes.length, 3);
        assert.ok(analysis.objectionHandlingNotes[0].includes("SOC 2 Type II"));
    });
});
