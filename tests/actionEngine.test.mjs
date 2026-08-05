import test from "node:test";
import assert from "node:assert/strict";
import { actionEngine, ActionType } from "../lib/actionEngine/engine.ts";
import { globalActionRegistry } from "../lib/actionEngine/registry.ts";
import { getDB } from "../lib/db.ts";

test("Action Engine Registry - lists all 6 supported action types", () => {
    const types = actionEngine.getSupportedActionTypes();
    assert.equal(types.length, 6);
    assert.ok(types.includes(ActionType.CREATE_PROJECT));
    assert.ok(types.includes(ActionType.CREATE_TASK));
    assert.ok(types.includes(ActionType.CREATE_INVOICE));
    assert.ok(types.includes(ActionType.CREATE_CALENDAR_EVENT));
    assert.ok(types.includes(ActionType.SAVE_DECISION));
    assert.ok(types.includes(ActionType.UPDATE_BUSINESS_BRAIN));
});

test("Action Engine Validation - rejects invalid payload & unregistered actions", async () => {
    const invalidTypeResult = await actionEngine.execute({
        type: "UNSUPPORTED_ACTION",
        userId: "user_test",
        params: {},
    });
    assert.equal(invalidTypeResult.success, false);
    assert.equal(invalidTypeResult.error?.code, "VALIDATION_ERROR");

    const missingTitleResult = await actionEngine.execute({
        type: ActionType.CREATE_PROJECT,
        userId: "user_test",
        params: { title: "" },
    });
    assert.equal(missingTitleResult.success, false);
    assert.equal(missingTitleResult.error?.code, "VALIDATION_ERROR");
});

test("CREATE_PROJECT Action - executes deterministically", async () => {
    const result = await actionEngine.execute({
        type: ActionType.CREATE_PROJECT,
        userId: "user_test_1",
        params: {
            title: "Test Engine Project",
            description: "Built via Action Engine",
            goal: "Validate action engine execution",
            priority: "High",
            dueDate: "2026-08-15",
            tasks: [
                { title: "First Action Task", description: "Subtask 1", priority: "high" },
                { title: "Second Action Task", description: "Subtask 2", priority: "medium" },
            ],
        },
    });

    assert.equal(result.success, true);
    assert.equal(result.actionType, ActionType.CREATE_PROJECT);
    assert.ok(result.data.project);
    assert.equal(result.data.project.title, "Test Engine Project");
    assert.equal(result.data.tasks.length, 2);

    // Verify DB state
    const db = await getDB();
    const dbProject = await db.get("SELECT * FROM projects WHERE id = ?", [result.data.project.id]);
    assert.ok(dbProject);
    assert.equal(dbProject.title, "Test Engine Project");

    const dbTasks = await db.all("SELECT * FROM tasks WHERE project_id = ?", [result.data.project.id]);
    assert.equal(dbTasks.length, 2);
});

test("CREATE_TASK Action - executes and checks project existence", async () => {
    const db = await getDB();

    // 1. Invalid project ID check
    const invalidProjectResult = await actionEngine.execute({
        type: ActionType.CREATE_TASK,
        userId: "user_test_1",
        params: {
            projectId: "non_existent_project_id",
            title: "Orphan Task",
        },
    });
    assert.equal(invalidProjectResult.success, false);
    assert.equal(invalidProjectResult.error?.code, "VALIDATION_ERROR");

    // 2. Create project first, then create valid task
    const projResult = await actionEngine.execute({
        type: ActionType.CREATE_PROJECT,
        userId: "user_test_1",
        params: { title: "Target Project for Task" },
    });

    const taskResult = await actionEngine.execute({
        type: ActionType.CREATE_TASK,
        userId: "user_test_1",
        params: {
            projectId: projResult.data.project.id,
            title: "Standalone Task via Action Engine",
            description: "Task description",
            priority: "high",
        },
    });

    assert.equal(taskResult.success, true);
    assert.equal(taskResult.data.task.title, "Standalone Task via Action Engine");

    const dbTask = await db.get("SELECT * FROM tasks WHERE id = ?", [taskResult.data.task.id]);
    assert.ok(dbTask);
    assert.equal(dbTask.project_id, projResult.data.project.id);
});

test("CREATE_INVOICE Action - creates invoice and generates receipt token", async () => {
    const result = await actionEngine.execute({
        type: ActionType.CREATE_INVOICE,
        userId: "user_test_1",
        params: {
            client: "Acme Corporation",
            amount: 2500,
            service: "AI Strategy Consulting",
        },
    });

    assert.equal(result.success, true);
    assert.equal(result.data.invoice.client, "Acme Corporation");
    assert.equal(result.data.invoice.amount, "2500");
    assert.ok(result.data.receiptToken.includes("INVOICE_RECEIPT"));

    const db = await getDB();
    const dbInv = await db.get("SELECT * FROM invoices WHERE id = ?", [result.data.invoice.id]);
    assert.ok(dbInv);
    assert.equal(dbInv.client, "Acme Corporation");
});

test("CREATE_CALENDAR_EVENT Action - creates event in calendar_events table", async () => {
    const result = await actionEngine.execute({
        type: ActionType.CREATE_CALENDAR_EVENT,
        userId: "user_test_1",
        params: {
            title: "Product Launch Strategy Sync",
            startsAt: "2026-08-01T10:00:00Z",
            endsAt: "2026-08-01T11:00:00Z",
        },
    });

    assert.equal(result.success, true);
    assert.equal(result.data.event.title, "Product Launch Strategy Sync");

    const db = await getDB();
    const dbEvt = await db.get("SELECT * FROM calendar_events WHERE id = ?", [result.data.event.id]);
    assert.ok(dbEvt);
    assert.equal(dbEvt.title, "Product Launch Strategy Sync");
});

test("SAVE_DECISION Action - creates decision linked to project and card token", async () => {
    const projResult = await actionEngine.execute({
        type: ActionType.CREATE_PROJECT,
        userId: "user_test_1",
        params: { title: "Decision Project Target" },
    });

    const result = await actionEngine.execute({
        type: ActionType.SAVE_DECISION,
        userId: "user_test_1",
        params: {
            projectId: projResult.data.project.id,
            title: "Use PostgreSQL for Vector Search",
            description: "Agreed to leverage pgvector extension for embedding searches.",
        },
    });

    assert.equal(result.success, true);
    assert.equal(result.data.decision.title, "Use PostgreSQL for Vector Search");
    assert.ok(result.data.cardToken.includes("DECISION_CARD"));

    const db = await getDB();
    const dbDec = await db.get("SELECT * FROM decisions WHERE id = ?", [result.data.decision.id]);
    assert.ok(dbDec);
    assert.equal(dbDec.title, "Use PostgreSQL for Vector Search");
});

test("UPDATE_BUSINESS_BRAIN Action - upserts core brain and child entities", async () => {
    const testUserId = `user_brain_test_${Date.now()}`;
    const result = await actionEngine.execute({
        type: ActionType.UPDATE_BUSINESS_BRAIN,
        userId: testUserId,
        params: {
            businessName: "Nova AI Labs",
            businessDescription: "Autonomous co-founder for tech founders",
            industry: "Artificial Intelligence",
            businessStage: "scaling",
            priorities: "Scale ARR to $50k",
            goals: [{ title: "Reach 500 Active Subscriptions", timeframe: "Q3 2026" }],
            offers: [{ name: "Pal Pro Monthly", price: "49" }],
        },
    });

    assert.equal(result.success, true);
    assert.ok(result.data.brain);
    assert.equal(result.data.brain.brain.business_name, "Nova AI Labs");
    assert.equal(result.data.brain.goals.length, 1);
    assert.equal(result.data.brain.offers.length, 1);
});
