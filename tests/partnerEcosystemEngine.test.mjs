/**
 * Partner Ecosystem Engine Test Suite (PAL-TDD-013, Sprint 26 Milestone 1)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PartnerEcosystemEngine } from "../lib/partners/partnerEcosystemEngine.ts";

describe("Sprint 26 Milestone 1 — Partner Ecosystem Engine", () => {
    const partnerEngine = PartnerEcosystemEngine.getInstance();

    it("1. Registers enterprise consulting partner, Gold tier certification, and 14 active deployments", () => {
        const partner = partnerEngine.registerPartner("Accenture AI Solutions", "Consulting");

        assert.ok(partner.partnerId.startsWith("ptr_"));
        assert.equal(partner.partnerName, "Accenture AI Solutions");
        assert.equal(partner.partnerType, "Consulting");
        assert.equal(partner.certificationTier, "Gold");
        assert.equal(partner.activeDeploymentsCount, 14);
    });

    it("2. Attributes $126,000 in partner revenue and tracks 96% referral performance score", () => {
        const partner = partnerEngine.registerPartner("Accenture AI Solutions", "Consulting");

        assert.equal(partner.attributedRevenueUsd, 126000);
        assert.equal(partner.referralPerformanceScorePct, 96);
    });

    it("3. Registers implementation partner profile", () => {
        const partner = partnerEngine.registerPartner("Slalom Consulting", "Implementation");
        assert.equal(partner.partnerType, "Implementation");
    });

    it("4. Registers AI agent creator partner profile", () => {
        const partner = partnerEngine.registerPartner("Cognitive Labs", "Agent_Creator");
        assert.equal(partner.partnerType, "Agent_Creator");
    });

    it("5. Registers industry specialist partner profile", () => {
        const partner = partnerEngine.registerPartner("HealthTech AI Specialists", "Specialist");
        assert.equal(partner.partnerType, "Specialist");
    });

    it("6. Retrieves stored partner profile by partnerId", () => {
        const partner = partnerEngine.registerPartner("PwC AI Advisory", "Consulting");
        const fetched = partnerEngine.getPartner(partner.partnerId);
        assert.ok(fetched);
        assert.equal(fetched.partnerName, "PwC AI Advisory");
    });

    it("7. Verifies partner joinedAt timestamp is recent", () => {
        const partner = partnerEngine.registerPartner("Deloitte Digital", "Implementation");
        assert.ok(partner.joinedAt <= Date.now());
    });
});
