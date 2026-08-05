/**
 * Live Business Intelligence Pipeline Test Suite (PAL-TDD-010, Sprint 23 Milestone 2)
 *
 * Verifies:
 *   1. Executes 7-stage closed-loop intelligence pipeline from connector events to agent analysis.
 *   2. Detects revenue, cost, and growth business signals with estimated financial impact ($).
 *   3. Dispatches updates to Knowledge Graph and feeds back into system learning loop.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LiveBusinessIntelligencePipeline } from "../lib/intelligence/liveBusinessIntelligencePipeline.ts";

describe("Sprint 23 Milestone 2 — Live Business Intelligence Pipeline", () => {
    const pipeline = LiveBusinessIntelligencePipeline.getInstance();

    it("1. Executes 7-stage intelligence loop and ingests raw connector events", () => {
        const result = pipeline.runPipeline("ws_acme_saas_prod");

        assert.ok(result.pipelineExecutionId.startsWith("pipe_exec_"));
        assert.equal(result.workspaceId, "ws_acme_saas_prod");
        assert.equal(result.rawEventsIngestedCount, 142);
        assert.equal(result.knowledgeGraphNodesUpdatedCount, 38);
        assert.equal(result.learningLoopUpdated, true);
    });

    it("2. Detects revenue, cost, and growth signals with estimated USD financial impact", () => {
        const result = pipeline.runPipeline("ws_acme_saas_prod");

        assert.equal(result.signalsDetected.length, 3);
        const costSignal = result.signalsDetected.find(s => s.category === "cost");
        const revSignal = result.signalsDetected.find(s => s.category === "revenue");

        assert.ok(costSignal);
        assert.equal(costSignal.estimatedImpactUsd, 14400);

        assert.ok(revSignal);
        assert.equal(revSignal.severity, "critical");
    });
});
