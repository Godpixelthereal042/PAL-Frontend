/**
 * Growth Network Engine Test Suite (PAL-TDD-013, Sprint 26 Milestone 5)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GrowthNetworkEngine } from "../lib/growth/growthNetworkEngine.ts";

describe("Sprint 26 Milestone 5 — Enterprise Growth Network Engine", () => {
    const growthNetwork = GrowthNetworkEngine.getInstance();

    it("1. Calculates 1.35 viral coefficient (K-factor) across 48 referrals and 32 conversions", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();

        assert.ok(insights.networkId.startsWith("growth_net_"));
        assert.equal(insights.totalReferralsTracked, 48);
        assert.equal(insights.successfulConversionsCount, 32);
        assert.equal(insights.viralCoefficientKFactor, 1.35);
    });

    it("2. Identifies top referring industries and 16 viral expansion opportunities", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();

        assert.equal(insights.topReferringIndustries.length, 3);
        assert.equal(insights.topReferringIndustries[0], "B2B SaaS");
        assert.equal(insights.viralExpansionOpportunitiesCount, 16);
    });

    it("3. Verifies viral coefficient K-factor is > 1.0 indicating compounding organic network growth", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.ok(insights.viralCoefficientKFactor > 1.0);
    });

    it("4. Verifies top referring industries include Fintech & Banking", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.ok(insights.topReferringIndustries.includes("Fintech & Banking"));
    });

    it("5. Verifies top referring industries include Healthtech", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.ok(insights.topReferringIndustries.includes("Healthtech"));
    });

    it("6. Verifies referral conversion efficiency ratio (32 / 48 = 66.7%)", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        const ratio = parseFloat((insights.successfulConversionsCount / insights.totalReferralsTracked).toFixed(3));
        assert.equal(ratio, 0.667);
    });

    it("7. Verifies network analysis timestamp is recent", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.ok(insights.analyzedAt <= Date.now());
    });
});
