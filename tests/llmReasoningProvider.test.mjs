import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LLMReasoningProvider } from "../lib/strategy/llmReasoningProvider.ts";
import { OKRStrategyEngine } from "../lib/strategy/okrStrategyEngine.ts";
import { ExecutiveCouncil } from "../lib/strategy/executiveCouncil.ts";
import { AgentNegotiationEngine } from "../lib/strategy/agentNegotiationEngine.ts";

describe("Sprint 7 — Milestone 1: Live Gemini LLM Reasoning Engine", () => {
    it("1. LLMReasoningProvider falls back to StaticReasoningProvider when API key is omitted", async () => {
        const provider = new LLMReasoningProvider(undefined);
        const intent = {
            id: "intent_test_1",
            title: "Expand Market Share",
            priority: "high",
            successMetrics: ["ARR > $5M"],
            deadline: Date.now() + 86400000,
            owner: "CEO",
            confidence: 0.9,
            strategyVersion: "v1.0_growth",
            status: "active",
            createdAt: Date.now()
        };

        const okrs = await provider.generateOKRs(intent, []);
        assert.equal(okrs.length, 1);
        assert.ok(okrs[0].objective.includes("Expand Market Share"));
    });

    it("2. LLMReasoningProvider correctly evaluates council votes in static fallback mode", async () => {
        const provider = new LLMReasoningProvider(undefined);
        const proposal = {
            id: "prop_01",
            title: "AI Customer Support Agent",
            objective: "Automate tier-1 tickets",
            expectedBenefitUSD: 50000,
            estimatedCostUSD: 10000,
            estimatedRisk: 20,
            reversibilityScore: 0.9,
            supportingEvidence: ["Beta results"],
            affectedDepartments: ["engineering", "finance"],
            strategyAlignment: 90,
            confidence: 0.95,
            createdAt: Date.now()
        };

        const vote = await provider.evaluateCouncilVote("mem_cfo", "Elena Vance", "finance", 1.2, proposal);
        assert.equal(vote.memberId, "mem_cfo");
        assert.equal(vote.vote, "YES");
    });

    it("3. OKRStrategyEngine works seamlessly when injected with LLMReasoningProvider", async () => {
        const llmProvider = new LLMReasoningProvider(undefined);
        const okrEngine = new OKRStrategyEngine(undefined, undefined, undefined, llmProvider);

        const compilerOutput = await okrEngine.compileIntent("Increase Customer Retention", "v1.0_growth");
        assert.equal(compilerOutput.okrs.length, 1);
        assert.ok(compilerOutput.intent.title.includes("Increase Customer Retention"));
    });

    it("4. AgentNegotiationEngine uses injected LLMReasoningProvider during negotiation round 2", async () => {
        const llmProvider = new LLMReasoningProvider(undefined);
        const council = new ExecutiveCouncil(undefined, undefined, llmProvider);
        const negotiationEngine = new AgentNegotiationEngine(council, llmProvider);

        const proposal = {
            id: "prop_neg_01",
            title: "Infrastructure Migration",
            objective: "Migrate database to multi-region cloud",
            expectedBenefitUSD: 80000,
            estimatedCostUSD: 12000,
            estimatedRisk: 40,
            reversibilityScore: 0.8,
            supportingEvidence: ["Cloud POC"],
            affectedDepartments: ["engineering", "finance"],
            strategyAlignment: 85,
            confidence: 0.9,
            createdAt: Date.now()
        };

        const result = await negotiationEngine.negotiateProposal(proposal);
        assert.equal(result.approved, true);
        assert.ok(result.consensusScore > 0.7);
    });
});
