import type { ExecutiveCapabilityProfile, ExecutiveRecommendation, IExecutiveAgent } from "../types.ts";

export class SalesAgent implements IExecutiveAgent {
    getProfile(): ExecutiveCapabilityProfile {
        return {
            id: "ai_sales",
            title: "AI Sales Executive",
            domain: "sales",
            capabilities: ["Pipeline generation", "Deal velocity", "CRM hygiene", "Discount authorization"],
            knowledgeDomains: ["Salesforce deals", "HubSpot pipeline", "Customer email sentiment"],
            authorityLimitUSD: 500,
            availableTools: ["salesforce_connector", "hubspot_connector"],
            requiredContextLayers: ["operational", "conversational"],
            outputTypes: ["Pipeline Brief", "Deal Risk Alert"],
        };
    }

    async evaluateChallenge(correlationId: string, scenarios: any[], context: any): Promise<ExecutiveRecommendation> {
        const aggressive = scenarios.find((s) => s.strategyType === "aggressive") || scenarios[0];
        return {
            agentId: "ai_sales",
            agentTitle: "AI Sales Executive",
            recommendedOptionId: aggressive.optionId,
            confidenceScore: 0.88,
            domainRationale: "Aggressive velocity maximizes ARR impact and conversion speed.",
            identifiedRisks: ["Faster execution may compress deal review windows"],
            suggestedMitigations: ["Pre-approve sales discounts up to 15%"],
        };
    }
}
