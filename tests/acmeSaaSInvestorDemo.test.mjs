/**
 * Acme SaaS Investor Demo Test Suite (PAL-TDD-015, Phase 6)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AcmeSaaSInvestorDemo } from "../lib/demo/acmeSaaSInvestorDemo.ts";

describe("Phase 6 — Acme SaaS Investor Demo Mode", () => {
    const demoEngine = AcmeSaaSInvestorDemo.getInstance();

    it("1. Generates Acme SaaS morning briefing with $18,400 monthly recovery opportunity", () => {
        const briefing = demoEngine.getAcmeBriefing();

        assert.equal(briefing.companyName, "Acme SaaS");
        assert.ok(briefing.briefingHeadline.includes("Revenue risk increased"));
        assert.equal(briefing.monthlyRecoveryUsd, 18400);
        assert.equal(briefing.inefficientWorkflowsCount, 3);
        assert.equal(briefing.expansionOpportunitiesCount, 2);
        assert.equal(briefing.evidenceDetails.length, 3);
    });

    it("2. Verifies execution outcome summary references $18,400 monthly recovery secured", () => {
        const briefing = demoEngine.getAcmeBriefing();
        assert.ok(briefing.executionOutcomeSummary.includes("$18,400 monthly recovery secured"));
    });
});
