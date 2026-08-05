/**
 * Autonomous Enterprise Strategy Advisor Test Suite (PAL-TDD-014, Sprint 27 Milestone 2)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AutonomousStrategyAdvisor } from "../lib/strategy/autonomousStrategyAdvisor.ts";

describe("Sprint 27 Milestone 2 — Autonomous Enterprise Strategy Advisor", () => {
    const strategyAdvisor = AutonomousStrategyAdvisor.getInstance();

    it("1. Generates 12-month strategic plan with $10M growth target and 92% scenario confidence", () => {
        const plan = strategyAdvisor.generateStrategicPlan("ws_ceo_leader", "Leader Corp");

        assert.ok(plan.planId.startsWith("strat_plan_"));
        assert.equal(plan.horizonMonths, 12);
        assert.equal(plan.primaryGrowthTargetUsd, 10000000);
        assert.equal(plan.simulatedSuccessConfidencePct, 92);
    });

    it("2. Recommends $4M total capital allocation across R&D, Sales, AI Workforce, and Reserve", () => {
        const plan = strategyAdvisor.generateStrategicPlan("ws_ceo_leader");
        const ca = plan.recommendedCapitalAllocationUsd;

        assert.equal(ca.rAndDUsd, 1200000);
        assert.equal(ca.salesAndMarketingUsd, 1800000);
        assert.equal(ca.aiWorkforceExpansionUsd, 600000);
        assert.equal(ca.reserveUsd, 400000);
        assert.equal(ca.rAndDUsd + ca.salesAndMarketingUsd + ca.aiWorkforceExpansionUsd + ca.reserveUsd, 4000000);
    });

    it("3. Verifies 4 quarterly strategic milestones in plan", () => {
        const plan = strategyAdvisor.generateStrategicPlan("ws_ceo_leader");
        assert.equal(plan.strategicMilestones.length, 4);
        assert.ok(plan.strategicMilestones[3].includes("$10M ARR"));
    });
});
