/**
 * Customer Benchmark Engine Test Suite (PAL-TDD-011, Sprint 24 Milestone 3)
 *
 * Verifies:
 *   1. Compares customer KPIs against Industry Median and Top Quartile (P75) benchmarks.
 *   2. Evaluates performance tiers (top_quartile, below_median, bottom_quartile) and gap-closing playbooks.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerBenchmarkEngine } from "../lib/intelligence/customerBenchmarkEngine.ts";

describe("Sprint 24 Milestone 3 — Customer Benchmark Intelligence", () => {
    const benchmarkEngine = CustomerBenchmarkEngine.getInstance();

    it("1. Compares customer churn rate (7.2%) against industry median (5.8%) and top quartile (3.4%)", () => {
        const report = benchmarkEngine.generateBenchmarkReport("ws_acme_saas_prod");

        assert.ok(report.reportId.startsWith("report_bench_"));
        assert.equal(report.comparisons.length, 3);

        const churnComp = report.comparisons.find(c => c.metricKey === "saas_churn_pct");
        assert.ok(churnComp);
        assert.equal(churnComp.customerCurrentValue, 7.2);
        assert.equal(churnComp.industryMedianValue, 5.8);
        assert.equal(churnComp.topQuartileValue, 3.4);
        assert.equal(churnComp.performanceTier, "below_median");
        assert.equal(churnComp.gapToTopQuartile, 3.8);
    });

    it("2. Identifies top quartile metrics (Gross Margin 78.5%) and generates gap-closing playbooks for lagging metrics", () => {
        const report = benchmarkEngine.generateBenchmarkReport("ws_acme_saas_prod");

        const marginComp = report.comparisons.find(c => c.metricKey === "gross_margin_pct");
        const leadComp = report.comparisons.find(c => c.metricKey === "lead_response_hours");

        assert.ok(marginComp);
        assert.equal(marginComp.performanceTier, "top_quartile");

        assert.ok(leadComp);
        assert.equal(leadComp.performanceTier, "bottom_quartile");
        assert.ok(leadComp.recommendedAction.includes("Sales Agent Auto-Qualification"));
    });
});
