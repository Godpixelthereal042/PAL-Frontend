import test from "node:test";
import assert from "node:assert/strict";

import { globalConnectorRegistry } from "../lib/integrations/registry.ts";
import { globalAuthManager } from "../lib/integrations/authManager.ts";
import { globalIntegrationManager } from "../lib/integrations/integrationManager.ts";
import { globalAuditLogger } from "../lib/integrations/auditLogger.ts";
import { MockConnector, mockConnectorInstance } from "../lib/integrations/connectors/mockConnector.ts";

test("Integration Framework - Registry registers and lists connectors", () => {
    globalConnectorRegistry.clear();
    globalConnectorRegistry.registerConnector(mockConnectorInstance);

    const connectors = globalIntegrationManager.listAvailableConnectors();
    assert.equal(connectors.length, 1);
    assert.equal(connectors[0].id, "mock_connector");
    assert.equal(connectors[0].provider, "mock");
});

test("Integration Framework - AuthManager saves and retrieves auth context", async () => {
    const testUserId = `user_auth_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "mock",
        userId: testUserId,
        grantedScopes: ["read:mock", "write:mock"],
        status: "connected",
        config: { env: "test" },
    });

    const authContext = await globalAuthManager.getAuthContext(testUserId, "mock");
    assert.equal(authContext.userId, testUserId);
    assert.equal(authContext.provider, "mock");
    assert.equal(authContext.status, "connected");
    assert.deepEqual(authContext.grantedScopes, ["read:mock", "write:mock"]);
});

test("Integration Framework - Rejects execution when missing required scope", async () => {
    globalConnectorRegistry.clear();
    globalConnectorRegistry.registerConnector(mockConnectorInstance);

    const testUserId = `user_unauth_${Date.now()}`;

    // Save auth without required 'read:mock' scope
    await globalAuthManager.saveAuthContext({
        provider: "mock",
        userId: testUserId,
        grantedScopes: [],
        status: "connected",
    });

    const response = await globalIntegrationManager.executeConnector({
        provider: "mock",
        operation: "ping",
        params: {},
        userId: testUserId,
    });

    assert.equal(response.success, false);
    assert.equal(response.error?.code, "UNAUTHORIZED");
    assert.ok(response.error?.message.includes("read:mock"));
});

test("Integration Framework - Executes operation successfully when permissions are granted", async () => {
    globalConnectorRegistry.clear();
    globalConnectorRegistry.registerConnector(mockConnectorInstance);

    const testUserId = `user_exec_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "mock",
        userId: testUserId,
        grantedScopes: ["read:mock", "write:mock"],
        status: "connected",
    });

    const response = await globalIntegrationManager.executeConnector({
        provider: "mock",
        operation: "echo",
        params: { message: "Hello PAL Integration Framework!" },
        userId: testUserId,
    });

    assert.equal(response.success, true);
    assert.equal(response.provider, "mock");
    assert.equal(response.connectorId, "mock_connector");
    assert.ok(response.data);
    assert.equal(response.data.echo.message, "Hello PAL Integration Framework!");
    assert.ok(response.executionTimeMs >= 0);
});

test("Integration Framework - Handles connector execution exceptions cleanly", async () => {
    globalConnectorRegistry.clear();
    globalConnectorRegistry.registerConnector(mockConnectorInstance);

    const testUserId = `user_err_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "mock",
        userId: testUserId,
        grantedScopes: ["write:mock"],
        status: "connected",
    });

    const response = await globalIntegrationManager.executeConnector({
        provider: "mock",
        operation: "simulate_error",
        params: {},
        userId: testUserId,
    });

    assert.equal(response.success, false);
    assert.equal(response.error?.code, "CONNECTOR_EXECUTION_ERROR");
    assert.ok(response.error?.message.includes("Simulated connector exception"));
});

test("Integration Framework - Performs health monitoring check", async () => {
    globalConnectorRegistry.clear();
    globalConnectorRegistry.registerConnector(mockConnectorInstance);

    const testUserId = `user_health_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "mock",
        userId: testUserId,
        grantedScopes: ["read:mock"],
        status: "connected",
    });

    const health = await globalIntegrationManager.getConnectorHealth(testUserId, "mock");
    assert.equal(health.status, "healthy");
    assert.ok(health.message?.includes("operational"));
});

test("Integration Framework - Persists audit logs to SQLite database", async () => {
    globalConnectorRegistry.clear();
    globalConnectorRegistry.registerConnector(mockConnectorInstance);

    const testUserId = `user_audit_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "mock",
        userId: testUserId,
        grantedScopes: ["read:mock"],
        status: "connected",
    });

    await globalIntegrationManager.executeConnector({
        provider: "mock",
        operation: "ping",
        params: { testRun: true },
        userId: testUserId,
    });

    const logs = await globalAuditLogger.getAuditLogs(testUserId, { provider: "mock" });
    assert.ok(logs.length >= 1);
    assert.equal(logs[0].provider, "mock");
    assert.equal(logs[0].operation, "ping");
    assert.equal(logs[0].status, "success");
});
