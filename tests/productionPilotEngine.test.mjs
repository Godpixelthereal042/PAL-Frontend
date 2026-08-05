/**
 * Production Pilot Engine Test Suite (PAL-TDD-008, Sprint 21 Milestone 2)
 *
 * Verifies:
 *   1. Onboards SaaS pilot company and generates Day Zero Intelligence insight.
 *   2. Onboards E-commerce pilot company with inventory metrics and retention baseline.
 *   3. Onboards Agency pilot company with billable utilization metrics.
 *   4. Projects 90-day ROI in USD based on baseline financial inputs.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductionPilotEngine } from "../lib/pilot/productionPilotEngine.ts";

describe("Sprint 21 Milestone 2 — Real Company Pilot Infrastructure & Day Zero Intelligence", () => {
    const pilotEngine = ProductionPilotEngine.getInstance();

    it("1. Onboards SaaS pilot company and delivers instant Day Zero Intelligence insight", () => {
        const report = pilotEngine.onboardPilotCompany({
            workspaceId: "ws_saas_pilot",
            companyName: "Acme SaaS Solutions",
            industryTemplate: "saas",
            monthlyRevenueUSD: 50000,
            monthlyExpensesUSD: 35000,
            teamSize: 18
        });

        assert.ok(report.pilotId.startsWith("plt_"));
        assert.equal(report.companyName, "Acme SaaS Solutions");
        assert.equal(report.industryTemplate, "saas");
        assert.equal(report.baselineMetrics.arrUSD, 600000);
        assert.ok(report.dayZeroInsightHeadline.includes("reducing unutilized SaaS spend"));
        assert.ok(report.estimatedAnnualSavingsUSD > 0);
        assert.ok(report.projected90DayROIUSD > 50000);
    });

    it("2. Onboards E-commerce pilot company with inventory and repeat customer metrics", () => {
        const report = pilotEngine.onboardPilotCompany({
            workspaceId: "ws_ecom_pilot",
            companyName: "StyleDirect Store",
            industryTemplate: "ecommerce",
            monthlyRevenueUSD: 120000,
            monthlyExpensesUSD: 90000,
            teamSize: 12
        });

        assert.equal(report.industryTemplate, "ecommerce");
        assert.equal(report.baselineMetrics.inventoryTurnoverDays, 45);
        assert.ok(report.dayZeroInsightHeadline.includes("Inventory holding costs"));
    });

    it("3. Onboards Agency pilot company with billable utilization baseline", () => {
        const report = pilotEngine.onboardPilotCompany({
            workspaceId: "ws_agency_pilot",
            companyName: "Apex Digital Agency",
            industryTemplate: "agency",
            monthlyRevenueUSD: 80000,
            monthlyExpensesUSD: 55000,
            teamSize: 22
        });

        assert.equal(report.industryTemplate, "agency");
        assert.equal(report.baselineMetrics.billableUtilizationPct, 68.0);
        assert.ok(report.dayZeroInsightHeadline.includes("Billable team utilization is at 68%"));
    });
});
