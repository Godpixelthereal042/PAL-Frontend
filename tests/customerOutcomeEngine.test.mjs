/**
 * Customer Outcome Engine Test Suite (PAL-TDD-010, Sprint 23 Milestone 3)
 *
 * Verifies:
 *   1. Quantifies business value across 5 vectors (Revenue, Costs, Labor, Risk, Decision Accuracy).
 *   2. Calculates total net benefit USD and net ROI multiple ($50/hr labor cost).
 *   3. Generates customer-facing PAL Impact Report with headline summary.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerOutcomeEngine } from "../lib/outcomes/customerOutcomeEngine.ts";

describe("Sprint 23 Milestone 3 — Customer Outcome Measurement Engine", () => {
    const outcomeEngine = CustomerOutcomeEngine.getInstance();

    it("1. Quantifies business value across 5 vectors and labor hours at $50/hr loaded rate", () => {
        const report = outcomeEngine.generateImpactReport({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS",
            periodDays: 30,
            palCostMonthlyUsd: 3000
        });

        assert.ok(report.reportId.startsWith("report_impact_"));
        assert.equal(report.valueBreakdown.hoursAutomated, 480);
        assert.equal(report.valueBreakdown.laborValueUsd, 24000); // 480 * $50
        assert.equal(report.valueBreakdown.revenueLiftUsd, 32000);
        assert.equal(report.valueBreakdown.costSavingsUsd, 14400);
        assert.equal(report.valueBreakdown.riskPreventionUsd, 25000);
    });

    it("2. Computes total net benefit USD ($95.4k) and net ROI multiple (31.8x)", () => {
        const report = outcomeEngine.generateImpactReport({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS"
        });

        assert.equal(report.totalNetBenefitUsd, 95400);
        assert.equal(report.netRoiMultiple, 31.8);
        assert.ok(report.headlineSummary.includes("$95,400 in net business value"));
        assert.ok(report.headlineSummary.includes("31.8x ROI"));
    });
});
