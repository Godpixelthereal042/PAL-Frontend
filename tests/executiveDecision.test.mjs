import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ImpactScorer } from "../lib/intelligence/decision/impactScorer.ts";
import { DecisionEngine } from "../lib/intelligence/decision/decisionEngine.ts";
import { ScenarioGenerator } from "../lib/intelligence/reasoning/scenarioGenerator.ts";
import { PlanningEngine } from "../lib/intelligence/planning/planningEngine.ts";
import { ExecutiveOrchestrator } from "../lib/intelligence/council/executiveOrchestrator.ts";

describe("Milestone 4: Executive Decision Engine & Governance Integration", () => {
    const workspaceId = "ws_test_m4";
    const correlationId = "corr_test_m4";

    it("ImpactScorer computes composite decision scores with weighted formula", async () => {
        const planningEngine = new PlanningEngine();
        const plan = await planningEngine.createExecutionPlan(workspaceId, "Optimize infrastructure spend");

        const scenarioGenerator = new ScenarioGenerator();
        const scenarios = await scenarioGenerator.generateScenarios(workspaceId, plan, {});

        const scorer = new ImpactScorer();
        const scoredA = scorer.scoreScenario(scenarios[0]);
        const scoredC = scorer.scoreScenario(scenarios[2]);

        assert.equal(scoredA.optionId, "option_a_conservative");
        assert.ok(scoredA.compositeDecisionScore >= 0 && scoredA.compositeDecisionScore <= 100);
        assert.ok(scoredC.compositeDecisionScore >= 0 && scoredC.compositeDecisionScore <= 100);
    });

    it("DecisionEngine ranks options, integrates Sprint 2 GovernancePolicyEvaluator, and emits explainability traces", async () => {
        const planningEngine = new PlanningEngine();
        const plan = await planningEngine.createExecutionPlan(workspaceId, "Optimize infrastructure spend");

        const scenarioGenerator = new ScenarioGenerator();
        const scenarios = await scenarioGenerator.generateScenarios(workspaceId, plan, {});

        const orchestrator = new ExecutiveOrchestrator();
        const councilConsolidation = await orchestrator.orchestrateCouncil(correlationId, "technology", scenarios, {});

        const mockAgentProfile = {
            agentId: "ai_ops",
            workspaceId,
            agentName: "AI Ops",
            authorityLevel: "assisted",
            maxBudgetThreshold: 1000,
            assignedRoles: ["ai_ops"],
            capabilityScopes: ["infrastructure"],
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const decisionEngine = new DecisionEngine();
        const trace = await decisionEngine.evaluateDecision(
            workspaceId,
            correlationId,
            "Optimize infrastructure spend",
            scenarios,
            councilConsolidation,
            mockAgentProfile
        );

        assert.equal(trace.workspaceId, workspaceId);
        assert.equal(trace.correlationId, correlationId);
        assert.ok(trace.decisionId.startsWith("dec_"));
        assert.ok(trace.selectedOption);
        assert.equal(trace.alternativesConsidered.length, 3);

        // Governance policy evaluation check
        assert.ok(trace.governanceEvaluation);
        assert.equal(typeof trace.approvalRequired, "boolean");
        assert.equal(typeof trace.requiresHumanReview, "boolean");
    });
});
