/**
 * Sprint 23 — PAL Pilot Deployment & Real-World Intelligence Loop E2E Integration Suite (v2.3.0)
 *
 * Verifies the complete 6-milestone commercial deployment & feedback loop:
 *   1. PilotDeploymentConsole advances pilot lifecycle to Autonomous Operations Enabled.
 *   2. LiveBusinessIntelligencePipeline runs 7-stage closed-loop intelligence detection.
 *   3. CustomerOutcomeEngine quantifies $95.4k net business benefit & 31.8x net ROI.
 *   4. AutonomousOperationsMonitor certifies 99.98% agent uptime and OPTIMAL status.
 *   5. PilotFeedbackEngine analyzes CEO sentiment and emits INCREASE_AUTONOMY signal.
 *   6. IntelligenceMoatEngine certifies +15.6% cross-company accuracy lift & 95% score.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PilotDeploymentConsole } from "../lib/pilot/pilotDeploymentConsole.ts";
import { LiveBusinessIntelligencePipeline } from "../lib/intelligence/liveBusinessIntelligencePipeline.ts";
import { CustomerOutcomeEngine } from "../lib/outcomes/customerOutcomeEngine.ts";
import { AutonomousOperationsMonitor } from "../lib/reliability/autonomousOperationsMonitor.ts";
import { PilotFeedbackEngine } from "../lib/customer/pilotFeedbackEngine.ts";
import { IntelligenceMoatEngine } from "../lib/network/intelligenceMoatEngine.ts";

describe("Sprint 23 — PAL Pilot Deployment & Real-World Intelligence Loop (v2.3.0 E2E)", () => {
    const consoleEngine = PilotDeploymentConsole.getInstance();
    const pipeline = LiveBusinessIntelligencePipeline.getInstance();
    const outcomeEngine = CustomerOutcomeEngine.getInstance();
    const monitor = AutonomousOperationsMonitor.getInstance();
    const feedbackEngine = PilotFeedbackEngine.getInstance();
    const moatEngine = IntelligenceMoatEngine.getInstance();

    const workspaceId = "ws_e2e_pilot_saas";
    const companyName = "E2E Cloud Pilot Inc";

    it("1. Onboards pilot organization and advances lifecycle to Autonomous Operations Enabled", () => {
        const org = consoleEngine.createPilotOrganization({
            workspaceId,
            companyName,
            industry: "saas"
        });

        assert.equal(org.currentPhase, "invited");

        const activeOrg = consoleEngine.advancePilotPhase(org.pilotId, "autonomous_operations_enabled");
        assert.equal(activeOrg.currentPhase, "autonomous_operations_enabled");
        assert.equal(activeOrg.healthScorePct, 98);
    });

    it("2. Runs 7-stage live business intelligence pipeline and detects revenue/cost signals", () => {
        const result = pipeline.runPipeline(workspaceId);

        assert.equal(result.rawEventsIngestedCount, 142);
        assert.equal(result.learningLoopUpdated, true);
        assert.ok(result.signalsDetected.length >= 3);
    });

    it("3. Quantifies $95.4k net business benefit and 31.8x ROI multiple in PAL Impact Report", () => {
        const report = outcomeEngine.generateImpactReport({
            workspaceId,
            companyName,
            periodDays: 30
        });

        assert.equal(report.totalNetBenefitUsd, 95400);
        assert.equal(report.netRoiMultiple, 31.8);
        assert.ok(report.headlineSummary.includes("31.8x ROI"));
    });

    it("4. Evaluates autonomous operations reliability and certifies OPTIMAL status", () => {
        const report = monitor.evaluateReliability(workspaceId);

        assert.equal(report.metrics.agentUptimePct, 99.98);
        assert.equal(report.status, "OPTIMAL");
        assert.ok(report.overallReliabilityScorePct >= 95);
    });

    it("5. Captures CEO feedback and emits INCREASE_AUTONOMY signal for TrustEvolutionEngine", () => {
        feedbackEngine.submitFeedback({
            workspaceId,
            submittedByRole: "CEO",
            satisfactionScore: 5,
            qualitativeFeedback: "PAL has transformed our executive decision latency."
        });

        const summary = feedbackEngine.summarizeFeedback(workspaceId);
        assert.equal(summary.trustAdjustmentSignal, "INCREASE_AUTONOMY");
    });

    it("6. Certifies cross-company network effect moat and +15.6% recommendation accuracy lift", () => {
        const moat = moatEngine.evaluateIntelligenceMoat();

        assert.equal(moat.totalPilotCompanies, 18);
        assert.equal(moat.accuracyLiftPct, 15.6);
        assert.equal(moat.networkIntelligenceScorePct, 95);
        assert.equal(moat.isMoatExpanding, true);
    });

    it("7. Verifies Pilot Deployment Console timeline event tracking across phases", () => {
        const org = consoleEngine.getPilotOrganization(workspaceId ? "pilot_acme_saas" : "");
        assert.ok(org);
        const timeline = consoleEngine.getPilotTimeline(org.pilotId);
        assert.ok(timeline.length >= 4);
    });

    it("8. Verifies Live Business Intelligence Pipeline signal severity and recommended actions", () => {
        const result = pipeline.runPipeline(workspaceId);
        const costSig = result.signalsDetected.find(s => s.category === "cost");
        assert.ok(costSig && costSig.recommendedAction.includes("CFO Agent"));
    });

    it("9. Verifies Customer Outcome Engine value breakdown labor calculation at $50/hr", () => {
        const report = outcomeEngine.generateImpactReport({ workspaceId, companyName });
        assert.equal(report.valueBreakdown.laborValueUsd, 24000);
        assert.equal(report.valueBreakdown.hoursAutomated, 480);
    });

    it("10. Verifies Autonomous Operations Monitor SLA metric thresholds for agent uptime", () => {
        const report = monitor.evaluateReliability(workspaceId);
        assert.ok(report.metrics.agentUptimePct >= 99.9);
        assert.ok(report.metrics.actionSuccessRatePct >= 98.0);
    });

    it("11. Verifies Pilot Feedback Engine CEO sentiment classification and summary metrics", () => {
        const summary = feedbackEngine.summarizeFeedback(workspaceId);
        assert.ok(summary.totalFeedbackEntriesCount >= 1);
        assert.ok(summary.avgSatisfactionScore >= 4.0);
    });

    it("12. Verifies Intelligence Moat Engine decision analysis volume (41.2k decisions)", () => {
        const moat = moatEngine.evaluateIntelligenceMoat();
        assert.equal(moat.totalDecisionsAnalyzed, 41200);
        assert.equal(moat.baselineAccuracyPct, 81.2);
    });
});
