/**
 * Sprint 7 — Milestone 4.5: Observability & AI Evaluation Telemetry (PAL-TDD-006)
 *
 * Tests verify:
 *   1. LLMTelemetryRecorder logs traces and computes aggregated cost.
 *   2. LLMReasoningProvider automatically emits telemetry trace on call.
 *   3. TelemetrySummary aggregates requests, tokens, cost, latency, and schema pass rate.
 *   4. TelemetryRecorder records correlationId, confidence score, and fallback status.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LLMTelemetryRecorder } from "../lib/telemetry/llmTelemetry.ts";
import { LLMReasoningProvider } from "../lib/strategy/llmReasoningProvider.ts";

describe("Sprint 7 — Milestone 4.5: Observability & AI Evaluation Telemetry", () => {
    it("1. LLMTelemetryRecorder logs traces and computes aggregated cost", async () => {
        const recorder = new LLMTelemetryRecorder();

        await recorder.recordTrace({
            workspaceId: "ws_alpha",
            promptName: "GENERATE_OKRS",
            promptVersion: "v1.0",
            model: "gemini-1.5-flash",
            inputTokens: 600,
            outputTokens: 200,
            estimatedCostUSD: 0.00025,
            latencyMs: 120,
            success: true,
            retryCount: 0,
            schemaValid: true
        });

        await recorder.recordTrace({
            workspaceId: "ws_alpha",
            promptName: "EVALUATE_VOTE",
            promptVersion: "v1.0",
            model: "gemini-1.5-flash",
            inputTokens: 400,
            outputTokens: 100,
            estimatedCostUSD: 0.00015,
            latencyMs: 90,
            success: true,
            retryCount: 0,
            schemaValid: true
        });

        const traces = await recorder.getTraces("ws_alpha");
        assert.equal(traces.length, 2);
        assert.equal(recorder.calculateTotalCostUSD("ws_alpha"), 0.0004);
    });

    it("2. LLMReasoningProvider automatically emits telemetry trace on call", async () => {
        const recorder = new LLMTelemetryRecorder();
        const provider = new LLMReasoningProvider(undefined, 5000, recorder);

        const intent = {
            id: "intent_telemetry_1",
            title: "Expand Operations",
            priority: "high",
            successMetrics: ["Metric 1"],
            owner: "CEO",
            confidence: 0.9,
            strategyVersion: "v1.0_growth",
            status: "active",
            createdAt: Date.now()
        };

        await provider.generateOKRs(intent, []);

        const traces = await recorder.getTraces("default_workspace");
        assert.ok(traces.length > 0);
        assert.equal(traces[0].promptName, "GENERATE_OKRS");
    });

    it("3. TelemetrySummary aggregates requests, tokens, latency, cost, and pass rate", async () => {
        const recorder = new LLMTelemetryRecorder();

        await recorder.recordTrace({
            workspaceId: "ws_summary",
            correlationId: "corr_001",
            promptName: "COMPUTE_ALIGNMENT",
            promptVersion: "v1.0",
            model: "gemini-1.5-flash",
            inputTokens: 1000,
            outputTokens: 500,
            estimatedCostUSD: 0.0005,
            latencyMs: 200,
            success: true,
            retryCount: 0,
            schemaValid: true,
            confidenceScore: 0.95
        });

        await recorder.recordTrace({
            workspaceId: "ws_summary",
            correlationId: "corr_002",
            promptName: "SIMULATE_SCENARIO",
            promptVersion: "v1.0",
            model: "static_fallback",
            inputTokens: 0,
            outputTokens: 0,
            estimatedCostUSD: 0.0,
            latencyMs: 50,
            success: true,
            retryCount: 0,
            schemaValid: true,
            fallbackTriggered: true,
            confidenceScore: 0.85
        });

        const summary = recorder.getTelemetrySummary("ws_summary");
        assert.equal(summary.totalRequests, 2);
        assert.equal(summary.successfulRequests, 2);
        assert.equal(summary.fallbackRequests, 1);
        assert.equal(summary.totalInputTokens, 1000);
        assert.equal(summary.totalOutputTokens, 500);
        assert.equal(summary.totalCostUSD, 0.0005);
        assert.equal(summary.avgLatencyMs, 125);
        assert.equal(summary.schemaValidationPassRate, 100.0);
    });
});
