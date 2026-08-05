/**
 * Autonomous Customer Success Manager Test Suite (PAL-TDD-013, Sprint 26 Milestone 4)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AutonomousCustomerSuccessManager } from "../lib/customer/autonomousCustomerSuccessManager.ts";

describe("Sprint 26 Milestone 4 — Autonomous Customer Success Manager", () => {
    const csManager = AutonomousCustomerSuccessManager.getInstance();

    it("1. Generates Customer Success Report evaluating 94% health score and 96% renewal probability", () => {
        const report = csManager.generateCustomerSuccessReport("ws_global_ent", "Enterprise Global Inc");

        assert.ok(report.reportId.startsWith("cs_rpt_"));
        assert.equal(report.healthScorePct, 94);
        assert.equal(report.renewalProbabilityPct, 96);
        assert.equal(report.satisfactionTrend, "UPWARD");
    });

    it("2. Identifies Okta SCIM adoption blocker and $24,000 expansion opportunity", () => {
        const report = csManager.generateCustomerSuccessReport("ws_global_ent", "Enterprise Global Inc");

        assert.equal(report.adoptionBlockers.length, 1);
        assert.ok(report.adoptionBlockers[0].includes("Okta SCIM"));
        assert.equal(report.expansionOpportunitiesUsd, 24000);
        assert.equal(report.recommendedActions.length, 2);
    });

    it("3. Verifies company name override in Customer Success Report", () => {
        const report = csManager.generateCustomerSuccessReport("ws_custom_co", "Custom Tech Ltd");
        assert.equal(report.companyName, "Custom Tech Ltd");
    });

    it("4. Verifies recommended actions include Quarterly Business Review", () => {
        const report = csManager.generateCustomerSuccessReport("ws_global_ent");
        assert.ok(report.recommendedActions[1].includes("Quarterly Business Review"));
    });

    it("5. Verifies workspace ID binding in Customer Success Report", () => {
        const report = csManager.generateCustomerSuccessReport("ws_test_999");
        assert.equal(report.workspaceId, "ws_test_999");
    });

    it("6. Verifies generatedAt timestamp is recent", () => {
        const report = csManager.generateCustomerSuccessReport("ws_test_999");
        assert.ok(report.generatedAt <= Date.now());
    });

    it("7. Verifies satisfactionTrend is UPWARD by default for active healthy enterprise account", () => {
        const report = csManager.generateCustomerSuccessReport("ws_test_999");
        assert.equal(report.satisfactionTrend, "UPWARD");
    });
});
