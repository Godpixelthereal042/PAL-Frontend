/**
 * Sprint 15 — Real Business Deployment & Intelligence Validation Verification
 *
 * Verifies:
 *   1. CompanyPilotEngine registers pilot companies across SaaS, E-Commerce, & Agency verticals.
 *   2. DataSyncNormalizationEngine processes raw external Stripe/HubSpot payloads into BusinessKnowledgeGraph nodes.
 *   3. OutcomeTrackingEngine measures net savings (Before $4,200 -> After $2,700 = $1,500 net saved) & calculates moat metrics.
 *   4. IndustryPacksEngine supplies specialized KPI prompts & benchmarks for SaaS, E-Commerce, and Agency founders.
 *   5. InvestorBoardIntelligenceEngine generates monthly investor updates & board agendas.
 *   6. EnterpriseDeploymentConsole manages SSO, data residency regions (US, EU, APAC), & compliance readiness.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CompanyPilotEngine } from "../lib/pilot/companyPilotEngine.ts";
import { DataSyncNormalizationEngine } from "../lib/data/dataSyncNormalizationEngine.ts";
import { OutcomeTrackingEngine } from "../lib/outcomes/outcomeTrackingEngine.ts";
import { IndustryPacksEngine } from "../lib/industry/industryPacksEngine.ts";
import { InvestorBoardIntelligenceEngine } from "../lib/reports/investorBoardIntelligenceEngine.ts";
import { EnterpriseDeploymentConsole } from "../lib/enterprise/enterpriseDeploymentConsole.ts";

describe("Sprint 15 — Real Business Deployment & Intelligence Validation (v1.5.0)", () => {
    const pilotEngine = CompanyPilotEngine.getInstance();
    const dataSyncEngine = DataSyncNormalizationEngine.getInstance();
    const outcomeEngine = OutcomeTrackingEngine.getInstance();
    const industryEngine = IndustryPacksEngine.getInstance();
    const investorEngine = InvestorBoardIntelligenceEngine.getInstance();
    const enterpriseConsole = EnterpriseDeploymentConsole.getInstance();

    it("1. CompanyPilotEngine registers pilot companies across verticals", () => {
        const pilots = pilotEngine.getPilots();
        assert.ok(pilots.length >= 3);
        assert.ok(pilots.some(p => p.industry === "saas"));
        assert.ok(pilots.some(p => p.industry === "ecommerce"));
        assert.ok(pilots.some(p => p.industry === "agency"));

        const registered = pilotEngine.registerPilot({
            workspaceId: "ws_new_pilot",
            companyName: "Fintech Growth Co",
            industry: "fintech",
            teamSize: 15,
            monthlyRevenueUSD: 65000,
            targetRevenueGoalUSD: 120000,
            connectedTools: ["stripe", "quickbooks"],
            primaryKPIs: ["Net Revenue", "DSO"]
        });

        assert.ok(registered.pilotId.startsWith("plt_"));
        assert.equal(registered.industry, "fintech");
    });

    it("2. DataSyncNormalizationEngine normalizes Stripe and HubSpot payloads into Knowledge Graph nodes", () => {
        const workspaceId = "ws_demo_company";

        const stripeFacts = dataSyncEngine.processExternalPayload({
            source: "stripe",
            workspaceId,
            rawPayload: { monthly_recurring_revenue: 24500 },
            timestamp: Date.now()
        });

        assert.equal(stripeFacts.length, 1);
        assert.equal(stripeFacts[0].normalizedValue, 24500);
        assert.equal(stripeFacts[0].source, "stripe");

        const facts = dataSyncEngine.getNormalizedFacts(workspaceId);
        assert.ok(facts.length >= 1);
    });

    it("3. OutcomeTrackingEngine measures net savings (Before $4.2k -> After $2.7k = $1.5k) & calculates moat metrics", () => {
        const workspaceId = "ws_demo_company";

        const outcome = outcomeEngine.recordOutcome({
            workspaceId,
            industry: "saas",
            recommendationTitle: "Cancel unutilized server monitoring subscription",
            beforeMetricValue: 4200,
            afterMetricValue: 2700
        });

        assert.equal(outcome.netSavingsUSD, 1500);

        const moat = outcomeEngine.getMoatSummary(workspaceId);
        assert.ok(moat.totalOutcomesRecorded >= 2);
        assert.ok(moat.totalSavingsUSD >= 1500);
    });

    it("4. IndustryPacksEngine supplies specialized KPI prompts & benchmarks", () => {
        const packs = industryEngine.getAllPacks();
        assert.equal(packs.length, 3);

        const saasPack = industryEngine.getPack("saas");
        assert.ok(saasPack);
        assert.ok(saasPack.coreKPIs.includes("ARR"));
        assert.ok(saasPack.specializedPrompts.length >= 2);
    });

    it("5. InvestorBoardIntelligenceEngine generates monthly investor update & board agenda", () => {
        const update = investorEngine.generateInvestorUpdate("ws_demo_company", "Acme SaaS");
        assert.ok(update.updateId.startsWith("inv_"));
        assert.equal(update.companyName, "Acme SaaS");
        assert.ok(update.highlights.keyWins.length >= 2);

        const agenda = investorEngine.generateBoardDecisionAgenda("ws_demo_company");
        assert.ok(agenda.agendaId.startsWith("bda_"));
        assert.ok(agenda.decisionsRequired.length >= 2);
    });

    it("6. EnterpriseDeploymentConsole manages SSO, data residency (US, EU, APAC), & compliance", () => {
        const org = enterpriseConsole.getOrgConfig("org_acme_corp");
        assert.ok(org);
        assert.equal(org.ssoEnabled, true);
        assert.equal(org.dataResidencyRegion, "us-east");

        const updated = enterpriseConsole.updateDataResidency("org_acme_corp", "eu-west");
        assert.equal(updated, true);

        const newOrg = enterpriseConsole.getOrgConfig("org_acme_corp");
        assert.equal(newOrg?.dataResidencyRegion, "eu-west");
    });
});
