/**
 * Sprint 25 — PAL Commercial Deployment & Revenue Engine E2E Integration Suite (v2.5.0)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PalSalesIntelligenceEngine } from "../lib/sales/palSalesIntelligenceEngine.ts";
import { CustomerOnboardingAgent } from "../lib/onboarding/customerOnboardingAgent.ts";
import { PricingOptimizationEngine } from "../lib/billing/pricingOptimizationEngine.ts";
import { EnterpriseTrustPortal } from "../lib/security/enterpriseTrustPortal.ts";
import { CustomerExpansionEngine } from "../lib/customer/customerExpansionEngine.ts";

describe("Sprint 25 — PAL Commercial Deployment & Revenue Engine (v2.5.0 E2E)", () => {
    const salesEngine = PalSalesIntelligenceEngine.getInstance();
    const onboardingAgent = CustomerOnboardingAgent.getInstance();
    const pricingEngine = PricingOptimizationEngine.getInstance();
    const trustPortal = EnterpriseTrustPortal.getInstance();
    const expansionEngine = CustomerExpansionEngine.getInstance();

    const workspaceId = "ws_e2e_commercial_corp";
    const companyName = "Commercial Enterprise Corp";

    it("1. Qualifies prospect enterprise fit (94%) and predicts 18.5x annual ROI", () => {
        const sales = salesEngine.analyzeProspect("commercial.com", companyName);

        assert.equal(sales.enterpriseFitScorePct, 94);
        assert.equal(sales.predictedAnnualRoiMultiple, 18.5);
        assert.equal(sales.recommendedSuiteTier, "Enterprise Autonomous");
    });

    it("2. Automates customer onboarding session delivering first value in 1.5 hours (<24h SLA)", () => {
        onboardingAgent.startOnboardingSession(workspaceId, companyName);
        const session = onboardingAgent.completeOnboardingSession(workspaceId);

        assert.equal(session.is24HourSlaMet, true);
        assert.equal(session.timeToFirstValueHours, 1.5);
        assert.equal(session.initialScanValueDiscoveredUsd, 14400);
    });

    it("3. Detects underpriced account receiving $42,000 monthly value and recommends Enterprise upgrade", () => {
        const analysis = pricingEngine.evaluateAccountPricing({ workspaceId });

        assert.equal(analysis.isUnderpriced, true);
        assert.equal(analysis.valueToPriceRatio, 42.0);
        assert.equal(analysis.recommendedPlanName, "Enterprise Autonomous Suite");
    });

    it("4. Displays A+ security grade, SOC 2 / GDPR / ISO certifications, and SLA metrics in Trust Portal", () => {
        const status = trustPortal.getTrustStatus(workspaceId);

        assert.equal(status.securityPostureGrade, "A+");
        assert.equal(status.soc2Type2Status, "CERTIFIED_VALID");
        assert.equal(status.historicalUptimePct, 99.98);
    });

    it("5. Detects +240% Finance department usage surge and recommends AI Finance Controller Agent", () => {
        const recommendations = expansionEngine.evaluateExpansionOpportunities(workspaceId);

        const fin = recommendations.find(r => r.department === "Finance");
        assert.ok(fin);
        assert.equal(fin.usageGrowthPct, 240);
        assert.equal(fin.projectedAdditionalValueUsd, 18000);
    });

    it("6. Verifies sales analysis handles pre-deployment readiness checks", () => {
        const sales = salesEngine.analyzeProspect("commercial.com", companyName);
        assert.equal(sales.readinessStatus, "DEPLOYMENT_READY");
    });

    it("7. Verifies onboarding agent smart connector recommendations include Stripe, HubSpot, and Slack", () => {
        const session = onboardingAgent.getOnboardingSession(workspaceId);
        assert.ok(session);
        assert.equal(session.recommendedConnectors.length, 3);
    });

    it("8. Verifies pricing optimization headline formatting", () => {
        const analysis = pricingEngine.evaluateAccountPricing({ workspaceId });
        assert.ok(analysis.suggestedUpgradeHeadline.includes("Growth Pro"));
        assert.ok(analysis.suggestedUpgradeHeadline.includes("Enterprise Autonomous Suite"));
    });

    it("9. Verifies trust portal Decision Passport verification audit count", () => {
        const status = trustPortal.getTrustStatus(workspaceId);
        assert.equal(status.passportVerificationCount, 1420);
    });

    it("10. Verifies expansion engine Sales department AE agent recommendation ($36k additional value)", () => {
        const recommendations = expansionEngine.evaluateExpansionOpportunities(workspaceId);
        const sales = recommendations.find(r => r.department === "Sales");
        assert.ok(sales);
        assert.equal(sales.projectedAdditionalValueUsd, 36000);
    });

    it("11. Verifies sales analysis annual value calculation ($666,000)", () => {
        const sales = salesEngine.analyzeProspect("test.com", "Test Corp");
        assert.equal(sales.predictedAnnualValueUsd, 666000);
    });

    it("12. Verifies sales objection handling notes length (3 items)", () => {
        const sales = salesEngine.analyzeProspect("test.com", "Test Corp");
        assert.equal(sales.objectionHandlingNotes.length, 3);
    });

    it("13. Verifies onboarding session initial status is provisioning", () => {
        const session = onboardingAgent.startOnboardingSession("ws_prov_chk", "Prov Corp");
        assert.equal(session.status, "provisioning");
    });

    it("14. Verifies onboarding session completion status is first_value_delivered", () => {
        onboardingAgent.startOnboardingSession("ws_prov_chk", "Prov Corp");
        const completed = onboardingAgent.completeOnboardingSession("ws_prov_chk");
        assert.equal(completed.status, "first_value_delivered");
    });

    it("15. Verifies pricing analysis custom monthly value evaluation ($100k value)", () => {
        const analysis = pricingEngine.evaluateAccountPricing({
            workspaceId: "ws_custom_val",
            measuredMonthlyValueUsd: 100000,
            currentMonthlyPriceUsd: 2000
        });
        assert.equal(analysis.valueToPriceRatio, 50.0);
        assert.equal(analysis.isUnderpriced, true);
    });

    it("16. Verifies pricing analysis non-underpriced account ($5k value vs $1k price)", () => {
        const analysis = pricingEngine.evaluateAccountPricing({
            workspaceId: "ws_fair_val",
            measuredMonthlyValueUsd: 5000,
            currentMonthlyPriceUsd: 1000
        });
        assert.equal(analysis.valueToPriceRatio, 5.0);
        assert.equal(analysis.isUnderpriced, false);
    });

    it("17. Verifies trust portal ISO 27001 status ALIGNED", () => {
        const status = trustPortal.getTrustStatus(workspaceId);
        assert.equal(status.iso27001Status, "ALIGNED");
    });

    it("18. Verifies trust portal GDPR status COMPLIANT", () => {
        const status = trustPortal.getTrustStatus(workspaceId);
        assert.equal(status.gdprComplianceStatus, "COMPLIANT");
    });

    it("19. Verifies expansion engine total recommendation count (2)", () => {
        const recs = expansionEngine.evaluateExpansionOpportunities(workspaceId);
        assert.equal(recs.length, 2);
    });

    it("20. Verifies expansion engine recommendation IDs format", () => {
        const recs = expansionEngine.evaluateExpansionOpportunities(workspaceId);
        recs.forEach(r => {
            assert.ok(r.recommendationId.startsWith("rec_exp_"));
        });
    });
});
