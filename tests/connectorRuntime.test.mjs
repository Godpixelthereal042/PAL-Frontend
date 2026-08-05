import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ConnectorRuntime } from "../lib/integrations/connectorRuntime.ts";
import { ConnectorManager } from "../lib/integrations/connectorManager.ts";
import { ConnectorHealthMonitor } from "../lib/integrations/connectorHealth.ts";

// Mock IConnectorProvider driver
class MockStripeProvider {
    getConnectorId() { return "stripe"; }
    getName() { return "Stripe Integration Provider"; }
    async connect(config) {
        return {
            connectorId: config.connectorId,
            workspaceId: config.workspaceId,
            status: config.isSandbox ? "sandbox" : "connected",
            connectedAt: Date.now(),
            lastPingAt: Date.now()
        };
    }
    async disconnect() {}
    async refresh() { return { success: true, expiresAt: Date.now() + 3600000 }; }
    async health() {
        return {
            connectorId: "stripe",
            status: "connected",
            latencyMs: 12,
            consecutiveFailures: 0,
            lastCheckedAt: Date.now(),
            rateLimitRemaining: 99
        };
    }
    discoverTools() {
        return [
            {
                toolId: "stripe.refund_charge",
                connectorId: "stripe",
                name: "Refund Stripe Charge",
                category: "finance",
                requiredCapability: "stripe:write",
                inputSchema: { chargeId: "string", amountUSD: "number" },
                outputSchema: { refundId: "string", status: "string" },
                supportsDryRun: true
            }
        ];
    }
    async executeTool(toolId, params, context) {
        return { refundId: `re_mock_${Date.now()}`, chargeId: params.chargeId, amountUSD: params.amountUSD };
    }
    async verifyWebhook(headers, rawBody) {
        return { valid: headers["stripe-signature"] === "valid_sig" };
    }
}

describe("Sprint 5 — Milestone 1: Enterprise Connector Runtime", () => {
    
    it("ConnectorManager registers drivers and discovers tool contracts", () => {
        const manager = new ConnectorManager();
        const provider = new MockStripeProvider();
        manager.registerDriver(provider);

        const driver = manager.getDriver("stripe");
        assert.ok(driver);
        assert.equal(driver.getName(), "Stripe Integration Provider");

        const tools = manager.discoverAllTools();
        assert.equal(tools.length, 1);
        assert.equal(tools[0].toolId, "stripe.refund_charge");
    });

    it("ConnectorRuntime handles connection lifecycles and tool execution", async () => {
        const runtime = new ConnectorRuntime();
        const provider = new MockStripeProvider();
        runtime.registerProvider(provider);

        const connState = await runtime.connect({
            connectorId: "stripe",
            workspaceId: "tenant_acme",
            authType: "oauth2",
            isSandbox: true
        });

        assert.equal(connState.connectorId, "stripe");
        assert.equal(connState.status, "sandbox");

        const result = await runtime.executeTool("stripe", "stripe.refund_charge", { chargeId: "ch_123", amountUSD: 50 }, {});
        assert.ok(result.refundId.startsWith("re_mock_"));
        assert.equal(result.amountUSD, 50);
    });

    it("ConnectorHealthMonitor conducts health checks and auto-reconnection", async () => {
        const runtime = new ConnectorRuntime();
        const provider = new MockStripeProvider();
        runtime.registerProvider(provider);

        const health = await runtime.checkHealth("stripe");
        assert.equal(health.status, "connected");
        assert.equal(health.latencyMs, 12);

        const reconnect = await runtime.autoReconnect("tenant_acme", "stripe");
        assert.equal(reconnect.success, true);
    });
});
