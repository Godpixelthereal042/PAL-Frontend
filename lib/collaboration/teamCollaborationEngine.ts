/**
 * Enterprise Team Collaboration & Role RBAC Engine (PAL-TDD-006, Sprint 13)
 *
 * Supports multi-user team collaboration across Founder, Finance Lead, Ops Lead,
 * and Sales Lead roles with shared decision comments and @mentions.
 */

export type EnterpriseRole = "founder" | "finance_lead" | "ops_lead" | "sales_lead" | "member";

export interface DecisionComment {
    commentId: string;
    decisionId: string;
    authorUserId: string;
    authorName: string;
    role: EnterpriseRole;
    text: string;
    mentions: string[];
    timestamp: number;
}

export class TeamCollaborationEngine {
    private static instance: TeamCollaborationEngine;
    private comments: Map<string, DecisionComment[]> = new Map(); // key: decisionId

    public static getInstance(): TeamCollaborationEngine {
        if (!TeamCollaborationEngine.instance) {
            TeamCollaborationEngine.instance = new TeamCollaborationEngine();
        }
        return TeamCollaborationEngine.instance;
    }

    public addComment(params: {
        decisionId: string;
        authorUserId: string;
        authorName: string;
        role: EnterpriseRole;
        text: string;
        mentions?: string[];
    }): DecisionComment {
        const list = this.comments.get(params.decisionId) || [];
        const comment: DecisionComment = {
            commentId: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            decisionId: params.decisionId,
            authorUserId: params.authorUserId,
            authorName: params.authorName,
            role: params.role,
            text: params.text,
            mentions: params.mentions || [],
            timestamp: Date.now()
        };

        list.push(comment);
        this.comments.set(params.decisionId, list);
        return comment;
    }

    public getComments(decisionId: string): DecisionComment[] {
        return this.comments.get(decisionId) || [];
    }

    public checkRoleCapability(role: EnterpriseRole, capability: string): boolean {
        const permissions: Record<EnterpriseRole, string[]> = {
            founder: ["manage_all", "approve_spend", "edit_memory", "invite_team"],
            finance_lead: ["view_financials", "approve_spend_finance", "audit_saas"],
            ops_lead: ["manage_workflows", "view_bottlenecks", "execute_tasks"],
            sales_lead: ["view_pipeline", "crm_outreach", "view_growth"],
            member: ["view_dashboard", "run_strategy"]
        };

        const granted = permissions[role] || [];
        return granted.includes("manage_all") || granted.includes(capability);
    }
}
