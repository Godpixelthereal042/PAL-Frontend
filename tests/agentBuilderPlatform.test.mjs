/**
 * PAL Agent Builder Platform Test Suite (PAL-TDD-014, Sprint 27 Milestone 5)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AgentBuilderPlatform } from "../lib/platform/agentBuilderPlatform.ts";

describe("Sprint 27 Milestone 5 — PAL Agent Builder Platform", () => {
    const agentBuilder = AgentBuilderPlatform.getInstance();

    it("1. Creates custom AI worker agent in DRAFT status with sandboxed execution", () => {
        const agent = agentBuilder.createCustomAgent(
            "AI Tax Audit Specialist",
            "Tax Compliance Officer",
            ["read:stripe_invoices", "write:tax_reports"]
        );

        assert.ok(agent.agentId.startsWith("ag_builder_"));
        assert.equal(agent.agentName, "AI Tax Audit Specialist");
        assert.equal(agent.domainRole, "Tax Compliance Officer");
        assert.equal(agent.isSandboxed, true);
        assert.equal(agent.publishingStatus, "DRAFT");
    });

    it("2. Transitions custom agent to TESTING_SANDBOX and then PUBLISHED_MARKETPLACE", () => {
        const agent = agentBuilder.createCustomAgent(
            "AI Inventory Router",
            "Logistics Dispatcher",
            ["read:erp_stock", "write:shipment_orders"]
        );

        const sandboxed = agentBuilder.testInSandbox(agent.agentId);
        assert.equal(sandboxed.publishingStatus, "TESTING_SANDBOX");

        const published = agentBuilder.publishToMarketplace(agent.agentId);
        assert.equal(published.publishingStatus, "PUBLISHED_MARKETPLACE");
        assert.equal(published.isSandboxed, false);
        assert.ok(published.publishedAt);
    });
});
