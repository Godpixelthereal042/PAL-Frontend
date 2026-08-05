import test from "node:test";
import assert from "node:assert/strict";
import { executiveEventBus } from "../lib/events/executiveEventBus.ts";
import { eventHistory } from "../lib/events/eventHistory.ts";
import { eventDeduplicator } from "../lib/events/eventDeduplicator.ts";
import { executiveApprovalQueue } from "../lib/approvals/approvalQueue.ts";
import { playbookEngine } from "../lib/playbooks/playbookEngine.ts";
import { agentWatcherManager } from "../lib/events/agentWatchers.ts";

test("Executive Event Bus - publishes events and records history", async () => {
    eventHistory.clear();
    eventDeduplicator.clear();

    const published = await executiveEventBus.publish({
        id: "evt_test_1",
        type: "invoice_overdue",
        severity: "high",
        businessImpact: "Past due invoice for $7,500 pending collection",
        confidence: 0.95,
        urgency: "high",
        source: "finance_engine",
        timestamp: Date.now(),
        relatedEntities: { invoiceId: "inv_123" },
    });

    assert.equal(published, true, "Event should publish successfully");
    const recent = eventHistory.getRecentEvents();
    assert.ok(recent.length > 0, "Event history should contain published event");
    assert.equal(recent[0].type, "invoice_overdue");
});

test("Event Deduplicator - prevents duplicate events within window", async () => {
    eventDeduplicator.clear();

    const evt = {
        id: "evt_test_dup",
        type: "workflow_failed",
        severity: "critical",
        businessImpact: "Workflow execution failed",
        confidence: 0.90,
        urgency: "immediate",
        source: "workflow_engine",
        timestamp: Date.now(),
        relatedEntities: { workflowId: "wf_999" },
    };

    const first = await executiveEventBus.publish(evt);
    const second = await executiveEventBus.publish(evt);

    assert.equal(first, true, "First publish should succeed");
    assert.equal(second, false, "Second publish within 5s should be deduplicated");
});

test("Executive Approval Queue - stages proposals and executes approved actions", async () => {
    const staged = await executiveApprovalQueue.stageAction(
        "user_test",
        "finance",
        "CREATE_PROJECT",
        "Test Staged Action for Approval",
        { title: "Approved Project Milestone", description: "Created via approval" }
    );

    assert.ok(staged.id, "Staged action should have an ID");
    assert.equal(staged.status, "pending");

    const pending = await executiveApprovalQueue.listPending("user_test");
    assert.ok(pending.some((p) => p.id === staged.id), "Pending list should include staged action");

    const approvalResult = await executiveApprovalQueue.approveAction(staged.id, "user_test");
    assert.equal(approvalResult.success, true, "Approval execution should succeed");
});

test("Autonomous Playbooks - executes playbook and stages required approval actions", async () => {
    const catalog = playbookEngine.getCatalog();
    assert.ok(catalog.length >= 3, "Catalog should list at least 3 playbooks");

    const result = await playbookEngine.executePlaybook("investor_silent", "user_test");
    assert.equal(result.playbookType, "investor_silent");
    assert.ok(result.stagedActions.length > 0, "Playbook should stage proposal in Approval Queue");
});
