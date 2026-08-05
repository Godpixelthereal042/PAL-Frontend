/**
 * Executive AI Agent Council Expansion (PAL-TDD-006, Sprint 14)
 *
 * Dedicated domain agents (CEO, CFO, COO, CRO) providing specialized reasoning context,
 * recommendation generation, and integration with AgentAutonomyEngine approval boundaries.
 */

import { AgentAutonomyEngine, type AutonomyLevel } from "../autonomy/agentAutonomyEngine.ts";

export type ExecutiveAgentRole = "ceo" | "cfo" | "coo" | "cro";

export interface ExecutiveAgentProposal {
    agentRole: ExecutiveAgentRole;
    agentName: string;
    title: string;
    proposalPayload: Record<string, any>;
    reasoningContext: string;
    estimatedCostUSD: number;
    autonomyLevelRequired: AutonomyLevel;
    requiresHumanSignoff: boolean;
}

export class ExecutiveAgentCouncil {
    private static instance: ExecutiveAgentCouncil;
    private autonomyEngine = AgentAutonomyEngine.getInstance();

    public static getInstance(): ExecutiveAgentCouncil {
        if (!ExecutiveAgentCouncil.instance) {
            ExecutiveAgentCouncil.instance = new ExecutiveAgentCouncil();
        }
        return ExecutiveAgentCouncil.instance;
    }

    public generateDomainProposals(workspaceId: string): ExecutiveAgentProposal[] {
        const autonomyConfigs = this.autonomyEngine.getAutonomyConfigs(workspaceId);

        const proposals: ExecutiveAgentProposal[] = [
            {
                agentRole: "ceo",
                agentName: "Chief Executive Agent",
                title: "Scale Pro Tier Upgrade Outreach",
                proposalPayload: { targetCohort: "active_founders", offer: "50% lifetime discount" },
                reasoningContext: "Aligns with 90-day goal to increase MRR by 20%. Historical correlation indicates 3x conversion from direct founder outreach.",
                estimatedCostUSD: 0,
                autonomyLevelRequired: 3,
                requiresHumanSignoff: false
            },
            {
                agentRole: "cfo",
                agentName: "Chief Financial Agent",
                title: "Cancel Unutilized Server Monitoring Subscription",
                proposalPayload: { vendor: "Datadog Stub", monthlySavingsUSD: 1200 },
                reasoningContext: "Server monitoring usage shows 0 queries in last 60 days. Canceling extends cash runway to 18.5 months.",
                estimatedCostUSD: 0,
                autonomyLevelRequired: 2,
                requiresHumanSignoff: true
            },
            {
                agentRole: "coo",
                agentName: "Chief Operating Agent",
                title: "Automate Level 3 Operator Approval Threshold",
                proposalPayload: { domain: "marketing", newThresholdUSD: 2500 },
                reasoningContext: "Spend approvals under $2,500 have a 100% historical approval rate. Automating reduces operational review latency by 48 hours.",
                estimatedCostUSD: 0,
                autonomyLevelRequired: 4,
                requiresHumanSignoff: false
            },
            {
                agentRole: "cro",
                agentName: "Chief Revenue Agent",
                title: "Re-engage 4 High-Value Inactive Trial Accounts",
                proposalPayload: { targetUsers: ["usr_trial_01", "usr_trial_02"] },
                reasoningContext: "Accounts have high usage history but no login for > 45 days. High conversion probability if re-engaged immediately.",
                estimatedCostUSD: 500,
                autonomyLevelRequired: 3,
                requiresHumanSignoff: false
            }
        ];

        // Enrich proposals with current workspace autonomy policy settings
        return proposals.map(prop => {
            const config = autonomyConfigs.find(c => c.domain === (prop.agentRole === "cro" ? "sales" : prop.agentRole));
            if (config) {
                return {
                    ...prop,
                    requiresHumanSignoff: config.requiresHumanApproval || prop.estimatedCostUSD > config.maxAutoSpendLimitUSD
                };
            }
            return prop;
        });
    }
}
