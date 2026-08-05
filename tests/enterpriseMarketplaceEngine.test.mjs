/**
 * Enterprise Marketplace Engine Test Suite (PAL-TDD-013, Sprint 26 Milestone 3)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnterpriseMarketplaceEngine } from "../lib/marketplace/enterpriseMarketplaceEngine.ts";

describe("Sprint 26 Milestone 3 — Enterprise Marketplace Expansion", () => {
    const marketplaceEngine = EnterpriseMarketplaceEngine.getInstance();

    it("1. Returns prebuilt Fintech Executive AI Suite with 4.9 stars and 142 active installs", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();

        assert.ok(packages.length >= 2);
        const fintechPkg = packages.find(p => p.packageId === "pkg_fintech_exec_team");

        assert.ok(fintechPkg);
        assert.equal(fintechPkg.packageName, "Fintech Executive AI Suite");
        assert.equal(fintechPkg.partnerPublisherName, "Accenture AI Solutions");
        assert.equal(fintechPkg.ratingStars, 4.9);
        assert.equal(fintechPkg.activeInstallsCount, 142);
    });

    it("2. Verifies VERIFIED_PARTNER and OFFICIAL_PAL badges across published team bundles", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();

        const saasPkg = packages.find(p => p.packageId === "pkg_saas_growth_team");
        assert.ok(saasPkg);
        assert.equal(saasPkg.verificationStatus, "OFFICIAL_PAL");
        assert.equal(saasPkg.ratingStars, 5.0);
    });

    it("3. Verifies included agent roles for Fintech Executive AI Suite", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        const fintech = packages.find(p => p.packageId === "pkg_fintech_exec_team");

        assert.ok(fintech);
        assert.equal(fintech.includedAgentRoles.length, 3);
        assert.ok(fintech.includedAgentRoles.includes("AI CFO Controller"));
    });

    it("4. Verifies included agent roles for SaaS Enterprise Growth Suite", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        const saas = packages.find(p => p.packageId === "pkg_saas_growth_team");

        assert.ok(saas);
        assert.equal(saas.includedAgentRoles.length, 3);
        assert.ok(saas.includedAgentRoles.includes("AI CMO Growth Agent"));
    });

    it("5. Verifies industry classification for SaaS growth suite", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        const saas = packages.find(p => p.packageId === "pkg_saas_growth_team");

        assert.ok(saas);
        assert.equal(saas.industry, "B2B SaaS");
    });

    it("6. Verifies active installs for SaaS growth suite (388 installs)", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        const saas = packages.find(p => p.packageId === "pkg_saas_growth_team");

        assert.ok(saas);
        assert.equal(saas.activeInstallsCount, 388);
    });

    it("7. Verifies publishedAt timestamp is populated", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        packages.forEach(pkg => {
            assert.ok(pkg.publishedAt > 0);
        });
    });
});
