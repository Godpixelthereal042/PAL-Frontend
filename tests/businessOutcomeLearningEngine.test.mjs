/**
 * Business Outcome Learning Engine Test Suite (PAL-TDD-015, Sprint 28 Milestone 2)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BusinessOutcomeLearningEngine } from "../lib/intelligence/businessOutcomeLearningEngine.ts";

describe("Sprint 28 Milestone 2 — Business Outcome Learning Engine", () => {
    const outcomeEngine = BusinessOutcomeLearningEngine.getInstance();

    it("1. Compares $90,000 predicted value vs $95,400 actual value evaluating 94.3% accuracy", () => {
        const record = outcomeEngine.recordOutcomeLearning({
            workspaceId: "ws_flywheel_101",
            recommendationTitle: "SaaS License Consolidation & Auto-Renewal Audit",
            predictedValueUsd: 90000,
            actualMeasuredValueUsd: 95400
        });

        assert.ok(record.recordId.startsWith("lrn_rec_"));
        assert.equal(record.predictedValueUsd, 90000);
        assert.equal(record.actualMeasuredValueUsd, 95400);
        assert.equal(record.predictionAccuracyPct, 94.3);
        assert.equal(record.status, "LEARNED");
    });

    it("2. Calibrates model learning adjustment factor (+0.05) upon outcome verification", () => {
        const record = outcomeEngine.recordOutcomeLearning({
            workspaceId: "ws_flywheel_101",
            recommendationTitle: "SaaS License Consolidation & Auto-Renewal Audit",
            predictedValueUsd: 90000,
            actualMeasuredValueUsd: 95400
        });

        assert.equal(record.learningAdjustmentFactor, 0.05);
    });
});
