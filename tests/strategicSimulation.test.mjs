import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { StrategicRiskEngine } from "../lib/strategy/strategicRiskEngine.ts";
import { StrategicSimulationEngine } from "../lib/strategy/strategicSimulationEngine.ts";

describe("Sprint 6 — Milestone 4: Multi-Mode Strategic Scenario Simulation & Strategic Risk Engine", () => {
    it("StrategicRiskEngine computes 5-dimensional risk breakdown and composite score", () => {
        const riskEngine = new StrategicRiskEngine();

        const proposal = {
            id: "prop_201",
            title: "Migrate Cloud Infrastructure to AWS",
            objective: "Reduce latency and scale infrastructure",
            expectedBenefitUSD: 30000,
            estimatedCostUSD: 22000,
            estimatedRisk: 60,
            reversibilityScore: 0.60,
            supportingEvidence: ["AWS pricing calculator"],
            affectedDepartments: ["engineering", "finance"],
            strategyAlignment: 88,
            confidence: 0.85,
            createdAt: Date.now()
        };

        const breakdown = riskEngine.evaluateProposalRisk(proposal);
        assert.ok(breakdown.financialRisk > 0);
        assert.ok(breakdown.complianceRisk > 0);
        assert.ok(breakdown.operationalRisk > 0);
        assert.ok(breakdown.securityRisk > 0);
        assert.ok(breakdown.reputationRisk > 0);
        assert.ok(breakdown.compositeRiskScore > 0);
        assert.ok(breakdown.rationale.includes("Multidimensional Risk"));
    });

    it("StrategicSimulationEngine executes simulations with range distributions and scenario assumptions", () => {
        const simEngine = new StrategicSimulationEngine();

        const proposal = {
            id: "prop_202",
            title: "Launch Enterprise Referral Program",
            objective: "Accelerate organic pipeline growth",
            expectedBenefitUSD: 40000,
            estimatedCostUSD: 12000,
            estimatedRisk: 25,
            reversibilityScore: 0.90,
            supportingEvidence: ["HubSpot referral data"],
            affectedDepartments: ["sales", "marketing"],
            strategyAlignment: 95,
            confidence: 0.92,
            createdAt: Date.now()
        };

        // 1. Test Monte Carlo Mode
        const mcRes = simEngine.runSimulation(proposal, "monte_carlo", "v1.0_growth");
        assert.equal(mcRes.proposalId, "prop_202");
        assert.equal(mcRes.strategyVersion, "v1.0_growth");
        assert.equal(mcRes.mode, "monte_carlo");
        assert.ok(mcRes.forecasts.length >= 2);

        const mrrForecast = mcRes.forecasts.find((f) => f.metricKey === "mrr_usd");
        assert.ok(mrrForecast);
        assert.ok(mrrForecast.min < mrrForecast.median);
        assert.ok(mrrForecast.median < mrrForecast.max);
        assert.ok(mrrForecast.ci95Lower <= mrrForecast.median);

        // 2. Test Sensitivity Analysis Mode (-20% Revenue Perturbation)
        const sensRes = simEngine.runSimulation(proposal, "sensitivity_analysis", "v1.0_growth");
        assert.equal(sensRes.mode, "sensitivity_analysis");
        assert.ok(sensRes.assumptions.some((a) => a.changePercentage === -20));

        // 3. Test Stress Test Mode (-40% Liquidity Shock)
        const stressRes = simEngine.runSimulation(proposal, "stress_test", "v1.0_growth");
        assert.equal(stressRes.mode, "stress_test");
        assert.ok(stressRes.assumptions.some((a) => a.changePercentage === -40));
    });
});
