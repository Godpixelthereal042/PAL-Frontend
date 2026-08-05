/**
 * Sprint 26 — PAL Enterprise Growth Network E2E Integration Suite (v2.6.0)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PartnerEcosystemEngine } from "../lib/partners/partnerEcosystemEngine.ts";
import { PalCertificationEngine } from "../lib/education/palCertificationEngine.ts";
import { EnterpriseMarketplaceEngine } from "../lib/marketplace/enterpriseMarketplaceEngine.ts";
import { AutonomousCustomerSuccessManager } from "../lib/customer/autonomousCustomerSuccessManager.ts";
import { GrowthNetworkEngine } from "../lib/growth/growthNetworkEngine.ts";

describe("Sprint 26 — PAL Enterprise Growth Network (v2.6.0 E2E)", () => {
    const partnerEngine = PartnerEcosystemEngine.getInstance();
    const certEngine = PalCertificationEngine.getInstance();
    const marketplaceEngine = EnterpriseMarketplaceEngine.getInstance();
    const csManager = AutonomousCustomerSuccessManager.getInstance();
    const growthNetwork = GrowthNetworkEngine.getInstance();

    const workspaceId = "ws_e2e_ecosystem_corp";

    it("1. Registers partner profile, assigns Gold tier, and attributes $126,000 revenue", () => {
        const partner = partnerEngine.registerPartner("Deloitte AI Practice", "Consulting");

        assert.equal(partner.partnerName, "Deloitte AI Practice");
        assert.equal(partner.certificationTier, "Gold");
        assert.equal(partner.attributedRevenueUsd, 126000);
    });

    it("2. Issues PAL Enterprise Architect certification for student scoring 94%", () => {
        const cert = certEngine.issueCertification({
            learnerId: "learner_707",
            learnerName: "Alice Miller",
            track: "PAL Enterprise Architect",
            scorePct: 94
        });

        assert.equal(cert.isCertified, true);
        assert.equal(cert.track, "PAL Enterprise Architect");
    });

    it("3. Catalogues prebuilt Fintech AI Suite with 4.9 star rating and 142 active installs", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        const fintech = packages.find(p => p.packageId === "pkg_fintech_exec_team");

        assert.ok(fintech);
        assert.equal(fintech.ratingStars, 4.9);
        assert.equal(fintech.activeInstallsCount, 142);
    });

    it("4. Evaluates 94% customer health score and 96% renewal probability in CS Report", () => {
        const report = csManager.generateCustomerSuccessReport(workspaceId, "Ecosystem Enterprise Corp");

        assert.equal(report.healthScorePct, 94);
        assert.equal(report.renewalProbabilityPct, 96);
        assert.equal(report.expansionOpportunitiesUsd, 24000);
    });

    it("5. Measures 1.35 viral coefficient K-factor across 48 enterprise customer referrals", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();

        assert.equal(insights.viralCoefficientKFactor, 1.35);
        assert.equal(insights.totalReferralsTracked, 48);
    });

    it("6. Verifies partner ecosystem referral performance score (96%)", () => {
        const partner = partnerEngine.registerPartner("KPMG AI Practice", "Specialist");
        assert.equal(partner.referralPerformanceScorePct, 96);
    });

    it("7. Verifies certification academy track validation for AI Agent Builder track", () => {
        const cert = certEngine.issueCertification({
            learnerId: "learner_808",
            learnerName: "Bob Ross",
            track: "PAL AI Agent Builder",
            scorePct: 88
        });
        assert.equal(cert.isCertified, true);
        assert.equal(cert.track, "PAL AI Agent Builder");
    });

    it("8. Verifies marketplace SaaS growth suite official PAL verification badge", () => {
        const packages = marketplaceEngine.getPrebuiltTeamPackages();
        const saas = packages.find(p => p.packageId === "pkg_saas_growth_team");
        assert.ok(saas);
        assert.equal(saas.verificationStatus, "OFFICIAL_PAL");
    });

    it("9. Verifies CS manager recommended actions list length", () => {
        const report = csManager.generateCustomerSuccessReport(workspaceId);
        assert.equal(report.recommendedActions.length, 2);
    });

    it("10. Verifies growth network insights top referring industry list includes B2B SaaS", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.ok(insights.topReferringIndustries.includes("B2B SaaS"));
    });

    it("11. Verifies partner ID generation formatting", () => {
        const partner = partnerEngine.registerPartner("Ernst & Young AI", "Consulting");
        assert.ok(partner.partnerId.startsWith("ptr_"));
    });

    it("12. Verifies implementation partner active deployment baseline", () => {
        const partner = partnerEngine.registerPartner("Capgemini AI", "Implementation");
        assert.equal(partner.activeDeploymentsCount, 14);
    });

    it("13. Verifies failing exam score 70% rejects certification", () => {
        const cert = certEngine.issueCertification({
            learnerId: "learner_fail_909",
            learnerName: "Fail Student",
            track: "PAL Operator",
            scorePct: 70
        });
        assert.equal(cert.isCertified, false);
    });

    it("14. Verifies passing score 85% exactly issues certification", () => {
        const cert = certEngine.issueCertification({
            learnerId: "learner_pass_85",
            learnerName: "Pass Student",
            track: "PAL Operator",
            scorePct: 85
        });
        assert.equal(cert.isCertified, true);
    });

    it("15. Verifies marketplace total prebuilt package count", () => {
        const pkgs = marketplaceEngine.getPrebuiltTeamPackages();
        assert.ok(pkgs.length >= 2);
    });

    it("16. Verifies SaaS growth suite star rating 5.0", () => {
        const pkgs = marketplaceEngine.getPrebuiltTeamPackages();
        const saas = pkgs.find(p => p.packageId === "pkg_saas_growth_team");
        assert.ok(saas);
        assert.equal(saas.ratingStars, 5.0);
    });

    it("17. Verifies CS report adoption blockers count", () => {
        const report = csManager.generateCustomerSuccessReport(workspaceId);
        assert.equal(report.adoptionBlockers.length, 1);
    });

    it("18. Verifies CS report satisfaction trend default", () => {
        const report = csManager.generateCustomerSuccessReport(workspaceId);
        assert.equal(report.satisfactionTrend, "UPWARD");
    });

    it("19. Verifies growth network successful conversions count", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.equal(insights.successfulConversionsCount, 32);
    });

    it("20. Verifies growth network viral expansion opportunities count", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.equal(insights.viralExpansionOpportunitiesCount, 16);
    });

    it("21. Verifies partner profile retrieval consistency", () => {
        const p1 = partnerEngine.registerPartner("Bain & Co AI", "Consulting");
        const p2 = partnerEngine.getPartner(p1.partnerId);
        assert.deepEqual(p1, p2);
    });

    it("22. Verifies certification record ID prefix", () => {
        const cert = certEngine.issueCertification({
            learnerId: "learner_id_chk",
            learnerName: "Test Learner",
            track: "PAL Enterprise Architect",
            scorePct: 99
        });
        assert.ok(cert.recordId.startsWith("cert_"));
    });

    it("23. Verifies prebuilt Fintech team included agent roles list length", () => {
        const pkgs = marketplaceEngine.getPrebuiltTeamPackages();
        const fintech = pkgs.find(p => p.packageId === "pkg_fintech_exec_team");
        assert.ok(fintech);
        assert.equal(fintech.includedAgentRoles.length, 3);
    });

    it("24. Verifies prebuilt SaaS team included agent roles list length", () => {
        const pkgs = marketplaceEngine.getPrebuiltTeamPackages();
        const saas = pkgs.find(p => p.packageId === "pkg_saas_growth_team");
        assert.ok(saas);
        assert.equal(saas.includedAgentRoles.length, 3);
    });

    it("25. Verifies CS report ID format", () => {
        const report = csManager.generateCustomerSuccessReport("ws_format_test");
        assert.ok(report.reportId.startsWith("cs_rpt_"));
    });

    it("26. Verifies CS report workspace ID preservation", () => {
        const report = csManager.generateCustomerSuccessReport("ws_preserve_id");
        assert.equal(report.workspaceId, "ws_preserve_id");
    });

    it("27. Verifies growth network ID format", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.ok(insights.networkId.startsWith("growth_net_"));
    });

    it("28. Verifies growth network total referrals tracked count (48)", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.equal(insights.totalReferralsTracked, 48);
    });

    it("29. Verifies partner ecosystem engine instance singleton pattern", () => {
        const i1 = PartnerEcosystemEngine.getInstance();
        const i2 = PartnerEcosystemEngine.getInstance();
        assert.equal(i1, i2);
    });

    it("30. Verifies growth network engine instance singleton pattern", () => {
        const i1 = GrowthNetworkEngine.getInstance();
        const i2 = GrowthNetworkEngine.getInstance();
        assert.equal(i1, i2);
    });

    it("31. Verifies certification academy engine instance singleton pattern", () => {
        const i1 = PalCertificationEngine.getInstance();
        const i2 = PalCertificationEngine.getInstance();
        assert.equal(i1, i2);
    });

    it("32. Verifies marketplace expansion engine instance singleton pattern", () => {
        const i1 = EnterpriseMarketplaceEngine.getInstance();
        const i2 = EnterpriseMarketplaceEngine.getInstance();
        assert.equal(i1, i2);
    });

    it("33. Verifies autonomous CS manager engine instance singleton pattern", () => {
        const i1 = AutonomousCustomerSuccessManager.getInstance();
        const i2 = AutonomousCustomerSuccessManager.getInstance();
        assert.equal(i1, i2);
    });

    it("34. Verifies partner profile attributed revenue formatting ($126,000)", () => {
        const partner = partnerEngine.registerPartner("McKinsey AI Solutions", "Consulting");
        assert.equal(partner.attributedRevenueUsd, 126000);
    });

    it("35. Verifies certification academy score 100% perfect score certificate issuance", () => {
        const cert = certEngine.issueCertification({
            learnerId: "learner_perf_100",
            learnerName: "Perfect Student",
            track: "PAL Enterprise Architect",
            scorePct: 100
        });
        assert.equal(cert.isCertified, true);
        assert.equal(cert.scorePct, 100);
    });

    it("36. Verifies prebuilt AI team package partner publisher name", () => {
        const pkgs = marketplaceEngine.getPrebuiltTeamPackages();
        const fintech = pkgs.find(p => p.packageId === "pkg_fintech_exec_team");
        assert.ok(fintech);
        assert.equal(fintech.partnerPublisherName, "Accenture AI Solutions");
    });

    it("37. Verifies CS report expansion opportunity value ($24,000)", () => {
        const report = csManager.generateCustomerSuccessReport("ws_val_chk");
        assert.equal(report.expansionOpportunitiesUsd, 24000);
    });

    it("38. Verifies growth network insights top referring industry index 1 is Fintech & Banking", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.equal(insights.topReferringIndustries[1], "Fintech & Banking");
    });

    it("39. Verifies growth network insights top referring industry index 2 is Healthtech", () => {
        const insights = growthNetwork.evaluateNetworkGrowth();
        assert.equal(insights.topReferringIndustries[2], "Healthtech");
    });

    it("40. Verifies complete v2.6.0 ecosystem network end-to-end milestone connectivity", () => {
        const partner = partnerEngine.registerPartner("Global Enterprise Partner", "Consulting");
        const cert = certEngine.issueCertification({
            learnerId: "learner_e2e_fin",
            learnerName: "E2E Student",
            track: "PAL Enterprise Architect",
            scorePct: 95
        });
        const pkgs = marketplaceEngine.getPrebuiltTeamPackages();
        const csRpt = csManager.generateCustomerSuccessReport("ws_e2e_fin_ws");
        const growth = growthNetwork.evaluateNetworkGrowth();

        assert.ok(partner.partnerId);
        assert.ok(cert.isCertified);
        assert.ok(pkgs.length > 0);
        assert.ok(csRpt.healthScorePct > 90);
        assert.ok(growth.viralCoefficientKFactor > 1.0);
    });
});
