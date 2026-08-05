/**
 * ROI Proof Engine Test Suite (PAL-TDD-008, Sprint 21 Milestone 6)
 *
 * Verifies:
 *   1. Calculates revenue impact, cost reduction, labor hours saved, and total business value.
 *   2. Evaluates ROI multiple formula correctly (`totalBusinessValue / palCost`).
 *   3. Formats investor and enterprise sales case study headlines.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ROIProofEngine } from "../lib/outcomes/roiProofEngine.ts";

describe("Sprint 21 Milestone 6 — ROI Proof Engine & Investor Reports", () => {
    const roiEngine = ROIProofEngine.getInstance();

    it("1. Calculates complete financial impact and ROI multiple over 90 days", () => {
        const report = roiEngine.generateROIReport({
            workspaceId: "ws_acme_saas",
            companyName: "Acme SaaS",
            timeframeDays: 90,
            beforePALMonthlyRevenueUSD: 50000,
            beforePALMonthlyExpensesUSD: 35000,
            afterPALMonthlyRevenueUSD: 64000,   // +$14k/mo rev lift -> $42k over 90 days
            afterPALMonthlyExpensesUSD: 31000,  // -$4k/mo cost reduction -> $12k over 90 days
            hoursAutomatedPerMonth: 100,        // 300 hrs @ $50/hr -> $15k labor savings
            monthlyPALSubscriptionCostUSD: 1000 // $3k total PAL cost over 90 days
        });

        assert.ok(report.reportId.startsWith("roi_"));
        assert.equal(report.revenueImpactUSD, 42000);
        assert.equal(report.costReductionUSD, 12000);
        assert.equal(report.hoursSaved, 300);
        assert.equal(report.laborSavingsUSD, 15000);
        // Total value = 42000 + 12000 + 15000 = 69000
        assert.equal(report.totalBusinessValueUSD, 69000);
        // ROI Multiple = 69000 / 3000 = 23.0x
        assert.equal(report.roiMultiple, 23.0);
        assert.ok(report.caseStudyHeadline.includes("23x ROI"));
    });

    it("2. Formats case study report headline for board decks and sales collateral", () => {
        const report = roiEngine.getReport("ws_acme_saas");

        assert.ok(report);
        assert.ok(report.caseStudyHeadline.includes("PAL generated $69,000 total business value"));
    });
});
