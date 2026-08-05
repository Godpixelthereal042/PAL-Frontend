/**
 * Sales & Growth Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "../baseAgent.ts";
import type { AgentRole, AgentContext, AgentResponse, AgentFinding } from "../types.ts";

export class SalesGrowthAgent extends BaseAgent {
    public readonly role: AgentRole = "sales_growth";
    public readonly name = "Sales & Growth Agent";
    public readonly description = "Monitors customer relationships, identifies expansion opportunities, tracks investor engagement, and recommends outreach.";
    public readonly capabilities = ["relationship_monitoring", "investor_tracking", "client_expansion"];
    public readonly priority = 85;

    public async analyze(context: AgentContext): Promise<AgentResponse> {
        const intel = context.intelligence;
        const findings: AgentFinding[] = [];

        if (intel.topOpportunity && (intel.topOpportunity.category === "investor" || intel.topOpportunity.category === "client")) {
            findings.push({
                id: `sales_${intel.topOpportunity.id}`,
                category: intel.topOpportunity.category,
                severity: "high",
                title: `Growth Opportunity: ${intel.topOpportunity.title}`,
                detail: intel.topOpportunity.reason,
                recommendation: intel.topOpportunity.suggestedNextAction,
                confidence: intel.topOpportunity.confidence,
                actionUrl: "/relationships",
            });
        }

        return {
            agentRole: this.role,
            agentName: this.name,
            focus: "Stakeholder Relationships & Revenue Expansion",
            findings,
            confidence: 0.90,
        };
    }
}
