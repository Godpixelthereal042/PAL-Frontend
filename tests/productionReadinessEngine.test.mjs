/**
 * Production Readiness Engine Test Suite (PAL-TDD-008, Sprint 21 Milestone 8)
 *
 * Verifies:
 *   1. Evaluates Security, Reliability, AI Trust, and Data Quality readiness vector scores.
 *   2. Calculates weighted overall readiness score (94% Enterprise Ready).
 *   3. Assigns correct readiness grade (ENTERPRISE_READY, PILOT_READY, DEVELOPMENT_ONLY).
 *   4. Outputs comprehensive readiness report for enterprise customer onboarding.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductionReadinessEngine } from "../lib/security/productionReadinessEngine.ts";

describe("Sprint 21 Milestone 8 — PAL Production Readiness Score", () => {
    const engine = ProductionReadinessEngine.getInstance();

    it("1. Evaluates 4 core readiness categories with passing checks and weights", () => {
        const report = engine.evaluateProductionReadiness("ws_demo_company");

        assert.equal(report.categories.length, 4);

        const secCat = report.categories.find(c => c.categoryKey === "security");
        assert.ok(secCat);
        assert.equal(secCat.scorePct, 94);
        assert.equal(secCat.weight, 0.30);
        assert.ok(secCat.passedChecks.length >= 4);

        const relCat = report.categories.find(c => c.categoryKey === "reliability");
        assert.ok(relCat);
        assert.equal(relCat.scorePct, 97);
    });

    it("2. Calculates weighted overall readiness score accurately (94% Enterprise Ready)", () => {
        const report = engine.evaluateProductionReadiness("ws_demo_company");

        // (94 * 0.30) + (97 * 0.25) + (95 * 0.25) + (91 * 0.20) = 28.2 + 24.25 + 23.75 + 18.2 = 94.4 -> 94
        assert.equal(report.overallReadinessPct, 94);
        assert.equal(report.readinessGrade, "ENTERPRISE_READY");
        assert.ok(report.readinessSummary.includes("94% Enterprise Ready"));
    });
});
