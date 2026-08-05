/**
 * Explainability Engine
 *
 * PAL Milestone 7B — Explainability, Learning & Simulation Engine
 */

import { executiveIntelligenceEngine } from "./intelligenceEngine.ts";
import { confidenceModel, type ConfidenceEvaluation } from "./confidenceModel.ts";

export interface ExplanationDetails {
    id: string;
    recommendation: string;
    why: string[];
    supportingEvidence: Array<{
        type: "timeline" | "relationship" | "decision" | "calendar" | "invoice";
        description: string;
        timestamp?: number | string;
    }>;
    confidence: ConfidenceEvaluation;
    expectedImpact: string;
    relatedContext: {
        projects: Array<{ id: string; title: string }>;
        relationships: Array<{ id: string; name: string; type: string }>;
        decisions: Array<{ id: string; title: string }>;
    };
}

export class ExplainabilityEngine {
    public async explainRecommendation(
        recommendationId: string,
        userId = "user_default"
    ): Promise<ExplanationDetails> {
        const intel = await executiveIntelligenceEngine.getExecutiveIntelligence(userId);
        const ctx = intel.snapshot.businessContext;

        const targetRec = intel.recommendations.find((r) => r.id === recommendationId) || intel.recommendations[0];
        const targetRisk = intel.topRisk;
        const targetOpp = intel.topOpportunity;

        const evidence: Array<{ type: "timeline" | "relationship" | "decision" | "calendar" | "invoice"; description: string }> = [];

        // Build supporting evidence from context
        if (ctx.tasks && ctx.tasks.length > 0) {
            const overdue = ctx.tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < Date.now() && t.status.toLowerCase() !== "completed");
            if (overdue.length > 0) {
                evidence.push({
                    type: "timeline",
                    description: `${overdue.length} overdue task(s) detected (${overdue[0].title} due ${overdue[0].dueDate})`,
                });
            }
        }

        if (ctx.invoices && ctx.invoices.length > 0) {
            const unpaid = ctx.invoices.filter((i) => i.status.toLowerCase() === "unpaid" || i.status.toLowerCase() === "past_due" || i.status.toLowerCase() === "overdue");
            if (unpaid.length > 0) {
                evidence.push({
                    type: "invoice",
                    description: `Past-due invoice collection outstanding for ${unpaid[0].client} ($${unpaid[0].amount})`,
                });
            }
        }

        if (ctx.relationships && ctx.relationships.people.length > 0) {
            const topPerson = ctx.relationships.people[0];
            evidence.push({
                type: "relationship",
                description: `${topPerson.name} (${topPerson.relationshipType}) score: ${topPerson.score || 75}/100 with last interaction ${topPerson.lastInteractionDaysAgo || 30}d ago`,
            });
        }

        if (ctx.decisions && ctx.decisions.length > 0) {
            evidence.push({
                type: "decision",
                description: `Strategic decision "${ctx.decisions[0].title}" in active business context`,
            });
        }

        const why: string[] = [];
        if (targetRec) {
            why.push(targetRec.whyItMatters);
            why.push(`Identified from ${targetRec.category} category optimization`);
        }
        if (targetRisk) {
            why.push(`Detected risk: ${targetRisk.title} (${targetRisk.severity} severity)`);
        }
        if (targetOpp) {
            why.push(`Capitalizes on opportunity: ${targetOpp.title} (${targetOpp.potentialValue})`);
        }

        const confidenceEval = confidenceModel.evaluateConfidence(evidence.length, false, targetRec?.confidence || 0.88);

        return {
            id: recommendationId,
            recommendation: targetRec ? targetRec.recommendation : "Execute priority business action",
            why,
            supportingEvidence: evidence,
            confidence: confidenceEval,
            expectedImpact: targetRec ? targetRec.expectedOutcome : "Preserves operational momentum & accelerates growth",
            relatedContext: {
                projects: (ctx.projects || []).slice(0, 2).map((p) => ({ id: p.id, title: p.title })),
                relationships: (ctx.relationships?.people || []).slice(0, 2).map((p) => ({ id: p.id, name: p.name, type: p.relationshipType })),
                decisions: (ctx.decisions || []).slice(0, 2).map((d) => ({ id: d.id, title: d.title })),
            },
        };
    }
}

export const explainabilityEngine = new ExplainabilityEngine();
