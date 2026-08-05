/**
 * Commercial Billing Engine Test Suite (PAL-TDD-015, Phase 4)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommercialBillingEngine } from "../lib/billing/commercialBillingEngine.ts";

describe("Phase 4 — Commercial Billing & Subscription Engine", () => {
    const billingEngine = CommercialBillingEngine.getInstance();

    it("1. Retrieves default Growth subscription ($1,499/mo, 10 AI Employees, 1,000 Actions)", () => {
        const sub = billingEngine.getSubscription("ws_billing_test_101");

        assert.equal(sub.tier, "Growth");
        assert.equal(sub.monthlyPriceUsd, 1499);
        assert.equal(sub.maxAiEmployees, 10);
        assert.equal(sub.maxAutonomousActionsPerMonth, 1000);
        assert.equal(sub.status, "ACTIVE");
    });

    it("2. Upgrades subscription to Enterprise tier ($4,999/mo, unlimited employees & actions)", () => {
        const upgraded = billingEngine.upgradeTier("ws_billing_test_101", "Enterprise");

        assert.equal(upgraded.tier, "Enterprise");
        assert.equal(upgraded.monthlyPriceUsd, 4999);
        assert.equal(upgraded.maxAiEmployees, -1);
        assert.equal(upgraded.maxAutonomousActionsPerMonth, -1);
    });
});
