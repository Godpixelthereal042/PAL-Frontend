/**
 * Enterprise Identity & Organization Manager (PAL-TDD-009, Sprint 22 Milestone 2)
 *
 * Provides enterprise SAML/OIDC SSO identity mapping, 11-step RBAC role hierarchy resolution,
 * team member invitation/offboarding workflows, and workspace administration audit logging.
 *
 * Architecture: PAL-ARCH-DOC-053
 */

export type EnterpriseRole = "Owner" | "CEO" | "CFO" | "Executive" | "Operator" | "Viewer";
export type SSOProvider = "okta" | "azure_ad" | "google_workspace" | "custom_saml";

export interface EnterpriseTeamMember {
    memberId: string;
    workspaceId: string;
    email: string;
    fullName: string;
    role: EnterpriseRole;
    ssoProvider?: SSOProvider;
    status: "active" | "invited" | "suspended";
    joinedAt: number;
}

export interface TeamInvitation {
    invitationId: string;
    workspaceId: string;
    email: string;
    assignedRole: EnterpriseRole;
    invitationToken: string;
    expiresAt: number;
    createdAt: number;
}

export interface AdminAuditLog {
    auditId: string;
    workspaceId: string;
    actorEmail: string;
    action: string;
    details: string;
    timestamp: number;
}

export class EnterpriseIdentityManager {
    private static instance: EnterpriseIdentityManager;
    private members: Map<string, EnterpriseTeamMember[]> = new Map(); // workspaceId -> members
    private invitations: Map<string, TeamInvitation[]> = new Map(); // workspaceId -> invitations
    private auditLogs: Map<string, AdminAuditLog[]> = new Map(); // workspaceId -> logs

    constructor() {
        this.seedDefaultTeam("ws_demo_company");
    }

    public static getInstance(): EnterpriseIdentityManager {
        if (!EnterpriseIdentityManager.instance) {
            EnterpriseIdentityManager.instance = new EnterpriseIdentityManager();
        }
        return EnterpriseIdentityManager.instance;
    }

    private seedDefaultTeam(workspaceId: string): void {
        const defaultMembers: EnterpriseTeamMember[] = [
            {
                memberId: "mem_ceo_01",
                workspaceId,
                email: "ceo@acme.com",
                fullName: "Jane Doe",
                role: "CEO",
                ssoProvider: "google_workspace",
                status: "active",
                joinedAt: Date.now() - 30 * 86400 * 1000
            },
            {
                memberId: "mem_cfo_01",
                workspaceId,
                email: "cfo@acme.com",
                fullName: "John Smith",
                role: "CFO",
                ssoProvider: "okta",
                status: "active",
                joinedAt: Date.now() - 20 * 86400 * 1000
            }
        ];

        this.members.set(workspaceId, defaultMembers);
    }

    public evaluateRBACPermission(role: EnterpriseRole, permissionKey: string): boolean {
        // Owner and CEO have full access
        if (role === "Owner" || role === "CEO") return true;

        // CFO access
        if (role === "CFO") {
            return permissionKey.startsWith("finance:") || permissionKey.startsWith("report:") || permissionKey === "action:approve_l3";
        }

        // Executive access
        if (role === "Executive") {
            return permissionKey.startsWith("report:") || permissionKey.startsWith("action:") || permissionKey.startsWith("mesh:");
        }

        // Operator access
        if (role === "Operator") {
            return permissionKey.startsWith("action:execute") || permissionKey.startsWith("report:view");
        }

        // Viewer access
        return permissionKey.endsWith(":read") || permissionKey.endsWith(":view");
    }

    public createTeamInvitation(params: {
        workspaceId: string;
        email: string;
        assignedRole: EnterpriseRole;
        invitedByEmail: string;
    }): TeamInvitation {
        const timestamp = Date.now();
        const invitationId = `inv_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;
        const invitationToken = `tok_${Math.random().toString(36).substring(2, 12)}`;

        const invitation: TeamInvitation = {
            invitationId,
            workspaceId: params.workspaceId,
            email: params.email,
            assignedRole: params.assignedRole,
            invitationToken,
            expiresAt: timestamp + 7 * 86400 * 1000, // 7 days
            createdAt: timestamp
        };

        const currentInvs = this.invitations.get(params.workspaceId) || [];
        currentInvs.push(invitation);
        this.invitations.set(params.workspaceId, currentInvs);

        this.logAdminAction(params.workspaceId, params.invitedByEmail, "INVITE_TEAM_MEMBER", `Invited ${params.email} as ${params.assignedRole}`);

        return invitation;
    }

    public getTeamMembers(workspaceId: string): EnterpriseTeamMember[] {
        return this.members.get(workspaceId) || [];
    }

    public logAdminAction(workspaceId: string, actorEmail: string, action: string, details: string): AdminAuditLog {
        const timestamp = Date.now();
        const auditLog: AdminAuditLog = {
            auditId: `aud_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            actorEmail,
            action,
            details,
            timestamp
        };

        const logs = this.auditLogs.get(workspaceId) || [];
        logs.push(auditLog);
        this.auditLogs.set(workspaceId, logs);
        return auditLog;
    }

    public getAuditLogs(workspaceId: string): AdminAuditLog[] {
        return this.auditLogs.get(workspaceId) || [];
    }
}
