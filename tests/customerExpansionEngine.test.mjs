/**
 * Customer Expansion Engine Test Suite (PAL-TDD-012, Sprint 25 Milestone 5)
 *
 * Verifies:
 *   1. Detects department usage surges (+240% Finance growth) and unserved enterprise workflows.
 *   2. Recommends deploying new specialized domain agents (AI Finance Controller Agent) with $18k/yr savings.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerExpansionEngine } from "../lib/customer/customerExpansionEngine.ts";

describe("Sprint 25 Milestone 5 — Customer Expansion Intelligence Engine", () => {
    const expansionEngine = CustomerExpansionEngine.getInstance();

    it("1. Detects department usage surges (+240% Finance growth) across active workspace roles", () => {
        const recommendations = expansionEngine.evaluateExpansionOpportunities("ws_acme_saas_prod");

        assert.ok(recommendations.length >= 2);
        const finRec = recommendations.find(r => r.department === "Finance");

        assert.ok(finRec);
        assert.equal(finRec.usageGrowthPct, 240);
        assert.equal(finRec.suggestedAgentRole, "AI Finance Controller Agent");
        assert.equal(finRec.projectedAdditionalValueUsd, 18000);
    });

    it("2. Projects additional annual USD value ($36,000) for Sales department AE agent expansion", () => {
        const recommendations = expansionEngine.evaluateExpansionOpportunities("ws_acme_saas_prod");

        const salesRec = recommendations.find(r => r.department === "Sales");
        assert.ok(salesRec);
        assert.equal(salesRec.projectedAdditionalValueUsd, 36000);
        assert.ok(salesRec.recommendedAction.includes("AI Enterprise AE Agent"));
    });
});
