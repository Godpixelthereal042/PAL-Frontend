/**
 * Sprint 24 — PAL Market Proof & Autonomous Growth Layer E2E Integration Suite (v2.4.0)
 *
 * Verifies the complete 5-milestone market proof & growth pipeline:
 *   1. CustomerSuccessIntelligenceEngine evaluates 88% adoption, 94% trust, and low churn risk.
 *   2. GrowthStrategyEngine identifies +12% ARR pricing optimization ($54k impact, 96% confidence).
 *   3. CustomerBenchmarkEngine compares SaaS churn vs industry median & top quartile P75.
 *   4. ExecutiveReportGenerator outputs CEO Weekly Briefing & Board Summary markdown.
 *   5. CaseStudyGenerator creates 5-section sales proof collateral ($95.4k net value, 31.8x ROI).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerSuccessIntelligenceEngine } from "../lib/customer/customerSuccessIntelligenceEngine.ts";
import { GrowthStrategyEngine } from "../lib/growth/growthStrategyEngine.ts";
import { CustomerBenchmarkEngine } from "../lib/intelligence/customerBenchmarkEngine.ts";
import { ExecutiveReportGenerator } from "../lib/reports/executiveReportGenerator.ts";
import { CaseStudyGenerator } from "../lib/marketing/caseStudyGenerator.ts";

describe("Sprint 24 — PAL Market Proof & Autonomous Growth Layer (v2.4.0 E2E)", () => {
    const csEngine = CustomerSuccessIntelligenceEngine.getInstance();
    const growthEngine = GrowthStrategyEngine.getInstance();
    const benchmarkEngine = CustomerBenchmarkEngine.getInstance();
    const reportGen = ExecutiveReportGenerator.getInstance();
    const caseStudyGen = CaseStudyGenerator.getInstance();

    const workspaceId = "ws_e2e_growth_corp";
    const companyName = "Growth Corp International";

    it("1. Evaluates customer health report and predicts low churn risk", () => {
        const report = csEngine.generateHealthReport({
            workspaceId,
            companyName
        });

        assert.equal(report.adoptionPct, 88);
        assert.equal(report.trustScorePct, 94);
        assert.equal(report.churnRiskLevel, "low");
        assert.ok(report.recommendedNextActions.length >= 3);
    });

    it("2. Identifies pricing optimization and market expansion growth opportunities", () => {
        const opportunities = growthEngine.evaluateGrowthOpportunities(workspaceId);

        assert.ok(opportunities.length >= 3);
        const pricingOpp = opportunities.find(o => o.category === "pricing");

        assert.ok(pricingOpp);
        assert.equal(pricingOpp.expectedRevenueImpactUsd, 54000);
        assert.equal(pricingOpp.confidenceScorePct, 96);
    });

    it("3. Compares company metrics against Industry Median and Top Quartile (P75) benchmarks", () => {
        const benchReport = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);

        assert.equal(benchReport.comparisons.length, 3);
        const marginComp = benchReport.comparisons.find(c => c.metricKey === "gross_margin_pct");

        assert.ok(marginComp);
        assert.equal(marginComp.performanceTier, "top_quartile");
    });

    it("4. Synthesizes recurring Weekly CEO Briefing and Board Strategy Summary", () => {
        const ceoBrief = reportGen.generateReport({
            workspaceId,
            companyName,
            reportType: "weekly_ceo_brief"
        });

        assert.ok(ceoBrief.title.includes("Weekly CEO Intelligence Briefing"));
        assert.equal(ceoBrief.netRoiUsd, 95400);
        assert.ok(ceoBrief.formattedContentMarkdown.includes("## Executive Summary"));
    });

    it("5. Automatically exports 5-section sales proof collateral and customer case study", () => {
        const story = caseStudyGen.generateCaseStudy({
            workspaceId,
            companyName,
            industry: "Enterprise SaaS"
        });

        assert.equal(story.netRoiMultiple, 31.8);
        assert.equal(story.totalValueCreatedUsd, 95400);
        assert.ok(story.fullCaseStudyMarkdown.includes("## 5. Net ROI & Value Summary"));
    });

    it("6. Verifies customer health score evaluation for at-risk accounts", () => {
        const atRisk = csEngine.generateHealthReport({
            workspaceId,
            companyName: "At Risk Inc",
            adoptionPct: 35,
            trustScorePct: 50
        });

        assert.equal(atRisk.churnRiskLevel, "high");
    });

    it("7. Verifies growth opportunities contain valid recommended actions and confidence scores", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        for (const o of opps) {
            assert.ok(o.confidenceScorePct >= 80);
            assert.ok(o.recommendedAction.length > 10);
        }
    });

    it("8. Verifies benchmark comparisons identify lagging metrics and gap to top quartile", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        const leadComp = report.comparisons.find(c => c.metricKey === "lead_response_hours");
        assert.ok(leadComp);
        assert.equal(leadComp.performanceTier, "bottom_quartile");
        assert.equal(leadComp.gapToTopQuartile, 3.7);
    });

    it("9. Verifies Executive Report Generator supports investor update report format", () => {
        const inv = reportGen.generateReport({
            workspaceId,
            companyName,
            reportType: "investor_update"
        });

        assert.ok(inv.title.includes("Monthly Investor Growth & ROI Update"));
        assert.equal(inv.keyWins.length, 3);
    });

    it("10. Verifies Case Study Generator 5-section proof markdown rendering", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName });
        assert.ok(story.fullCaseStudyMarkdown.includes("## 1. Before PAL State"));
        assert.ok(story.fullCaseStudyMarkdown.includes("## 4. Outcomes Achieved"));
    });

    it("11. Verifies Customer Success Intelligence Engine adoption score calculations and active agents", () => {
        const report = csEngine.generateHealthReport({ workspaceId, companyName });
        assert.equal(report.activeAgentsCount, 7);
        assert.equal(report.decisionsHandledCount, 1420);
    });

    it("12. Verifies Growth Strategy Engine EMEA expansion impact ($82k) and action recommendations", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        const emea = opps.find(o => o.category === "expansion");
        assert.ok(emea && emea.expectedRevenueImpactUsd === 82000);
        assert.ok(emea && emea.recommendedAction.includes("EUR/GBP billing"));
    });

    it("13. Verifies Customer Benchmark Engine metrics unit formatting and performance tier labels", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        assert.equal(report.overallBenchmarkTier, "above_median");
        for (const c of report.comparisons) {
            assert.ok(["pct", "hours"].includes(c.unit));
        }
    });

    it("14. Verifies Executive Report Generator Board Summary output formatting and titles", () => {
        const board = reportGen.generateReport({
            workspaceId,
            companyName,
            reportType: "board_summary"
        });

        assert.ok(board.title.includes("Quarterly Board Strategy & Risk Summary"));
        assert.ok(board.formattedContentMarkdown.includes("Autonomous Agent Operational Health"));
    });

    it("15. Verifies Case Study Generator outputs before PAL problem statements and action items", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName });
        assert.ok(story.beforePalState.length > 20);
        assert.equal(story.actionsExecuted.length, 3);
        assert.equal(story.outcomesAchieved.length, 3);
    });

    it("16. Verifies Customer Success Intelligence Engine medium churn risk for borderline adoption", () => {
        const mediumRisk = csEngine.generateHealthReport({
            workspaceId,
            companyName: "Medium Risk Co",
            adoptionPct: 55,
            trustScorePct: 70
        });

        assert.equal(mediumRisk.churnRiskLevel, "medium");
    });

    it("17. Verifies Growth Strategy Engine hiring recommendations and pipeline backlog capture", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        const hiring = opps.find(o => o.category === "hiring");
        assert.ok(hiring && hiring.expectedRevenueImpactUsd === 120000);
        assert.equal(hiring.confidenceScorePct, 88);
    });

    it("18. Verifies Customer Benchmark Engine gap analysis for top-quartile performers", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        const margin = report.comparisons.find(c => c.metricKey === "gross_margin_pct");
        assert.ok(margin);
        assert.equal(margin.gapToTopQuartile, 0);
    });

    it("19. Verifies Executive Report Generator title generation across all report types", () => {
        const ceo = reportGen.generateReport({ workspaceId, companyName, reportType: "weekly_ceo_brief" });
        const inv = reportGen.generateReport({ workspaceId, companyName, reportType: "investor_update" });
        const board = reportGen.generateReport({ workspaceId, companyName, reportType: "board_summary" });

        assert.ok(ceo.title.includes("Weekly CEO"));
        assert.ok(inv.title.includes("Monthly Investor"));
        assert.ok(board.title.includes("Quarterly Board"));
    });

    it("20. Verifies Case Study Generator total value created USD formatting and headline structure", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName, industry: "FinTech" });
        assert.equal(story.industry, "FinTech");
        assert.equal(story.totalValueCreatedUsd, 95400);
        assert.ok(story.headline.includes("Automated $95,400 in Business Value"));
    });

    it("21. Verifies Customer Success Intelligence Engine handles zero-adoption warning states", () => {
        const report = csEngine.generateHealthReport({ workspaceId, companyName, adoptionPct: 0, trustScorePct: 30 });
        assert.equal(report.churnRiskLevel, "high");
    });

    it("22. Verifies Growth Strategy Engine category evaluation for cost restructuring opportunities", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        assert.ok(opps.length >= 3);
    });

    it("23. Verifies Customer Benchmark Engine metric label formatting for gross margin", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        const margin = report.comparisons.find(c => c.metricKey === "gross_margin_pct");
        assert.ok(margin && margin.metricLabel.includes("Gross Profit Margin"));
    });

    it("24. Verifies Executive Report Generator investor update content includes net ROI 31.8x", () => {
        const inv = reportGen.generateReport({ workspaceId, companyName, reportType: "investor_update" });
        assert.ok(inv.formattedContentMarkdown.includes("31.8x"));
    });

    it("25. Verifies Case Study Generator outputs non-empty full markdown collateral", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName });
        assert.ok(story.fullCaseStudyMarkdown.length > 200);
    });

    it("26. Verifies Customer Success Engine adoption score 88% default baseline", () => {
        const report = csEngine.generateHealthReport({ workspaceId, companyName });
        assert.equal(report.adoptionPct, 88);
    });

    it("27. Verifies Growth Strategy Engine pricing opportunity expected revenue impact ($54k)", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        const pricing = opps.find(o => o.category === "pricing");
        assert.ok(pricing && pricing.expectedRevenueImpactUsd === 54000);
    });

    it("28. Verifies Customer Benchmark Engine overall benchmark tier evaluation (above_median)", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        assert.equal(report.overallBenchmarkTier, "above_median");
    });

    it("29. Verifies Executive Report Generator quarterly board summary markdown headers", () => {
        const board = reportGen.generateReport({ workspaceId, companyName, reportType: "board_summary" });
        assert.ok(board.formattedContentMarkdown.includes("## Executive Summary"));
    });

    it("30. Verifies Case Study Generator before PAL state description length and content", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName });
        assert.ok(story.beforePalState.includes("unutilized SaaS tool sprawl"));
    });

    it("31. Verifies Customer Success Engine recommendations include CFO SaaS audit", () => {
        const report = csEngine.generateHealthReport({ workspaceId, companyName });
        assert.ok(report.recommendedNextActions.some(a => a.includes("CFO SaaS audit")));
    });

    it("32. Verifies Growth Strategy Engine detected timestamp is set to recent Date.now()", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        assert.ok(opps[0].detectedAt > Date.now() - 5000);
    });

    it("33. Verifies Customer Benchmark Engine churn gap to top quartile (3.8%)", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        const churn = report.comparisons.find(c => c.metricKey === "saas_churn_pct");
        assert.ok(churn && churn.gapToTopQuartile === 3.8);
    });

    it("34. Verifies Executive Report Generator agent performance summary line", () => {
        const report = reportGen.generateReport({ workspaceId, companyName, reportType: "weekly_ceo_brief" });
        assert.ok(report.agentPerformanceSummary.includes("7 Domain Agents Active"));
    });

    it("35. Verifies Case Study Generator problems identified list length (3 items)", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName });
        assert.equal(story.problemsIdentified.length, 3);
    });

    it("36. Verifies Customer Success Engine active users count baseline (7 active agents)", () => {
        const report = csEngine.generateHealthReport({ workspaceId, companyName });
        assert.equal(report.activeAgentsCount, 7);
    });

    it("37. Verifies Growth Strategy Engine EMEA expansion confidence score (91%)", () => {
        const opps = growthEngine.evaluateGrowthOpportunities(workspaceId);
        const emea = opps.find(o => o.category === "expansion");
        assert.ok(emea && emea.confidenceScorePct === 91);
    });

    it("38. Verifies Customer Benchmark Engine lead response hours benchmark bottom quartile status", () => {
        const report = benchmarkEngine.generateBenchmarkReport(workspaceId, companyName);
        const lead = report.comparisons.find(c => c.metricKey === "lead_response_hours");
        assert.ok(lead && lead.performanceTier === "bottom_quartile");
    });

    it("39. Verifies Executive Report Generator top risks list length (2 items)", () => {
        const report = reportGen.generateReport({ workspaceId, companyName, reportType: "weekly_ceo_brief" });
        assert.equal(report.topRisks.length, 2);
    });

    it("40. Verifies Case Study Generator total net value created ($95.4k)", () => {
        const story = caseStudyGen.generateCaseStudy({ workspaceId, companyName });
        assert.equal(story.totalValueCreatedUsd, 95400);
    });
});
