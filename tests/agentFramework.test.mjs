import test from "node:test";
import assert from "node:assert/strict";
import { globalAgentRegistry } from "../lib/agents/agentRegistry.ts";
import { cooOrchestrator } from "../lib/agents/cooOrchestrator.ts";

test("Agent Framework - registers all 6 specialized executive agents", () => {
    const agents = globalAgentRegistry.listAgents();
    assert.equal(agents.length, 6, "Registry should contain 6 registered agents");

    const roles = agents.map((a) => a.role);
    assert.ok(roles.includes("coo"), "Should contain COO Agent");
    assert.ok(roles.includes("chief_of_staff"), "Should contain Chief of Staff Agent");
    assert.ok(roles.includes("operations"), "Should contain Operations Agent");
    assert.ok(roles.includes("sales_growth"), "Should contain Sales & Growth Agent");
    assert.ok(roles.includes("finance"), "Should contain Finance Agent");
    assert.ok(roles.includes("project"), "Should contain Project Agent");
});

test("Agent Framework - fetches specific agent metadata & capabilities", () => {
    const finAgent = globalAgentRegistry.get("finance");
    assert.ok(finAgent, "Finance agent should exist");
    assert.equal(finAgent.name, "Finance Agent");
    assert.ok(finAgent.capabilities.includes("invoice_tracking"));
});

test("AI COO Orchestrator - executes multi-agent synthesis under single shared context", async () => {
    const result = await cooOrchestrator.orchestrate("user_test", "Should I delay the launch by two weeks?");

    assert.ok(result, "Orchestration should return result");
    assert.ok(result.participatingAgents.length >= 3, "Prompt should trigger multiple relevant agents");
    assert.ok(result.participatingAgents.includes("project"), "Should include Project Agent");
    assert.ok(result.participatingAgents.includes("finance"), "Should include Finance Agent");
    assert.ok(result.unifiedConfidence > 0, "Should compute unified confidence rating");
    assert.ok(result.synthesizedSummary, "Should generate synthesized summary");
});

test("AI COO Orchestrator - handles default status query across all executive agents", async () => {
    const result = await cooOrchestrator.orchestrate("user_test");

    assert.equal(result.participatingAgents.length, 6, "Default orchestration should query all 6 agents");
    assert.equal(result.agentResponses.length, 6, "Should receive 6 agent responses");
    assert.ok(result.unifiedConfidence >= 0.80, "Unified confidence should reflect agent consensus");
});
