/**
 * Executive Recommendation Engine
 *
 * PAL Milestone 7A — Executive Intelligence Engine
 */

import type { ExecutiveRecommendation, RiskInsight, OpportunityInsight } from "./types.ts";

export class ExecutiveRecommendationEngine {
    public generateRecommendations(
        topRisks: RiskInsight[],
        topOpportunities: OpportunityInsight[]
    ): ExecutiveRecommendation[] {
        const recommendations: ExecutiveRecommendation[] = [];
        const now = Date.now();

        // 1. Recommendation from Top Critical/High Risk
        if (topRisks.length > 0) {
            const risk = topRisks[0];
            recommendations.push({
                id: `rec_risk_${now}`,
                recommendation: risk.recommendedAction,
                whyItMatters: risk.impact,
                expectedOutcome: "Eliminates immediate operational risk & preserves execution pace",
                recommendedAction: risk.recommendedAction,
                priority: risk.severity === "critical" ? "critical" : "high",
                confidence: risk.confidence,
                actionUrl: risk.category === "financial" ? "/tasks" : risk.category === "relationship" ? "/relationships" : "/projects",
                category: risk.category,
            });
        }

        // 2. Recommendation from Top Opportunity
        if (topOpportunities.length > 0) {
            const opp = topOpportunities[0];
            recommendations.push({
                id: `rec_opp_${now}`,
                recommendation: opp.suggestedNextAction,
                whyItMatters: opp.reason,
                expectedOutcome: opp.potentialValue,
                recommendedAction: opp.suggestedNextAction,
                priority: "high",
                confidence: opp.confidence,
                actionUrl: opp.category === "investor" || opp.category === "client" ? "/relationships" : "/workflows",
                category: opp.category,
            });
        }

        // Default Recommendation Fallback if empty
        if (recommendations.length === 0) {
            recommendations.push({
                id: `rec_default_${now}`,
                recommendation: "Schedule weekly executive alignment call & review project milestones",
                whyItMatters: "Maintains clear operational alignment across engineering & product",
                expectedOutcome: "+15% milestone execution velocity",
                recommendedAction: "Review Executive Dashboard and clear outstanding task queue",
                priority: "medium",
                confidence: 0.85,
                actionUrl: "/projects",
                category: "general",
            });
        }

        return recommendations;
    }
}

export const recommendationEngine = new ExecutiveRecommendationEngine();
