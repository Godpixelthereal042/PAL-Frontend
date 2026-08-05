/**
 * Opportunity Intelligence Engine
 *
 * PAL Milestone 7A — Executive Intelligence Engine
 */

import type { OpportunityInsight } from "./types.ts";
import type { BusinessContext } from "../contextEngine.ts";

export class OpportunityIntelligenceEngine {
    public analyzeOpportunities(ctx: BusinessContext): OpportunityInsight[] {
        const opportunities: OpportunityInsight[] = [];
        const now = Date.now();

        // 1. Investor Engagement & Funding Momentum Opportunity
        const people = ctx.relationships?.people || [];
        const investors = people.filter((p) => (p.relationshipType || "").toLowerCase() === "investor");
        const strongInvestor = investors.find((inv) => (inv.score || 0) >= 75);

        if (strongInvestor) {
            opportunities.push({
                id: `opp_investor_${now}`,
                title: `Investor Momentum Opportunity: ${strongInvestor.name}`,
                reason: `${strongInvestor.name} has a strong relationship score (${strongInvestor.score}/100) with recent positive touchpoints.`,
                potentialValue: "Unlocks next funding round / strategic advisor access",
                confidence: 0.90,
                suggestedNextAction: `Send pro-active Q3 progress update and term sheet deck to ${strongInvestor.name}.`,
                category: "investor",
            });
        }

        // 2. High-Value Client Retention / Upsell Opportunity
        const clients = people.filter((p) => (p.relationshipType || "").toLowerCase() === "client");
        const healthyClients = clients.filter((c) => (c.score || 0) >= 80);

        if (healthyClients.length > 0) {
            const topClient = healthyClients[0];
            opportunities.push({
                id: `opp_client_${now}`,
                title: `Client Strategic Expansion: ${topClient.name}`,
                reason: `High relationship satisfaction (${topClient.score}/100) makes ${topClient.name} an ideal candidate for contract renewal or expansion.`,
                potentialValue: "+25% account contract expansion revenue",
                confidence: 0.85,
                suggestedNextAction: `Schedule a quarterly strategic review with ${topClient.name}.`,
                category: "client",
            });
        }

        // 3. Workflow Automation Opportunity
        const completedTasks = (ctx.tasks || []).filter((t) => t.status === "completed");
        if (completedTasks.length >= 3) {
            opportunities.push({
                id: `opp_automation_${now}`,
                title: "Process Automation Candidate Detected",
                reason: "Multiple recurring task patterns completed manually over recent cycles.",
                potentialValue: "Saves 3.5 founder hours weekly via deterministic workflow automation",
                confidence: 0.88,
                suggestedNextAction: "Convert recurring invoice follow-up and briefing tasks into an automated workflow.",
                category: "automation",
            });
        }

        // 4. Project Acceleration Opportunity
        const projects = ctx.projects || [];
        const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in_progress");
        if (activeProjects.length > 0) {
            const leadProject = activeProjects[0];
            opportunities.push({
                id: `opp_project_${now}`,
                title: `Project Acceleration: ${leadProject.title}`,
                reason: `Milestone execution is proceeding on track with high completion velocity.`,
                potentialValue: "Early product launch capability ahead of scheduled deadline",
                confidence: 0.92,
                suggestedNextAction: "Allocate focused deep work window to lock in early completion.",
                category: "growth",
            });
        }

        return opportunities.sort((a, b) => b.confidence - a.confidence);
    }
}

export const opportunityEngine = new OpportunityIntelligenceEngine();
