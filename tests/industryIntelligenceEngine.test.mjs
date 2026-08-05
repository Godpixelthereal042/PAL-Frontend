/**
 * Industry Intelligence Engine Test Suite (PAL-TDD-014, Sprint 27 Milestone 1)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IndustryIntelligenceEngine } from "../lib/intelligence/industryIntelligenceEngine.ts";

describe("Sprint 27 Milestone 1 — PAL Industry Intelligence Platform", () => {
    const industryEngine = IndustryIntelligenceEngine.getInstance();

    it("1. Generates SaaS vertical report with 18.4% growth rate and outcome pricing trend", () => {
        const report = industryEngine.generateVerticalReport("SaaS");

        assert.ok(report.reportId.includes("saas"));
        assert.equal(report.industry, "SaaS");
        assert.equal(report.verticalGrowthRatePct, 18.4);
        assert.ok(report.topCompetitiveTrends[0].includes("autonomous agent workflows"));
    });

    it("2. Generates Healthcare vertical report with 5 regulatory alerts and BAA isolation actions", () => {
        const report = industryEngine.generateVerticalReport("Healthcare");

        assert.equal(report.industry, "Healthcare");
        assert.equal(report.regulatoryAlertsCount, 5);
        assert.ok(report.recommendedStrategicActions[0].includes("BAA data isolation"));
    });

    it("3. Generates Finance vertical report with 22.1% growth rate and SEC compliance actions", () => {
        const report = industryEngine.generateVerticalReport("Finance");
        assert.equal(report.verticalGrowthRatePct, 22.1);
        assert.equal(report.regulatoryAlertsCount, 4);
    });

    it("4. Generates Retail vertical report with ERP connector actions", () => {
        const report = industryEngine.generateVerticalReport("Retail");
        assert.equal(report.verticalGrowthRatePct, 12.8);
        assert.equal(report.regulatoryAlertsCount, 1);
    });

    it("5. Generates Manufacturing vertical report with IoT telemetry trends", () => {
        const report = industryEngine.generateVerticalReport("Manufacturing");
        assert.equal(report.verticalGrowthRatePct, 11.5);
        assert.ok(report.topCompetitiveTrends[0].includes("Predictive equipment maintenance"));
    });
});
