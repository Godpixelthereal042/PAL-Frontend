/**
 * Intelligence Moat Engine Test Suite (PAL-TDD-010, Sprint 23 Milestone 6)
 *
 * Verifies:
 *   1. Evaluates network intelligence metrics across active pilot companies (18 companies, 41.2k decisions).
 *   2. Calculates cross-company recommendation accuracy lift (+15.6%) and 95% Network Intelligence Score.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IntelligenceMoatEngine } from "../lib/network/intelligenceMoatEngine.ts";

describe("Sprint 23 Milestone 6 — Intelligence Moat Dashboard", () => {
    const moatEngine = IntelligenceMoatEngine.getInstance();

    it("1. Evaluates global decision volume and anonymized cross-company pattern extraction", () => {
        const moat = moatEngine.evaluateIntelligenceMoat();

        assert.equal(moat.totalPilotCompanies, 18);
        assert.equal(moat.totalDecisionsAnalyzed, 41200);
        assert.ok(moat.anonymizedPatternsExtracted >= 1000);
        assert.equal(moat.isMoatExpanding, true);
    });

    it("2. Quantifies +15.6% recommendation accuracy lift and 95% Network Intelligence Score", () => {
        const moat = moatEngine.evaluateIntelligenceMoat();

        assert.equal(moat.baselineAccuracyPct, 81.2);
        assert.equal(moat.currentNetworkAccuracyPct, 96.8);
        assert.equal(moat.accuracyLiftPct, 15.6);
        assert.equal(moat.networkIntelligenceScorePct, 95);
    });
});
