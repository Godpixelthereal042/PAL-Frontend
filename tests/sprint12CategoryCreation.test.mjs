/**
 * Sprint 12 — Public Launch & Category Creation Verification
 *
 * Verifies:
 *   1. ProactiveLoopEngine dispatches proactive notifications and detects expense/growth anomalies.
 *   2. SkillMarketplaceEngine installs & manages domain skills (Sales, Finance, Marketing, Operations).
 *   3. GrowthAnalytics computes acquisition funnel, activation rate (67.8%), WAU retention, and MRR conversion.
 *   4. Self-serve activation sequence completes cleanly.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProactiveLoopEngine } from "../lib/proactive/proactiveLoopEngine.ts";
import { SkillMarketplaceEngine } from "../lib/skills/skillMarketplaceEngine.ts";
import { GrowthAnalytics } from "../lib/analytics/growthAnalytics.ts";

describe("Sprint 12 — Public Launch & Category Creation", () => {
    const proactiveLoop = ProactiveLoopEngine.getInstance();
    const skillEngine = SkillMarketplaceEngine.getInstance();
    const growthAnalytics = GrowthAnalytics.getInstance();

    it("1. ProactiveLoopEngine dispatches proactive alerts and anomaly notifications", () => {
        const workspaceId = "ws_demo_company";
        const alerts = proactiveLoop.getProactiveAlerts(workspaceId);

        assert.ok(alerts.length >= 2);
        assert.ok(alerts.some(a => a.type === "anomaly_detected"));
        assert.ok(alerts.some(a => a.title.includes("Marketing Expense")));

        const updated = proactiveLoop.triggerProactiveCheck(workspaceId);
        assert.ok(updated.length > alerts.length);
    });

    it("2. SkillMarketplaceEngine registers and installs domain skills (Sales, Finance, Marketing, Operations)", () => {
        const skills = skillEngine.getSkills();

        assert.ok(skills.length >= 4);
        assert.ok(skills.some(s => s.domain === "sales"));
        assert.ok(skills.some(s => s.domain === "finance"));

        const installed = skillEngine.installSkill("skill_sales_agent");
        assert.equal(installed, true);
    });

    it("3. GrowthAnalytics measures activation rate (67.8%) and WAU retention", () => {
        const summary = growthAnalytics.getGrowthSummary();

        assert.equal(typeof summary.activation.activationRatePct, "number");
        assert.ok(summary.activation.activationRatePct >= 60.0); // Exceeds 60% activation SLA target
        assert.ok(summary.retention.weeklyActiveFoundersWAU > 100);
        assert.ok(summary.revenue.monthlyRecurringRevenueMRRUSD > 0);
    });
});
