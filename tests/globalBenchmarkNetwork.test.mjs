/**
 * Global Benchmark Network Test Suite (PAL-TDD-014, Sprint 27 Milestone 3)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GlobalBenchmarkNetwork } from "../lib/network/globalBenchmarkNetwork.ts";

describe("Sprint 27 Milestone 3 — PAL Global Benchmark Network", () => {
    const benchmarkNetwork = GlobalBenchmarkNetwork.getInstance();

    it("1. Computes anonymous benchmark with k-anonymity (k=10 >= 5) and differential privacy (eps=0.5)", () => {
        const bmk = benchmarkNetwork.computeAnonymousBenchmark("B2B SaaS");

        assert.ok(bmk.benchmarkId.startsWith("bmk_net_"));
        assert.equal(bmk.kAnonymityFactor, 10);
        assert.equal(bmk.differentialPrivacyEpsilon, 0.5);
        assert.equal(bmk.isPrivacyProtected, true);
    });

    it("2. Evaluates 88th percentile Gross Margin and 94th percentile AI Adoption score", () => {
        const bmk = benchmarkNetwork.computeAnonymousBenchmark("B2B SaaS");

        assert.equal(bmk.grossMarginPercentile, 88);
        assert.equal(bmk.aiAdoptionPercentile, 94);
        assert.equal(bmk.operationalEfficiencyScore, 92);
    });
});
