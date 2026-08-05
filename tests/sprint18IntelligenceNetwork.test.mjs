/**
 * Sprint 18 — The PAL Intelligence Network & Autonomous Company Layer Verification
 *
 * Verifies:
 *   1. CollectiveIntelligenceEngine provides privacy-preserving cross-company insights (73% retention boost via onboarding automation).
 *   2. ResearchAnalystAgent performs market scans and detects competitor pricing moves (15% pricing increase).
 *   3. AIBoardSimulationEngine conducts multi-agent board debate (CEO, CFO, CRO, Risk Agent) & 18-month simulation.
 *   4. AutonomousDepartmentManager performs C-Suite audits (AI CFO, AI CRO, AI COO) and generates impact reports.
 *   5. PalAgentSdk enables developers to package and publish custom agent skills with 70/30 revenue sharing.
 *   6. GlobalBusinessIntelligenceGraph queries cross-industry graph nodes for high-probability strategic decisions.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CollectiveIntelligenceEngine } from "../lib/intelligence/collectiveIntelligenceEngine.ts";
import { ResearchAnalystAgent } from "../lib/agents/researchAnalystAgent.ts";
import { AIBoardSimulationEngine } from "../lib/simulation/aiBoardSimulationEngine.ts";
import { AutonomousDepartmentManager } from "../lib/departments/autonomousDepartmentManager.ts";
import { PalAgentSdk } from "../lib/sdk/palAgentSdk.ts";
import { GlobalBusinessIntelligenceGraph } from "../lib/graph/globalBusinessIntelligenceGraph.ts";

describe("Sprint 18 — The PAL Intelligence Network & Autonomous Company Layer (v1.8.0)", () => {
    const collectiveEngine = CollectiveIntelligenceEngine.getInstance();
    const researchAgent = ResearchAnalystAgent.getInstance();
    const boardSimulation = AIBoardSimulationEngine.getInstance();
    const deptManager = AutonomousDepartmentManager.getInstance();
    const sdkInstance = PalAgentSdk.getInstance();
    const globalGraph = GlobalBusinessIntelligenceGraph.getInstance();

    it("1. CollectiveIntelligenceEngine aggregates privacy-preserving cross-company insights", () => {
        const insights = collectiveEngine.getInsightsByIndustry("saas");

        assert.ok(insights.length >= 2);
        assert.equal(insights[0].confidencePercentage, 73);
        assert.ok(insights[0].insightSummary.includes("73% of similar SaaS companies"));
    });

    it("2. ResearchAnalystAgent performs market scans and detects competitor pricing moves", () => {
        const brief = researchAgent.runMarketScan("ws_demo_company");

        assert.ok(brief.briefId.startsWith("rsch_"));
        assert.equal(brief.topic, "Competitor Pricing Strategy");
        assert.ok(brief.observedTrend.includes("15%"));
        assert.equal(brief.confidenceScore, 0.94);
    });

    it("3. AIBoardSimulationEngine conducts multi-agent board debate and 18-month simulation", () => {
        const sim = boardSimulation.runBoardSimulation("ws_demo_company", "Should we enter the Nigerian market?");

        assert.ok(sim.simulationId.startsWith("board_sim_"));
        assert.equal(sim.perspectives.length, 4);
        assert.ok(sim.perspectives.some(p => p.role === "CFO" && p.stance === "cautionary"));
        assert.equal(sim.eighteenMonthProjection.capitalRequirementUSD, 400000);
    });

    it("4. AutonomousDepartmentManager audits AI CFO, AI CRO, and AI COO departments", () => {
        const cfoAudit = deptManager.runDepartmentAudit("ws_demo_company", "CFO");
        assert.equal(cfoAudit.department, "CFO");
        assert.equal(cfoAudit.healthScorePct, 92);

        const croAudit = deptManager.runDepartmentAudit("ws_demo_company", "CRO");
        assert.equal(croAudit.department, "CRO");
        assert.equal(croAudit.healthScorePct, 88);

        const cooAudit = deptManager.runDepartmentAudit("ws_demo_company", "COO");
        assert.equal(cooAudit.department, "COO");
        assert.equal(cooAudit.healthScorePct, 95);
    });

    it("5. PalAgentSdk publishes custom developer agent package with 70/30 revenue share", () => {
        const pkg = sdkInstance.publishAgentPackage({
            developerId: "dev_101",
            developerName: "Acme Devs",
            packageName: "Real Estate Investment Agent",
            description: "Automates real estate deal underwriting and ROI projection.",
            priceMonthlyUSD: 99
        });

        assert.ok(pkg.packageId.startsWith("pkg_"));
        assert.equal(pkg.revenueShareDeveloperPct, 70);
        assert.equal(pkg.revenueSharePlatformPct, 30);
        assert.equal(pkg.status, "published");
    });

    it("6. GlobalBusinessIntelligenceGraph queries cross-industry graph for strategic decisions", () => {
        const result = globalGraph.queryGlobalGraph("What decisions make SaaS companies grow faster?");

        assert.ok(result.matchingPatterns.length >= 3);
        assert.equal(result.historicalOutcomeProbabilityPct, 84);
        assert.ok(result.graphNodesCount > 10000);
    });
});
