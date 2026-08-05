import test from "node:test";
import assert from "node:assert/strict";

import {
    runWorkflow,
    createWorkflow,
    triggerWorkflowEvent,
    getWorkflows,
    getWorkflowById,
    toggleWorkflow,
    deleteWorkflow,
    getWorkflowExecutions,
    STARTER_TEMPLATES,
} from "../lib/workflows/workflowEngine.ts";
import { matchesTrigger, findMatchingWorkflows } from "../lib/workflows/triggerEngine.ts";
import { evaluateConditions, evaluateOperator } from "../lib/workflows/conditionEngine.ts";
import { validateWorkflow } from "../lib/workflows/workflowValidator.ts";
import { createExecutionPlan } from "../lib/workflows/workflowPlanner.ts";
import { saveWorkflow } from "../lib/workflows/workflowRegistry.ts";

test("Trigger Engine - matches incoming triggers accurately", () => {
    const targetTrigger = { type: "meeting_ended", config: { type: "investor" } };

    assert.ok(matchesTrigger({ type: "meeting_ended", config: { type: "investor" } }, targetTrigger));
    assert.equal(matchesTrigger({ type: "meeting_ended", config: { type: "internal" } }, targetTrigger), false);
    assert.equal(matchesTrigger({ type: "task_created" }, targetTrigger), false);
});

test("Condition Engine - evaluates operators and composable AND / OR condition groups", () => {
    assert.ok(evaluateOperator(85, "greater_than", 70));
    assert.ok(evaluateOperator("Friday", "equals", "Friday"));
    assert.ok(evaluateOperator("overdue", "in", ["overdue", "pending"]));

    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL Labs" },
        business: { priorities: "ARR" },
        projects: [{ id: "p1", status: "In Progress" }],
        tasks: [],
        calendar: [],
        notifications: [],
        invoices: [{ id: "inv1", client: "Client A", amount: "$100", service: "Dev", date: "2026-06-01", status: "overdue" }],
        decisions: [],
        summary: { activeProjects: 1, overdueItems: 1, highPriorityItems: 0 },
    };

    const andGroup = {
        logic: "AND",
        conditions: [
            { type: "has_active_project", operator: "equals", value: true },
            { type: "outstanding_invoice", operator: "equals", value: true },
        ],
    };

    assert.ok(evaluateConditions(andGroup, mockContext));
});

test("Workflow Validator - validates actions and detects missing or self-referential dependencies", () => {
    const validWf = {
        id: "wf_val_1",
        userId: "u1",
        name: "Valid Workflow",
        enabled: true,
        trigger: { type: "task_overdue" },
        actions: [{ action: "CREATE_TASK", payload: { title: "Follow-up Task", priority: "high" } }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const valResult = validateWorkflow(validWf);
    assert.ok(valResult.valid);
    assert.equal(valResult.errors.length, 0);

    const invalidWf = {
        id: "wf_val_2",
        userId: "u1",
        name: "Invalid Workflow",
        enabled: true,
        trigger: { type: "task_overdue" },
        actions: [{ id: "step_1", action: "UNSUPPORTED_ACTION_TYPE", payload: {}, dependsOn: ["step_1"] }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const invalidResult = validateWorkflow(invalidWf);
    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.errors.length >= 1);
});

test("Workflow Planner - generates ordered ExecutionPlan", () => {
    const wf = {
        id: "wf_plan_1",
        userId: "u1",
        name: "Planned Workflow",
        enabled: true,
        trigger: { type: "meeting_ended" },
        actions: [
            { id: "step_b", action: "SEND_NOTIFICATION", payload: { title: "Done" }, dependsOn: ["step_a"] },
            { id: "step_a", action: "CREATE_TASK", payload: { title: "Follow up" } },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const plan = createExecutionPlan(wf, "meeting_ended");
    assert.equal(plan.orderedSteps.length, 2);
    assert.equal(plan.orderedSteps[0].id, "step_a");
    assert.equal(plan.orderedSteps[1].id, "step_b");
});

test("Workflow Engine - executes starter templates end-to-end", async () => {
    const testUserId = `user_wf_tpl_${Date.now()}`;

    // 1. Create Follow-up Meeting workflow from template
    const followupTpl = STARTER_TEMPLATES.find((t) => t.id === "tpl_meeting_followup");
    assert.ok(followupTpl);

    const wf = await createWorkflow(
        {
            name: followupTpl.template.name,
            description: followupTpl.template.description,
            enabled: true,
            trigger: followupTpl.template.trigger,
            actions: followupTpl.template.actions,
        },
        testUserId
    );

    assert.ok(wf.id);

    // 2. Trigger meeting_ended event
    const executions = await triggerWorkflowEvent(
        { type: "meeting_ended" },
        { title: "Q3 Board Sync", client: "Investors" },
        testUserId
    );

    assert.equal(executions.length, 1);
    const exec = executions[0];
    if (exec.status !== "completed") console.log("EXEC ERRORS:", exec.errors);
    assert.equal(exec.status, "completed");
    assert.equal(exec.steps.length, 1);
    assert.equal(exec.steps[0].status, "completed");
    assert.ok(exec.steps[0].resultPayload.task?.id || exec.steps[0].resultPayload.taskId);
});

test("Workflow Engine & History - stores execution audit trail and step results in SQLite", async () => {
    const testUserId = `user_wf_hist_${Date.now()}`;

    const wf = await createWorkflow(
        {
            name: "Audit Trail Test Workflow",
            enabled: true,
            trigger: { type: "manual_run" },
            actions: [
                { action: "SEND_NOTIFICATION", payload: { title: "Automated Test Notification", category: "executive" } },
            ],
        },
        testUserId
    );

    const exec = await runWorkflow(wf.id, testUserId, { triggerMeta: "manual_trigger" });
    assert.equal(exec.status, "completed");

    const history = await getWorkflowExecutions(wf.id, testUserId);
    assert.ok(history.length >= 1);
    assert.equal(history[0].id, exec.id);
    assert.equal(history[0].steps.length, 1);
    assert.equal(history[0].steps[0].actionType, "SEND_NOTIFICATION");
    assert.equal(history[0].steps[0].status, "completed");
});
