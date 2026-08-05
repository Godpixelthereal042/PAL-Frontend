import test from "node:test";
import assert from "node:assert/strict";
import { explainabilityEngine } from "../lib/intelligence/explainabilityEngine.ts";
import { learningEngine } from "../lib/intelligence/learningEngine.ts";
import { strategicSimulationEngine } from "../lib/intelligence/simulationEngine.ts";
import { confidenceModel } from "../lib/intelligence/confidenceModel.ts";

test("Explainability Engine - generates transparent rationale & supporting evidence", async () => {
    const explanation = await explainabilityEngine.explainRecommendation("rec_test_1", "user_test");

    assert.ok(explanation, "Should return explanation details");
    assert.ok(explanation.why.length > 0, "Should contain 'why' rationales");
    assert.ok(explanation.confidence, "Should include confidence evaluation");
    assert.ok(explanation.confidence.confidenceScore > 0, "Confidence score should be populated");
    assert.ok(explanation.relatedContext, "Should contain relatedContext object");
});

test("Learning Engine - records founder feedback and calculates acceptance rate", async () => {
    const record1 = await learningEngine.recordFeedback("user_test", "rec_test_1", "helpful", "investor");
    assert.equal(record1.feedback, "helpful");
    assert.equal(record1.category, "investor");

    const record2 = await learningEngine.recordFeedback("user_test", "rec_test_2", "done", "financial");
    assert.equal(record2.feedback, "done");

    const stats = await learningEngine.getFeedbackStats("user_test");
    assert.ok(stats.totalFeedbackCount >= 2, "Should record total feedback count");
    assert.ok(stats.acceptanceRate.includes("%"), "Should format acceptance rate percentage");
});

test("Confidence Model - computes evidence strength and assumption checklist", () => {
    const strongEval = confidenceModel.evaluateConfidence(3, false, 0.85);
    assert.equal(strongEval.evidenceStrength, "strong");
    assert.ok(strongEval.confidenceScore >= 0.90);

    const weakEval = confidenceModel.evaluateConfidence(1, true, 0.85);
    assert.equal(weakEval.evidenceStrength, "weak");
    assert.ok(weakEval.missingInformation.length > 0);
});

test("Strategic Simulation Engine - models delay_launch and hire_role scenarios", async () => {
    const delaySim = await strategicSimulationEngine.simulateScenario("user_test", "delay_launch", { weeks: 2 });
    assert.equal(delaySim.scenarioType, "delay_launch");
    assert.ok(delaySim.healthScoreShift < 0, "Delaying launch should shift health score negatively");
    assert.ok(delaySim.affectedProjects.length > 0, "Should list affected projects");

    const hireSim = await strategicSimulationEngine.simulateScenario("user_test", "hire_role", { role: "Senior Designer" });
    assert.equal(hireSim.scenarioType, "hire_role");
    assert.ok(hireSim.healthScoreShift > 0, "Hiring designer should shift health score positively");
});

test("Strategic Simulation Engine - compares scenarios and identifies winner", async () => {
    const delaySim = await strategicSimulationEngine.simulateScenario("user_test", "delay_launch", { weeks: 2 });
    const hireSim = await strategicSimulationEngine.simulateScenario("user_test", "hire_role", { role: "Senior Designer" });

    const comparison = strategicSimulationEngine.compareScenarios(delaySim, hireSim);
    assert.ok(comparison.recommendation, "Should provide recommendation summary");
    assert.ok(comparison.comparisonMatrix.length >= 2, "Should return comparison matrix");
    assert.ok(comparison.scenarioB.projectedHealthScore >= comparison.scenarioA.projectedHealthScore);
});
