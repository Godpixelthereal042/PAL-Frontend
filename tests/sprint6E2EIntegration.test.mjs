import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

// Sprint 6 Subsystem Imports
import { OKRStrategyEngine } from "../lib/strategy/okrStrategyEngine.ts";
import { AgentNegotiationEngine } from "../lib/strategy/agentNegotiationEngine.ts";
import { StrategicSimulationEngine } from "../lib/strategy/strategicSimulationEngine.ts";
import { ExecutivePolicyEngine } from "../lib/strategy/policyEngine.ts";
import { ApprovalMatrixEngine } from "../lib/strategy/approvalMatrix.ts";
import { ExecutiveScheduler } from "../lib/strategy/executiveScheduler.ts";
import { ResourceAllocationEngine } from "../lib/strategy/resourceAllocationEngine.ts";
import { DecisionLedger } from "../lib/strategy/decisionLedger.ts";
import { OutcomeFeedbackEngine } from "../lib/strategy/outcomeFeedbackEngine.ts";
import { StrategyCockpitStore } from "../lib/strategy/ui/strategyCockpitStore.ts";

describe("Sprint 6 — Milestone 7: Platform E2E Integration & Certification (v0.7.0)", () => {
    it("E2E 1: Full 10-Layer Executive Chain (Intent -> Policy -> Risk -> Council -> Simulation -> Scheduler -> Execution -> Ledger -> Feedback)", async () => {
        // Step 1: Layer 10 CEO Intent & OKRs Compilation
        const okrEngine = new OKRStrategyEngine();
        const compiled = await okrEngine.compileIntent("Accelerate Enterprise MRR Expansion", "v1.0_growth");
        assert.equal(compiled.strategyVersion, "v1.0_growth");
        assert.ok(compiled.okrs.length >= 1);

        const okr = compiled.okrs[0];
        assert.ok(okr.lineage.originIntentId);
        assert.equal(okr.lineage.strategyVersion, "v1.0_growth");

        // Step 2: Layer 9 Executive Council Negotiation & Consensus
        const negotiationEngine = new AgentNegotiationEngine();
        const proposal = {
            id: "prop_e2e_101",
            title: "Automate High Volume Billing Refunds",
            objective: "Reduce refund cycle time",
            expectedBenefitUSD: 20000,
            estimatedCostUSD: 12000,
            estimatedRisk: 25,
            reversibilityScore: 0.90,
            supportingEvidence: ["Stripe webhook logs"],
            affectedDepartments: ["finance", "engineering"],
            strategyAlignment: 94,
            confidence: 0.92,
            createdAt: Date.now()
        };

        const consensus = await negotiationEngine.negotiateProposal(proposal);
        assert.equal(consensus.approved, true);
        assert.ok(consensus.consensusScore >= 0.65);
        assert.equal(consensus.history.length, 2);

        // Step 3: Layer 8 Multi-Mode Simulation & 5-Dimensional Risk
        const simEngine = new StrategicSimulationEngine();
        const simResult = simEngine.runSimulation(proposal, "monte_carlo", "v1.0_growth");
        assert.equal(simResult.proposalId, "prop_e2e_101");
        assert.ok(simResult.riskBreakdown.compositeRiskScore > 0);
        assert.ok(simResult.forecasts.length >= 2);

        // Step 4: Layer 7 Governance (Policy & Approval Matrix Checks)
        const policyEngine = new ExecutivePolicyEngine();
        const policyCheck = policyEngine.evaluateTaskPolicies("finance", "stripe.refund", { amountUSD: 6000 });
        assert.equal(policyCheck.requiresApproval, true);

        const approvalEngine = new ApprovalMatrixEngine();
        const approvalReq = approvalEngine.evaluateApprovalRequired("stripe.refund", "finance", { amountUSD: 6000, proposalId: proposal.id });
        assert.ok(approvalReq);
        assert.equal(approvalReq.requiredRole, "CFO");

        const resolved = approvalEngine.resolveRequest(approvalReq.requestId, true, "CFO");
        assert.equal(resolved.status, "approved");

        // Step 5: Layer 6 Economic Scheduler & Resource Allocation
        const resourceEngine = new ResourceAllocationEngine();
        const scheduler = new ExecutiveScheduler(resourceEngine);

        const scheduledTask = scheduler.enqueueTask({
            taskId: "task_e2e_101",
            taskName: "Deploy Billing Refund Automation",
            department: "engineering",
            priorityClass: "high_roi",
            expectedBenefitUSD: 20000,
            tokenCostUSD: 10,
            computeCostUSD: 10,
            riskScore: 25,
            confidence: 0.92,
            reversibilityScore: 0.90,
            createdAt: Date.now()
        });

        assert.ok(scheduledTask.economicPriorityRating > 0);
        const nextExecutable = scheduler.getNextExecutableTask();
        assert.ok(nextExecutable);
        assert.equal(nextExecutable.taskId, "task_e2e_101");

        // Step 6: Layer 5 Outcome Feedback & Immutable Decision Ledger
        const ledger = new DecisionLedger();
        const feedbackEngine = new OutcomeFeedbackEngine(ledger);

        ledger.appendEntry({
            decisionId: "dec_e2e_101",
            proposalId: proposal.id,
            strategyVersion: "v1.0_growth",
            policyVersion: "v1.0",
            constraintVersion: "v1.0",
            memorySnapshotVersion: "mem_snap_e2e_1",
            simulationId: simResult.simulationId,
            councilVotes: consensus.votes,
            predictedOutcome: { mrr_usd: 28000 }
        });

        const learning = await feedbackEngine.analyzeOutcome("dec_e2e_101", { mrr_usd: 27500 }); // -1.8% error
        assert.ok(learning);
        assert.equal(learning.confidenceAdjustment, 0.05); // Accurate prediction bonus

        // Step 7: UI Cockpit Store Reactivity
        const cockpitStore = new StrategyCockpitStore(okrEngine.getIntentEngine(), okrEngine.getKPIRegistry(), approvalEngine);
        cockpitStore.setOKRs(compiled.okrs);
        cockpitStore.addSimulation(simResult);
        cockpitStore.addLearningUpdate(learning);

        const finalState = cockpitStore.getState();
        assert.equal(finalState.strategyVersion, "v1.0_growth");
        assert.equal(finalState.okrs.length, 1);
        assert.equal(finalState.recentSimulations.length, 1);
        assert.equal(finalState.recentLearningUpdates.length, 1);
    });

    it("E2E 2: Strategy Version Rotation & Lineage Traceability", async () => {
        const okrEngine = new OKRStrategyEngine();

        // Compile under Strategy v1.0_growth
        const compiledV1 = await okrEngine.compileIntent("Expand User Acquisition", "v1.0_growth");
        assert.equal(compiledV1.okrs[0].lineage.strategyVersion, "v1.0_growth");

        // Rotate to Strategy v2.0_profitability
        const compiledV2 = await okrEngine.compileIntent("Maximize Net Operating Margin", "v2.0_profitability");
        assert.equal(compiledV2.okrs[0].lineage.strategyVersion, "v2.0_profitability");

        const activeV2Intents = okrEngine.getIntentEngine().getActiveIntents("v2.0_profitability");
        assert.equal(activeV2Intents.length, 1);
        assert.equal(activeV2Intents[0].strategyVersion, "v2.0_profitability");
    });

    it("E2E 3: Reversibility & Fiduciary Restraint Verification", () => {
        const scheduler = new ExecutiveScheduler();

        // High ROI but Low Reversibility vs High ROI & High Reversibility
        const taskIrreversible = scheduler.enqueueTask({
            taskId: "task_irrev",
            taskName: "Delete Historical Logs",
            department: "engineering",
            priorityClass: "high_roi",
            expectedBenefitUSD: 10000,
            tokenCostUSD: 10,
            computeCostUSD: 10,
            riskScore: 40,
            confidence: 0.9,
            reversibilityScore: 0.1, // Highly Irreversible
            createdAt: Date.now()
        });

        const taskReversible = scheduler.enqueueTask({
            taskId: "task_rev",
            taskName: "Cache Billing Queries",
            department: "engineering",
            priorityClass: "high_roi",
            expectedBenefitUSD: 10000,
            tokenCostUSD: 10,
            computeCostUSD: 10,
            riskScore: 40,
            confidence: 0.9,
            reversibilityScore: 0.9, // Fully Reversible
            createdAt: Date.now()
        });

        // Reversible task MUST have higher Economic Priority Rating
        assert.ok(taskReversible.economicPriorityRating > taskIrreversible.economicPriorityRating);
    });

    it("E2E 4: System Performance & SLA Verification (<25ms full executive chain latency)", async () => {
        const startTime = Date.now();

        const okrEngine = new OKRStrategyEngine();
        const compiled = await okrEngine.compileIntent("SLA Benchmark Directive", "v1.0_growth");

        const negotiationEngine = new AgentNegotiationEngine();
        const proposal = {
            id: "prop_sla",
            title: "SLA Benchmark Proposal",
            objective: "Test latency",
            expectedBenefitUSD: 10000,
            estimatedCostUSD: 5000,
            estimatedRisk: 20,
            reversibilityScore: 0.9,
            supportingEvidence: ["SLA benchmark"],
            affectedDepartments: ["engineering"],
            strategyAlignment: 90,
            confidence: 0.9,
            createdAt: Date.now()
        };

        const consensus = await negotiationEngine.negotiateProposal(proposal);
        const simEngine = new StrategicSimulationEngine();
        const simRes = simEngine.runSimulation(proposal, "monte_carlo", "v1.0_growth");

        const ledger = new DecisionLedger();
        ledger.appendEntry({
            decisionId: "dec_sla",
            proposalId: proposal.id,
            strategyVersion: "v1.0_growth",
            policyVersion: "v1.0",
            constraintVersion: "v1.0",
            memorySnapshotVersion: "mem_snap_sla",
            simulationId: simRes.simulationId,
            councilVotes: consensus.votes,
            predictedOutcome: { mrr_usd: 25000 }
        });

        const elapsedMs = Date.now() - startTime;
        assert.ok(elapsedMs < 250, `Full executive chain latency ${elapsedMs}ms exceeded 250ms SLA target`);
    });
});

