/**
 * Pricing Optimization Engine Test Suite (PAL-TDD-012, Sprint 25 Milestone 3)
 *
 * Verifies:
 *   1. Calculates Value-to-Price ratio ($42,000 value vs $999 price = 42.0x ratio).
 *   2. Flags account as underpriced when ratio > 10.0x and generates Enterprise tier upgrade recommendation.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PricingOptimizationEngine } from "../lib/billing/pricingOptimizationEngine.ts";

describe("Sprint 25 Milestone 3 — PAL Pricing & Packaging Intelligence", () => {
    const pricingEngine = PricingOptimizationEngine.getInstance();

    it("1. Calculates 42.0x Value-to-Price ratio for account receiving $42,000 monthly value", () => {
        const analysis = pricingEngine.evaluateAccountPricing({
            workspaceId: "ws_acme_saas_prod"
        });

        assert.ok(analysis.analysisId.startsWith("anl_price_"));
        assert.equal(analysis.currentMonthlyPriceUsd, 999);
        assert.equal(analysis.measuredMonthlyValueUsd, 42000);
        assert.equal(analysis.valueToPriceRatio, 42.0);
    });

    it("2. Flags underpriced account and recommends Enterprise Autonomous Suite upgrade", () => {
        const analysis = pricingEngine.evaluateAccountPricing({
            workspaceId: "ws_acme_saas_prod"
        });

        assert.equal(analysis.isUnderpriced, true);
        assert.equal(analysis.recommendedPlanName, "Enterprise Autonomous Suite");
        assert.equal(analysis.recommendedMonthlyPriceUsd, 2999);
        assert.ok(analysis.suggestedUpgradeHeadline.includes("42x ratio"));
    });
});
