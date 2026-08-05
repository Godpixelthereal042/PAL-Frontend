/**
 * PAL AI Employee Marketplace 2.0 Test Suite (PAL-TDD-007, Sprint 20 Milestone 7)
 *
 * Verifies:
 *   1. Filters AI employee listings by industry vertical (e.g. Healthcare, Finance).
 *   2. Enforces certification levels and compliance badges (HIPAA, SOC2, GDPR).
 *   3. Installs verified AI employees into enterprise workspaces.
 *   4. Partner ecosystem allows publishing third-party certified AI employees.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AIEmployeeMarketplace } from "../lib/marketplace/aiEmployeeMarketplace.ts";

describe("Sprint 20 Milestone 7 — PAL Enterprise AI Employee Marketplace 2.0", () => {
    const marketplace = AIEmployeeMarketplace.getInstance();

    it("1. Filters AI employee listings by industry vertical (Healthcare)", () => {
        const healthcareAgents = marketplace.getListings({ industry: "healthcare" });

        assert.ok(healthcareAgents.length >= 2);
        assert.ok(healthcareAgents.every(a => a.industry === "healthcare"));
        assert.ok(healthcareAgents.some(a => a.name === "Healthcare Compliance Officer AI"));
    });

    it("2. Filters by compliance badges (HIPAA certified)", () => {
        const hipaaAgents = marketplace.getListings({ complianceBadge: "HIPAA" });

        assert.ok(hipaaAgents.length >= 2);
        assert.ok(hipaaAgents.every(a => a.complianceBadges.includes("HIPAA")));
    });

    it("3. Installs certified AI employee into enterprise workspace and updates metrics", () => {
        const initialListings = marketplace.getListings({ industry: "finance" });
        const targetId = initialListings[0].employeeId;

        const installRes = marketplace.installAIEmployee("ws_demo_company", targetId);
        assert.equal(installRes.success, true);
        assert.ok(installRes.installedCount >= 1);
    });

    it("4. Allows partner ecosystem to publish third-party certified AI employees", () => {
        const published = marketplace.publishPartnerAIEmployee({
            name: "Retail Inventory Strategist AI",
            roleTitle: "Omnichannel Supply Chain Analyst",
            industry: "retail",
            certificationLevel: "partner",
            complianceBadges: ["SOC2_TYPE2"],
            performanceMetrics: {
                installCount: 1,
                satisfactionScorePct: 100,
                avgROIPct: 150,
                tasksCompleted: 10
            },
            publisherName: "LogiTech Solutions",
            monthlyPriceUSD: 349,
            description: "Predicts seasonal stockouts and automates vendor purchase orders."
        });

        assert.ok(published.employeeId.startsWith("emp_ret_"));
        assert.equal(published.name, "Retail Inventory Strategist AI");

        const retailListings = marketplace.getListings({ industry: "retail" });
        assert.equal(retailListings.length, 1);
    });
});
