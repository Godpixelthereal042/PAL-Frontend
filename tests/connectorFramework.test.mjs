import test from "node:test";
import assert from "node:assert/strict";
import { globalConnectorRegistry } from "../lib/connectors/framework/registry.ts";
import { connectorAuthManager } from "../lib/connectors/framework/authManager.ts";
import { connectorHealthMonitor } from "../lib/connectors/framework/healthMonitor.ts";
import { executiveEventBus } from "../lib/events/executiveEventBus.ts";
import { eventHistory } from "../lib/events/eventHistory.ts";
import { executiveApprovalQueue } from "../lib/approvals/approvalQueue.ts";

test("Enterprise Connector Framework - registers all 5 production connectors", () => {
    const connectors = globalConnectorRegistry.listConnectors();
    assert.ok(connectors.length >= 5, "Registry should list at least 5 production connectors");

    const ids = connectors.map((c) => c.metadata.id);
    assert.ok(ids.includes("google_workspace"), "Should include Google Workspace connector");
    assert.ok(ids.includes("slack"), "Should include Slack connector");
    assert.ok(ids.includes("github"), "Should include GitHub connector");
    assert.ok(ids.includes("notion"), "Should include Notion connector");
    assert.ok(ids.includes("stripe"), "Should include Stripe connector");
});

test("Connector Auth Manager - saves, retrieves, and revokes credentials", async () => {
    const saved = await connectorAuthManager.saveCredentials("user_test", "slack", {
        accessToken: "xoxb_test_token",
        scopes: ["chat:write"],
    });
    assert.equal(saved, true, "Saving credentials should succeed");

    const creds = await connectorAuthManager.getCredentials("user_test", "slack");
    assert.ok(creds, "Should retrieve credentials");
    assert.equal(creds.accessToken, "xoxb_test_token");

    const revoked = await connectorAuthManager.revokeCredentials("user_test", "slack");
    assert.equal(revoked, true, "Revoking credentials should succeed");
});

test("Connector Event Publisher - transforms external events into ExecutiveEventBus events", async () => {
    eventHistory.clear();
    const slackConnector = globalConnectorRegistry.get("slack");
    assert.ok(slackConnector, "Slack connector should exist");

    const published = await slackConnector.publishEvent({
        eventType: "executive_mention",
        source: "slack",
        payload: { channel: "#executives", message: "@pal Please review Q3 pitch deck" },
        timestamp: Date.now(),
    });

    assert.equal(published, true, "Publishing external event should succeed");
    const recent = eventHistory.getRecentEvents();
    assert.ok(recent.length > 0, "Event history should contain published external event");
    assert.equal(recent[0].source, "slack");
});

test("Connector Action Executor - executes actions and stages high-impact actions", async () => {
    const githubConnector = globalConnectorRegistry.get("github");
    assert.ok(githubConnector, "GitHub connector should exist");

    const actionResult = await githubConnector.executeAction("CREATE_GITHUB_ISSUE", {
        repo: "pal-frontend",
        title: "Fix auth token expiry",
    });

    assert.equal(actionResult.success, true, "Executing connector action should succeed");
    assert.equal(actionResult.data.executedAction, "CREATE_GITHUB_ISSUE");
});
