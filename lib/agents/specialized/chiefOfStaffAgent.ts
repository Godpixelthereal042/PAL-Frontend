/**
 * Chief of Staff Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "../baseAgent.ts";
import type { AgentRole, AgentContext, AgentResponse, AgentFinding } from "../types.ts";

export class ChiefOfStaffAgent extends BaseAgent {
    public readonly role: AgentRole = "chief_of_staff";
    public readonly name = "Chief of Staff Agent";
    public readonly description = "Prepares daily briefs, tracks commitments, follows up on decisions, and monitors execution progress.";
    public readonly capabilities = ["brief_preparation", "commitment_tracking", "decision_followup"];
    public readonly priority = 90;

    public async analyze(context: AgentContext): Promise<AgentResponse> {
        const ctx = context.snapshot.businessContext;
        const findings: AgentFinding[] = [];

        const pendingDecisions = (ctx.decisions || []).filter((d) => d.status.toLowerCase() === "pending_confirmation");
        if (pendingDecisions.length > 0) {
            findings.push({
                id: `cos_decisions_${Date.now()}`,
                category: "decision",
                severity: "medium",
                title: `${pendingDecisions.length} Decision(s) Pending Founder Sign-off`,
                detail: `Decision "${pendingDecisions[0].title}" requires explicit confirmation.`,
                recommendation: "Review Decision Log and confirm or reject pending decisions.",
                confidence: 0.88,
                actionUrl: "/decisions",
            });
        }

        return {
            agentRole: this.role,
            agentName: this.name,
            focus: "Executive Commitments & Decision Follow-ups",
            findings,
            confidence: 0.88,
        };
    }
}
