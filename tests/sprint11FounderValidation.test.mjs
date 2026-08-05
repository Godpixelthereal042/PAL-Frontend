/**
 * Sprint 11 — Founder Validation & Revenue Proof Verification
 *
 * Verifies:
 *   1. FounderImpactTracker computes time saved, decisions automated, MRR growth, and cost savings.
 *   2. WeeklyExecutiveBriefEngine generates Monday briefing across CEO, CFO, COO, and Growth modules.
 *   3. RecommendationLearningEngine manages recommendation lifecycle and updates confidence scores.
 *   4. CaseStudyGenerator compiles 90-day impact reports and founder testimonials.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FounderImpactTracker } from "../lib/analytics/founderImpactTracker.ts";
import { WeeklyExecutiveBriefEngine } from "../lib/briefing/weeklyExecutiveBriefEngine.ts";
import { RecommendationLearningEngine } from "../lib/learning/recommendationLearningEngine.ts";
import { CaseStudyGenerator } from "../lib/reports/caseStudyGenerator.ts";

describe("Sprint 11 — Founder Validation & Revenue Proof", () => {
    const impactTracker = FounderImpactTracker.getInstance();
    const briefingEngine = WeeklyExecutiveBriefEngine.getInstance();
    const learningEngine = RecommendationLearningEngine.getInstance();
    const caseStudyGen = CaseStudyGenerator.getInstance();

    it("1. FounderImpactTracker computes ROI metrics", () => {
        const metrics = impactTracker.calculateImpact("ws_demo_company");

        assert.equal(metrics.hoursSavedMonth, 18);
        assert.equal(metrics.reportingTimeReductionPct, 65);
        assert.ok(metrics.revenueOpportunitiesUSD > 0);
        assert.ok(metrics.costSavingsUSD > 0);
    });

    it("2. WeeklyExecutiveBriefEngine generates Monday briefing for CEO, CFO, COO, and Growth", () => {
        const brief = briefingEngine.generateWeeklyBriefing("ws_demo_company");

        assert.equal(typeof brief.ceoBrief.businessHealthScore, "number");
        assert.ok(brief.cfoBrief.mrrUSD > 0);
        assert.ok(brief.cooBrief.automatedTasksCount > 0);
        assert.ok(brief.growthBrief.activeCustomersCount > 0);
    });

    it("3. RecommendationLearningEngine updates confidence score on founder decision", () => {
        const workspaceId = "ws_demo_company";
        const recs = learningEngine.getRecommendations(workspaceId);

        assert.ok(recs.length > 0);

        const recId = recs[0].id;
        const result = learningEngine.recordDecision({
            workspaceId,
            recommendationId: recId,
            decision: "approved",
            reason: "High impact customer retention campaign"
        });

        assert.equal(result, true);

        const summary = learningEngine.getLearningSummary(workspaceId);
        assert.ok(summary.acceptedPct > 0);
    });

    it("4. CaseStudyGenerator creates business impact report", () => {
        const report = caseStudyGen.generateImpactReport("ws_demo_company", "Acme SaaS");

        assert.ok(report.caseStudyId.startsWith("cs_"));
        assert.equal(report.companyName, "Acme SaaS");
        assert.equal(report.timeSavedHoursMonth, 18);
        assert.ok(report.founderQuote.length > 10);
    });
});
