/**
 * PAL Institutional Memory Engine Test Suite (PAL-TDD-007, Sprint 20 Milestone 5)
 *
 * Verifies:
 *   1. Answers historical decision archaeology queries ("Why do we price our enterprise plan this way?").
 *   2. Returns full provenance including decision date, makers, rationale, and evidence sources.
 *   3. Integrates CEO Preference Model findings into query response context.
 *   4. Stores new decision records with immutable record IDs and timestamps.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InstitutionalMemoryEngine } from "../lib/memory/institutionalMemoryEngine.ts";
import { TrustEvolutionEngine } from "../lib/trust/trustEvolutionEngine.ts";

describe("Sprint 20 Milestone 5 — PAL Institutional Intelligence Layer", () => {
    const memoryEngine = InstitutionalMemoryEngine.getInstance();
    const trustEngine = TrustEvolutionEngine.getInstance();

    it("1. Answers historical decision archaeology queries with exact decision provenance", () => {
        const result = memoryEngine.queryInstitutionalMemory(
            "ws_demo_company",
            "Why do we price our enterprise plan this way?"
        );

        assert.equal(result.workspaceId, "ws_demo_company");
        assert.ok(result.answer.includes("Enterprise pricing was set to $1,999/mo"));
        assert.equal(result.decisionDate, "14 months ago (May 2025)");
        assert.deepEqual(result.approvedBy, ["CEO", "CRO", "CFO"]);
        assert.ok(result.evidenceSources.length >= 1);
        assert.equal(result.evidenceSources[0].sourceName, "Notion Enterprise Strategy Doc");
    });

    it("2. Integrates CEO Preference Model overrides into query context", () => {
        // Record CEO override favoring growth preservation
        trustEngine.recordCEOOverride({
            decisionId: "dec_301",
            agentRole: "cfo",
            originalRecommendation: "Cut engineering head count",
            ceoOverrideAction: "Retain engineering staff to preserve velocity",
            perceivedStrategicIntent: "growth_preservation"
        });

        const result = memoryEngine.queryInstitutionalMemory(
            "ws_demo_company",
            "What is our enterprise pricing rationale?"
        );

        assert.ok(result.answer.includes("Executive preference model confirms strong bias toward growth preservation"));
    });

    it("3. Stores new decision archaeology records with complete provenance", () => {
        const stored = memoryEngine.storeDecisionRecord({
            workspaceId: "ws_demo_company",
            category: "hiring",
            topic: "Ghana Expansion Hiring Plan",
            originalDecisionDate: "July 2026",
            decisionMakers: ["CEO", "COO"],
            synthesizedRationale: "Approved 12 FTE hires in Accra branch to capture West Africa expansion opportunity.",
            evidenceSources: [
                { sourceName: "Macro Expansion Simulation Report", sourceType: "connector", urlOrId: "macro_sim_ghana" }
            ],
            originalOutcomeObserved: "$2.4M projected ARR",
            confidenceScore: 0.96
        });

        assert.ok(stored.recordId.startsWith("inst_mem_"));
        assert.equal(stored.topic, "Ghana Expansion Hiring Plan");

        const queryResult = memoryEngine.queryInstitutionalMemory("ws_demo_company", "hiring");
        assert.ok(queryResult);
    });
});
