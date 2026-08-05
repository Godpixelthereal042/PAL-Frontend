/**
 * COO Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "../baseAgent.ts";
import type { AgentRole, AgentContext, AgentResponse, AgentFinding } from "../types.ts";

export class COOAgent extends BaseAgent {
    public readonly role: AgentRole = "coo";
    public readonly name = "COO Agent";
    public readonly description = "Monitors overall business health, prioritizes executive work, and escalates critical risks.";
    public readonly capabilities = ["business_health_monitoring", "risk_escalation", "priority_synthesis"];
    public readonly priority = 100;

    public async analyze(context: AgentContext): Promise<AgentResponse> {
        const intel = context.intelligence;
        const findings: AgentFinding[] = [];

        if (intel.topRisk) {
            findings.push({
                id: `coo_${intel.topRisk.id}`,
                category: intel.topRisk.category,
                severity: intel.topRisk.severity,
                title: `Escalated Risk: ${intel.topRisk.title}`,
                detail: intel.topRisk.description,
                recommendation: intel.topRisk.recommendedAction,
                confidence: intel.topRisk.confidence,
                actionUrl: "/chat",
            });
        }

        return {
            agentRole: this.role,
            agentName: this.name,
            focus: "Executive Health & Priority Escalation",
            findings,
            confidence: intel.topRisk ? intel.topRisk.confidence : 0.90,
        };
    }
}
