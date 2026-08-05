import { test, describe } from "node:test";
import assert from "node:assert";
import { AuditEngine } from "../lib/security/observability/auditEngine.ts";
import { ResilienceEngine } from "../lib/security/resilience/resilienceEngine.ts";

describe("Milestone 6: Audit, Observability & Resilience Subsystem", () => {
    test("AuditEngine logs immutable events, verifies HMAC tamper signatures, and tracks metrics", async () => {
        const auditEngine = new AuditEngine();
        const workspaceId = `ws_audit_${Date.now()}`;
        const correlationId = `corr_test_12345`;

        const logEntry = await auditEngine.logAuditEvent({
            workspaceId,
            actorId: "usr_alice",
            actorType: "human",
            event: "UserLoggedIn",
            resource: "/api/v1/auth/login",
            result: "success",
            correlationId
        });

        assert.strictEqual(logEntry.correlation_id, correlationId);
        assert.strictEqual(typeof logEntry.signature, "string");
        assert.strictEqual(logEntry.signature.length, 64);

        // Verify Tamper Signature (Valid)
        const isValid = auditEngine.verifyTamperSignature(logEntry, logEntry.signature);
        assert.strictEqual(isValid, true);

        // Verify Tamper Signature (Tampered metadata)
        const tamperedLog = { ...logEntry, event: "UnauthorizedEscalation" };
        const isTamperedValid = auditEngine.verifyTamperSignature(tamperedLog, logEntry.signature);
        assert.strictEqual(isTamperedValid, false);

        // Telemetry Metrics
        const metrics = auditEngine.getTelemetryMetrics();
        assert.strictEqual(metrics.totalAuditEvents > 0, true);
    });

    test("ResilienceEngine handles retry, circuit breaker state transitions, timeout, and idempotency", async () => {
        const resilience = new ResilienceEngine({
            failureThreshold: 2,
            resetTimeoutMs: 100
        });

        assert.strictEqual(resilience.getCircuitState(), "closed");

        // 1. Idempotency Key Caching
        let counter = 0;
        const task = async () => ++counter;

        const res1 = await resilience.executeWithResilience(task, { idempotencyKey: "key_idem_1" });
        assert.strictEqual(res1, 1);

        const res2 = await resilience.executeWithResilience(task, { idempotencyKey: "key_idem_1" });
        assert.strictEqual(res2, 1); // Should return cached value without executing task again
        assert.strictEqual(counter, 1);

        // 2. Retry with Failure -> Circuit Breaker Opening
        let attempts = 0;
        const failingTask = async () => {
            attempts++;
            throw new Error("Simulated downstream outage");
        };

        await assert.rejects(async () => {
            await resilience.executeWithResilience(failingTask, { retry: { maxAttempts: 2, baseDelayMs: 10 } });
        });

        assert.strictEqual(attempts, 2);
        assert.strictEqual(resilience.getCircuitState(), "open");

        // 3. Execution blocked when Circuit Breaker is OPEN
        await assert.rejects(async () => {
            await resilience.executeWithResilience(async () => "ok");
        }, (err) => {
            assert.strictEqual(err.name, "InternalServerError");
            assert.strictEqual(err.message.includes("Circuit breaker is OPEN"), true);
            return true;
        });

        // 4. Reset Timeout Transition -> HALF_OPEN -> CLOSED
        await new Promise(resolve => setTimeout(resolve, 150));
        assert.strictEqual(resilience.getCircuitState(), "half_open");

        const successTask = async () => "recovery_successful";
        const recoveryRes = await resilience.executeWithResilience(successTask);
        assert.strictEqual(recoveryRes, "recovery_successful");
        assert.strictEqual(resilience.getCircuitState(), "closed");
    });
});
