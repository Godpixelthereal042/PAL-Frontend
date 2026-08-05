import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GoalDecomposer } from "../lib/intelligence/planning/goalDecomposer.ts";
import { PlanningEngine } from "../lib/intelligence/planning/planningEngine.ts";
import { ScenarioGenerator } from "../lib/intelligence/reasoning/scenarioGenerator.ts";
import { ReasoningEngine } from "../lib/intelligence/reasoning/reasoningEngine.ts";

describe("Milestone 2: Planning Engine & Executive Reasoning Subsystem", () => {
    const workspaceId = "ws_test_m2";

    it("GoalDecomposer breaks complex objectives into tasks and milestones", async () => {
        const decomposer = new GoalDecomposer();
        const { tasks, milestones } = await decomposer.decomposeGoal(workspaceId, "Reduce AWS cloud infrastructure spend by 25%", {});

        assert.equal(tasks.length, 3);
        assert.equal(milestones.length, 2);

        assert.equal(tasks[0].id, "task_audit_infra");
        assert.equal(tasks[1].prerequisites[0], "task_audit_infra");
        assert.equal(milestones[0].name, "Infrastructure Audit Complete");
    });

    it("PlanningEngine generates topological execution order and cost/time estimates", async () => {
        const engine = new PlanningEngine();
        const plan = await engine.createExecutionPlan(workspaceId, "Reduce AWS cloud infrastructure spend by 25%");

        assert.equal(plan.workspaceId, workspaceId);
        assert.equal(plan.tasks.length, 3);
        assert.deepEqual(plan.executionOrder, ["task_audit_infra", "task_rightsize_nodes", "task_verify_perf"]);
        assert.ok(plan.totalEstimatedCost > 0);
        assert.ok(plan.totalEstimatedTimeHours > 0);
    });

    it("ScenarioGenerator generates 3 explicit options (Conservative, Aggressive, Balanced)", async () => {
        const planningEngine = new PlanningEngine();
        const plan = await planningEngine.createExecutionPlan(workspaceId, "Reduce AWS cloud infrastructure spend by 25%");

        const generator = new ScenarioGenerator();
        const scenarios = await generator.generateScenarios(workspaceId, plan, {});

        assert.equal(scenarios.length, 3);

        const optionA = scenarios.find((s) => s.strategyType === "conservative");
        const optionB = scenarios.find((s) => s.strategyType === "aggressive");
        const optionC = scenarios.find((s) => s.strategyType === "balanced");

        assert.ok(optionA);
        assert.ok(optionB);
        assert.ok(optionC);

        assert.ok(optionA.compositeRiskScore < optionB.compositeRiskScore);
        assert.ok(optionB.predictedImpactScore > optionA.predictedImpactScore);
        assert.ok(optionC.predictedImpactScore > optionA.predictedImpactScore && optionC.compositeRiskScore < optionB.compositeRiskScore);
    });

    it("ReasoningEngine analyzes challenges and produces risk forecast summary", async () => {
        const planningEngine = new PlanningEngine();
        const plan = await planningEngine.createExecutionPlan(workspaceId, "Reduce AWS cloud infrastructure spend by 25%");

        const reasoningEngine = new ReasoningEngine();
        const analysis = await reasoningEngine.analyzeChallenge(workspaceId, plan);

        assert.equal(analysis.workspaceId, workspaceId);
        assert.equal(analysis.scenarios.length, 3);
        assert.equal(analysis.recommendedOptionId, "option_c_balanced");
        assert.ok(analysis.riskForecastSummary.includes("Option C"));
    });
});
