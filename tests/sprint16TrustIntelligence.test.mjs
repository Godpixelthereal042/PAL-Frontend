/**
 * Sprint 16 — Trust, Intelligence & Autonomous Execution Layer Verification
 *
 * Verifies:
 *   1. DecisionConfidenceEngine calculates multi-factor confidence (91%), evidence chains, & projected impact ($18,000/yr).
 *   2. AutonomousExecutionSandbox simulates operational dry-runs (current vs projected spend, risk, & required sign-off role).
 *   3. CompanyDigitalTwinEngine runs what-if business simulations (hiring salespeople -> +$75k pipeline, 4-month break-even).
 *   4. AutonomousWorkflowBuilder constructs 5-step executable workflows from natural language goals.
 *   5. AIDecisionPassportEngine issues SHA-256 signed AI decision passports for auditable governance.
 *   6. CustomerIntelligenceNetwork fetches anonymized industry benchmarks across SaaS, E-Commerce, and Agency verticals.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DecisionConfidenceEngine } from "../lib/intelligence/decisionConfidenceEngine.ts";
import { AutonomousExecutionSandbox } from "../lib/sandbox/autonomousExecutionSandbox.ts";
import { CompanyDigitalTwinEngine } from "../lib/twin/companyDigitalTwinEngine.ts";
import { AutonomousWorkflowBuilder } from "../lib/workflows/autonomousWorkflowBuilder.ts";
import { AIDecisionPassportEngine } from "../lib/trust/aiDecisionPassport.ts";
import { CustomerIntelligenceNetwork } from "../lib/benchmarks/customerIntelligenceNetwork.ts";

describe("Sprint 16 — Trust, Intelligence & Autonomous Execution Layer (v1.6.0)", () => {
    const confidenceEngine = DecisionConfidenceEngine.getInstance();
    const sandboxEngine = AutonomousExecutionSandbox.getInstance();
    const twinEngine = CompanyDigitalTwinEngine.getInstance();
    const workflowBuilder = AutonomousWorkflowBuilder.getInstance();
    const passportEngine = AIDecisionPassportEngine.getInstance();
    const benchmarkNetwork = CustomerIntelligenceNetwork.getInstance();

    it("1. DecisionConfidenceEngine calculates 91% confidence & evidence chain", () => {
        const report = confidenceEngine.evaluateConfidence("ws_demo_company", "rec_saas_01", "Reduce SaaS Expenses");

        assert.equal(report.confidencePct, 91);
        assert.equal(report.riskLevel, "low");
        assert.ok(report.evidenceChain.length >= 3);
        assert.equal(report.expectedImpactUSDYear, 18000);
    });

    it("2. AutonomousExecutionSandbox simulates operational dry-run prior to execution", () => {
        const sim = sandboxEngine.runSimulation({
            workspaceId: "ws_demo_company",
            actionName: "Pause Low-Performing Ad Campaigns",
            currentSpendUSD: 20000,
            projectedSavingsUSD: 6000,
            riskLevel: "medium"
        });

        assert.ok(sim.simulationId.startsWith("sim_sb_"));
        assert.equal(sim.projectedMonthlySpendUSD, 14000);
        assert.equal(sim.isSafeToExecute, true);
        assert.equal(sim.requiredApprovalRole, "finance_lead");
    });

    it("3. CompanyDigitalTwinEngine runs what-if hiring simulation", () => {
        const twin = twinEngine.simulateWhatIf("ws_demo_company", "What happens if we hire 3 salespeople?");

        assert.ok(twin.scenarioId.startsWith("twin_"));
        assert.equal(twin.monthlyCostUSD, 18000);
        assert.equal(twin.expectedPipelineIncreaseUSD, 75000);
        assert.equal(twin.breakEvenTimeframeMonths, 4);
        assert.ok(twin.keyAssumptions.length >= 2);
    });

    it("4. AutonomousWorkflowBuilder builds 5-step executable workflow from goal", () => {
        const wf = workflowBuilder.buildWorkflowFromGoal("ws_demo_company", "Improve customer retention");

        assert.ok(wf.workflowId.startsWith("wf_auto_"));
        assert.equal(wf.steps.length, 5);
        assert.equal(wf.steps[0].actionType, "trigger");
        assert.equal(wf.steps[4].actionType, "notify");
    });

    it("5. AIDecisionPassportEngine issues SHA-256 signed AI decision passport", () => {
        const passport = passportEngine.issuePassport({
            decisionId: "dec_saas_audit_01",
            workspaceId: "ws_demo_company",
            actionSummary: "Canceled Datadog Stub subscription",
            whyPALDidThis: "0 queries logged in last 60 days; saves $1,200/mo.",
            dataInfluences: ["Stripe sync", "Datadog Stub query logs"],
            alternativesConsidered: ["Downgrade plan", "Keep subscription"],
            approvedByUserId: "usr_founder_01",
            approvalRole: "founder"
        });

        assert.ok(passport.passportId.startsWith("psp_"));
        assert.equal(typeof passport.signatureHash, "string");
        assert.equal(passport.signatureHash.length, 64); // SHA-256 length
    });

    it("6. CustomerIntelligenceNetwork fetches anonymized SaaS industry benchmarks", () => {
        const saasBench = benchmarkNetwork.getBenchmark("saas");

        assert.ok(saasBench);
        assert.equal(saasBench.industry, "saas");
        assert.equal(saasBench.avgChurnRatePct.median, 9.5);
        assert.equal(saasBench.avgSalesCycleDays.median, 24);
    });
});
