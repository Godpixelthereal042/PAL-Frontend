import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ResourceAllocationEngine } from "../lib/strategy/resourceAllocationEngine.ts";
import { ExecutiveScheduler } from "../lib/strategy/executiveScheduler.ts";

describe("Sprint 6 — Milestone 1: Economic Scheduler & Resource Allocation Engine", () => {
    it("ResourceAllocationEngine tracks departmental budgets and enforces capacity limits", () => {
        const resourceEngine = new ResourceAllocationEngine();

        // Check default engineering budget
        const engBudget = resourceEngine.getDepartmentBudget("engineering");
        assert.ok(engBudget);
        assert.equal(engBudget.capitalUSD, 50000);

        // Custom department budget override
        resourceEngine.setDepartmentBudget({
            department: "marketing",
            capitalUSD: 1000,
            aiTokensQuota: 50000,
            humanHoursQuota: 5,
            computeNodesQuota: 2,
            apiRateLimitQuota: 100
        });

        // Test allocation within limits
        const allocSuccess = resourceEngine.allocateResource("marketing", { capitalUSD: 400, aiTokens: 20000 });
        assert.equal(allocSuccess, true);

        // Test allocation exceeding limits (400 + 700 > 1000)
        const allocFail = resourceEngine.allocateResource("marketing", { capitalUSD: 700 });
        assert.equal(allocFail, false);
    });

    it("ExecutiveScheduler calculates Economic Priority Rating (EPR) and orders queue by Priority Class & EPR", () => {
        const scheduler = new ExecutiveScheduler();

        const taskRoutineLowROI = scheduler.enqueueTask({
            taskId: "task_1",
            taskName: "Routine Maintenance",
            department: "engineering",
            priorityClass: "routine",
            expectedBenefitUSD: 100,
            tokenCostUSD: 5,
            computeCostUSD: 5,
            riskScore: 10,
            confidence: 0.9,
            reversibilityScore: 0.9,
            createdAt: Date.now()
        });

        const taskHighROI = scheduler.enqueueTask({
            taskId: "task_2",
            taskName: "Optimize Stripe Billing Fees",
            department: "finance",
            priorityClass: "high_roi",
            expectedBenefitUSD: 10000,
            tokenCostUSD: 10,
            computeCostUSD: 10,
            riskScore: 20,
            confidence: 0.95,
            reversibilityScore: 0.95,
            createdAt: Date.now()
        });

        const taskCriticalPath = scheduler.enqueueTask({
            taskId: "task_3",
            taskName: "Emergency Security Patch",
            department: "engineering",
            priorityClass: "critical_path",
            expectedBenefitUSD: 50000,
            tokenCostUSD: 20,
            computeCostUSD: 20,
            riskScore: 50,
            confidence: 0.99,
            reversibilityScore: 0.8,
            createdAt: Date.now()
        });

        // First task returned MUST be critical_path
        const next1 = scheduler.getNextExecutableTask();
        assert.ok(next1);
        assert.equal(next1.taskId, "task_3");

        // Second task returned MUST be high_roi
        const next2 = scheduler.getNextExecutableTask();
        assert.ok(next2);
        assert.equal(next2.taskId, "task_2");
        assert.ok(next2.economicPriorityRating > 100);
    });
});
