import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ExecutiveIntentEngine } from "../lib/strategy/executiveIntentEngine.ts";
import { ExecutivePolicyEngine } from "../lib/strategy/policyEngine.ts";
import { KPIRegistry } from "../lib/strategy/kpiRegistry.ts";
import { OKRStrategyEngine } from "../lib/strategy/okrStrategyEngine.ts";

describe("Sprint 6 — Milestone 2: OKR Strategy Engine, Versioned Policy Engine, Intent & KPI Registry", () => {
    it("ExecutiveIntentEngine tracks intents with strategy versioning", () => {
        const intentEngine = new ExecutiveIntentEngine();

        intentEngine.setStrategyVersion("v1.0_growth");
        const intent1 = intentEngine.registerIntent({ title: "Expand Enterprise Customers" });
        assert.equal(intent1.strategyVersion, "v1.0_growth");

        // Rotate strategy version
        intentEngine.setStrategyVersion("v2.0_profitability");
        const intent2 = intentEngine.registerIntent({ title: "Maximize Net Margin" });
        assert.equal(intent2.strategyVersion, "v2.0_profitability");

        const activeV2 = intentEngine.getActiveIntents("v2.0_profitability");
        assert.equal(activeV2.length, 1);
        assert.equal(activeV2[0].title, "Maximize Net Margin");
    });

    it("ExecutivePolicyEngine evaluates rich SOP rules and mandatory actions", () => {
        const policyEngine = new ExecutivePolicyEngine();

        // 1. Test High Value Refund Policy Trigger
        const eval1 = policyEngine.evaluateTaskPolicies("finance", "stripe.refund_payment", { amountUSD: 7500 });
        assert.equal(eval1.allowed, true);
        assert.equal(eval1.requiresApproval, true);

        // 2. Test Friday Deployment Violation
        const eval2 = policyEngine.evaluateTaskPolicies("engineering", "github.deploy_production", { isFridayEvening: true });
        assert.equal(eval2.allowed, false);
        assert.ok(eval2.violations.length >= 1);
        assert.ok(eval2.violations[0].includes("No Friday Evening Deployments"));
    });

    it("KPIRegistry maintains single source of truth for business metrics", () => {
        const kpiRegistry = new KPIRegistry();

        const mrr = kpiRegistry.getMetric("mrr_usd");
        assert.ok(mrr);
        assert.equal(mrr.value, 24500);

        kpiRegistry.setMetric("mrr_usd", "Monthly Recurring Revenue", 28000, "USD", 30000);
        assert.equal(kpiRegistry.getMetric("mrr_usd")?.value, 28000);
    });

    it("OKRStrategyEngine compiles goals into OKRs with full ancestry lineage and alignment scoring", async () => {
        const okrEngine = new OKRStrategyEngine();

        const compiled = await okrEngine.compileIntent("Accelerate Enterprise Expansion", "v1.0_growth");
        assert.equal(compiled.strategyVersion, "v1.0_growth");
        assert.ok(compiled.okrs.length >= 1);

        const okr = compiled.okrs[0];
        assert.ok(okr.lineage.originIntentId);
        assert.ok(okr.lineage.originPolicyIds.length >= 1);
        assert.equal(okr.lineage.strategyVersion, "v1.0_growth");

        // Test Strategy Alignment Score Evaluation
        const alignment = await okrEngine.evaluateAlignment({
            expectedBenefitUSD: 5000,
            isFridayEvening: false,
            riskScore: 10
        });

        assert.ok(alignment.score >= 80);
        assert.ok(alignment.rationale.includes("Strategy Alignment Score"));
    });
});
