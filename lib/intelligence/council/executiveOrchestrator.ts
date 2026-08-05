import type { CouncilConsolidation, ExecutiveRecommendation, IExecutiveAgent, IExecutiveOrchestrator } from "./types.ts";
import { CommunicationProtocol } from "./communicationProtocol.ts";
import { COOAgent } from "./personas/cooAgent.ts";
import { CFOAgent } from "./personas/cfoAgent.ts";
import { SalesAgent } from "./personas/salesAgent.ts";
import { MarketingAgent } from "./personas/marketingAgent.ts";
import { OpsAgent } from "./personas/opsAgent.ts";
import { LegalAgent } from "./personas/legalAgent.ts";
import { HRAgent } from "./personas/hrAgent.ts";

export class ExecutiveOrchestrator implements IExecutiveOrchestrator {
    private agents: Map<string, IExecutiveAgent> = new Map();
    private commProtocol: CommunicationProtocol;

    constructor(agents?: IExecutiveAgent[], commProtocol?: CommunicationProtocol) {
        this.commProtocol = commProtocol || new CommunicationProtocol();

        const defaultAgents = agents || [
            new COOAgent(),
            new CFOAgent(),
            new SalesAgent(),
            new MarketingAgent(),
            new OpsAgent(),
            new LegalAgent(),
            new HRAgent(),
        ];

        defaultAgents.forEach((a) => this.agents.set(a.getProfile().id, a));
    }

    async orchestrateCouncil(
        correlationId: string,
        challengeDomain: string,
        scenarios: any[],
        context: any
    ): Promise<CouncilConsolidation> {
        const participating = this.selectParticipatingAgents(challengeDomain);

        // Send initial consultation request message
        this.commProtocol.sendMessage(
            this.commProtocol.createMessage(
                correlationId,
                "orchestrator",
                participating.map((a) => a.getProfile().id),
                "consultation_request",
                `Council consultation initiated for domain: ${challengeDomain}`,
                1.0,
                [],
                "high"
            )
        );

        // Execute evaluations in parallel with timeout enforcement (5000ms)
        const evaluationPromises = participating.map((agent) =>
            this.evaluateWithTimeout(agent, correlationId, scenarios, context, 5000)
        );

        const recommendationsResults = await Promise.all(evaluationPromises);
        const recommendations = recommendationsResults.filter((r): r is ExecutiveRecommendation => r !== null);

        // Tally votes for scenario options
        const votes: Record<string, number> = {};
        let confidenceSum = 0;

        recommendations.forEach((rec) => {
            votes[rec.recommendedOptionId] = (votes[rec.recommendedOptionId] || 0) + 1;
            confidenceSum += rec.confidenceScore;
        });

        const confidenceAverage = recommendations.length > 0 ? Number((confidenceSum / recommendations.length).toFixed(2)) : 0;

        // Determine consensus
        let consensusOptionId = "";
        let maxVotes = 0;
        let consensusAchieved = false;

        Object.entries(votes).forEach(([optionId, voteCount]) => {
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                consensusOptionId = optionId;
            }
        });

        // Consensus requires majority vote (> 50%)
        if (maxVotes > recommendations.length / 2) {
            consensusAchieved = true;
        }

        let conflictResolutionApplied: string | undefined = undefined;

        // Apply Conflict Resolution Strategy if consensus not achieved or confidence low
        if (!consensusAchieved || confidenceAverage < 0.75) {
            conflictResolutionApplied = "Conflict Resolution Strategy Applied: Defaulted to CFO/COO risk-mitigated balanced option and flagged for human review if confidence remains below threshold.";
            // Default to balanced option as fall-back resolution
            const balanced = scenarios.find((s) => s.strategyType === "balanced");
            if (balanced) {
                consensusOptionId = balanced.optionId;
            }
        }

        const consolidatedSummary = `Executive Council evaluated ${scenarios.length} options across ${participating.length} domains. Selected ${consensusOptionId} with ${Math.round(confidenceAverage * 100)}% average confidence.`;

        return {
            correlationId,
            participatingAgents: participating.map((a) => a.getProfile().id),
            consensusAchieved,
            consensusOptionId,
            confidenceAverage,
            conflictResolutionApplied,
            individualRecommendations: recommendations,
            consolidatedSummary,
            timestamp: Date.now(),
        };
    }

    private selectParticipatingAgents(domain: string): IExecutiveAgent[] {
        // Select primary domain agent plus core COO & CFO agents for cross-functional governance
        const list: IExecutiveAgent[] = [];
        const coo = this.agents.get("ai_coo");
        const cfo = this.agents.get("ai_cfo");

        if (coo) list.push(coo);
        if (cfo) list.push(cfo);

        this.agents.forEach((agent) => {
            if (agent.getProfile().domain === domain && agent.getProfile().id !== "ai_coo" && agent.getProfile().id !== "ai_cfo") {
                list.push(agent);
            }
        });

        return list.length > 0 ? list : Array.from(this.agents.values());
    }

    private async evaluateWithTimeout(
        agent: IExecutiveAgent,
        correlationId: string,
        scenarios: any[],
        context: any,
        timeoutMs: number
    ): Promise<ExecutiveRecommendation | null> {
        return Promise.race([
            agent.evaluateChallenge(correlationId, scenarios, context),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
        ]);
    }
}
