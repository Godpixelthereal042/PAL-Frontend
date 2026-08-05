import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutiveOrchestrator } from "../lib/intelligence/council/executiveOrchestrator.ts";
import { CommunicationProtocol } from "../lib/intelligence/council/communicationProtocol.ts";
import { COOAgent } from "../lib/intelligence/council/personas/cooAgent.ts";
import { CFOAgent } from "../lib/intelligence/council/personas/cfoAgent.ts";
import { SalesAgent } from "../lib/intelligence/council/personas/salesAgent.ts";

describe("Milestone 3: Executive Orchestrator & Multi-Agent Executive Council", () => {
    const correlationId = "corr_test_m3";

    it("Executive Capability Profiles define domain boundaries and authority limits", () => {
        const coo = new COOAgent();
        const cfo = new CFOAgent();

        const cooProfile = coo.getProfile();
        const cfoProfile = cfo.getProfile();

        assert.equal(cooProfile.id, "ai_coo");
        assert.equal(cooProfile.domain, "operations");
        assert.equal(cooProfile.authorityLimitUSD, 1000);

        assert.equal(cfoProfile.id, "ai_cfo");
        assert.equal(cfoProfile.domain, "finance");
        assert.equal(cfoProfile.authorityLimitUSD, 1000);
    });

    it("CommunicationProtocol records inter-agent messages with Correlation IDs", () => {
        const comm = new CommunicationProtocol();
        const msg = comm.createMessage(
            correlationId,
            "ai_coo",
            ["ai_cfo"],
            "consultation_request",
            "Requesting budget evaluation for cloud migration plan",
            0.95,
            ["ref_aws_audit"]
        );

        comm.sendMessage(msg);

        const history = comm.getMessagesByCorrelation(correlationId);
        assert.equal(history.length, 1);
        assert.equal(history[0].senderId, "ai_coo");
        assert.equal(history[0].intent, "consultation_request");
    });

    it("ExecutiveOrchestrator coordinates council discussion rounds, votes, and consolidations", async () => {
        const orchestrator = new ExecutiveOrchestrator();
        const scenarios = [
            { optionId: "option_a_conservative", strategyType: "conservative" },
            { optionId: "option_b_aggressive", strategyType: "aggressive" },
            { optionId: "option_c_balanced", strategyType: "balanced" },
        ];

        const result = await orchestrator.orchestrateCouncil(correlationId, "operations", scenarios, {});

        assert.equal(result.correlationId, correlationId);
        assert.ok(result.participatingAgents.length >= 2);
        assert.equal(result.consensusOptionId, "option_c_balanced");
        assert.ok(result.confidenceAverage >= 0.8);
        assert.equal(result.individualRecommendations.length, result.participatingAgents.length);
    });

    it("ExecutiveOrchestrator handles response timeouts and applies conflict resolution strategies", async () => {
        const slowAgent = {
            getProfile: () => ({
                id: "ai_slow",
                title: "Slow Agent",
                domain: "finance",
                capabilities: [],
                knowledgeDomains: [],
                authorityLimitUSD: 0,
                availableTools: [],
                requiredContextLayers: [],
                outputTypes: [],
            }),
            evaluateChallenge: async () => {
                await new Promise((r) => setTimeout(r, 6000)); // Intentionally exceeds 5000ms timeout
                return {
                    agentId: "ai_slow",
                    agentTitle: "Slow Agent",
                    recommendedOptionId: "option_a_conservative",
                    confidenceScore: 0.5,
                    domainRationale: "Slow response",
                    identifiedRisks: [],
                    suggestedMitigations: [],
                };
            },
        };

        const orchestrator = new ExecutiveOrchestrator([new COOAgent(), slowAgent]);
        const scenarios = [
            { optionId: "option_a_conservative", strategyType: "conservative" },
            { optionId: "option_c_balanced", strategyType: "balanced" },
        ];

        const result = await orchestrator.orchestrateCouncil(correlationId, "finance", scenarios, {});

        // Slow agent should be excluded due to timeout, but orchestrator completes with fast agents
        assert.ok(result.individualRecommendations.find((r) => r.agentId === "ai_coo"));
        assert.equal(result.individualRecommendations.find((r) => r.agentId === "ai_slow"), undefined);
    });
});
