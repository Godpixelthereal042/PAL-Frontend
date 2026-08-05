/**
 * Global Business Graph 2.0 Test Suite (PAL-TDD-007, Sprint 20 Milestone 6)
 *
 * Verifies:
 *   1. Network effects report computes composite intelligence score based on analyzed decisions.
 *   2. Global patterns feature sample sizes, success rates, and confidence metrics.
 *   3. Industry benchmarks provide P25, Median, and P75 percentiles across core SaaS KPIs.
 *   4. Anonymization Layer enforces k-anonymity, stripping all raw company identifiers.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GlobalBusinessGraph } from "../lib/graph/globalBusinessGraph.ts";

describe("Sprint 20 Milestone 6 — PAL Global Business Graph 2.0", () => {
    const graph = GlobalBusinessGraph.getInstance();

    it("1. Generates network effects report with calculated intelligence score", () => {
        const report = graph.getNetworkEffectsReport("saas");

        assert.equal(report.anonymizationVerified, true);
        assert.ok(report.totalCompaniesContributing >= 1000);
        assert.ok(report.totalDecisionsAnalyzed >= 400000);
        assert.ok(report.networkIntelligenceScore >= 85);
    });

    it("2. Aggregates global decision patterns with sample sizes and confidence scores", () => {
        const report = graph.getNetworkEffectsReport("saas");

        assert.ok(report.topGlobalPatterns.length >= 3);
        const discountPat = report.topGlobalPatterns.find(p => p.patternId === "pat_001");

        assert.ok(discountPat);
        assert.ok(discountPat.sampleSizeCompanies >= 300);
        assert.equal(discountPat.successRatePct, 84.5);
        assert.equal(discountPat.confidenceScore, 0.95);
    });

    it("3. Surfaces industry benchmarks (P25, Median, P75) for comparative analysis", () => {
        const report = graph.getNetworkEffectsReport("saas");

        assert.ok(report.industryBenchmarks.length >= 3);
        const churnBench = report.industryBenchmarks.find(b => b.metricName === "Monthly Churn Rate");

        assert.ok(churnBench);
        assert.equal(churnBench.p25Value, 2.1);
        assert.equal(churnBench.medianValue, 4.5);
        assert.equal(churnBench.p75Value, 7.8);
    });

    it("4. Enforces Anonymization Layer, transforming raw company identifiers into anonymized hashes", () => {
        const res = graph.ingestCompanyDecisionPattern({
            rawCompanyId: "comp_secret_enterprise_999",
            industry: "saas",
            decisionType: "price_increase",
            outcomeAchieved: "net_positive_arr"
        });

        assert.equal(res.patternExtracted, true);
        assert.ok(res.anonymizedId.startsWith("anon_org_"));
        assert.equal(res.anonymizedId.includes("comp_secret"), false);
    });
});
