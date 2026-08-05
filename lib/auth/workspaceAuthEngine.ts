/**
 * Workspace Authentication & Role Management Engine (PAL-TDD-006, Sprint 8 Milestone 4)
 *
 * Manages user workspaces, invitations, role-based access control (Owner, Admin, Member),
 * and connects user sessions to PostgreSQL RLS workspace isolation.
 */

export type WorkspaceUserRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMember {
    userId: string;
    email: string;
    name: string;
    role: WorkspaceUserRole;
    joinedAt: number;
}

export interface WorkspaceProfile {
    id: string;
    name: string;
    slug: string;
    ownerUserId: string;
    industry?: string;
    targetRevenueGoalUSD?: number;
    members: WorkspaceMember[];
    createdAt: number;
}

export class WorkspaceAuthEngine {
    private static instance: WorkspaceAuthEngine;
    private workspaces: Map<string, WorkspaceProfile> = new Map();

    constructor() {
        // Initialize default seed demo workspace
        this.createWorkspace({
            id: "ws_demo_company",
            name: "Acme SaaS Technologies",
            ownerUserId: "usr_founder_01",
            ownerEmail: "founder@acmesaas.com",
            ownerName: "Alex Founder",
            industry: "B2B SaaS",
            targetRevenueGoalUSD: 1000000
        });
    }

    public static getInstance(): WorkspaceAuthEngine {
        if (!WorkspaceAuthEngine.instance) {
            WorkspaceAuthEngine.instance = new WorkspaceAuthEngine();
        }
        return WorkspaceAuthEngine.instance;
    }

    public createWorkspace(params: {
        id?: string;
        name: string;
        ownerUserId: string;
        ownerEmail: string;
        ownerName: string;
        industry?: string;
        targetRevenueGoalUSD?: number;
    }): WorkspaceProfile {
        const workspaceId = params.id || `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const profile: WorkspaceProfile = {
            id: workspaceId,
            name: params.name,
            slug,
            ownerUserId: params.ownerUserId,
            industry: params.industry || "Technology",
            targetRevenueGoalUSD: params.targetRevenueGoalUSD || 500000,
            members: [
                {
                    userId: params.ownerUserId,
                    email: params.ownerEmail,
                    name: params.ownerName,
                    role: "owner",
                    joinedAt: Date.now()
                }
            ],
            createdAt: Date.now()
        };

        this.workspaces.set(workspaceId, profile);
        return profile;
    }

    public getWorkspace(workspaceId: string): WorkspaceProfile | undefined {
        return this.workspaces.get(workspaceId);
    }

    public addMember(workspaceId: string, member: { userId: string; email: string; name: string; role: WorkspaceUserRole }): boolean {
        const ws = this.workspaces.get(workspaceId);
        if (!ws) return false;

        // Prevent duplicate addition
        if (ws.members.some(m => m.userId === member.userId || m.email === member.email)) {
            return false;
        }

        ws.members.push({ ...member, joinedAt: Date.now() });
        return true;
    }

    public checkPermission(workspaceId: string, userId: string, requiredRole: WorkspaceUserRole): boolean {
        const ws = this.workspaces.get(workspaceId);
        if (!ws) return false;

        const member = ws.members.find(m => m.userId === userId);
        if (!member) return false;

        const roleHierarchy: Record<WorkspaceUserRole, number> = {
            owner: 4,
            admin: 3,
            member: 2,
            viewer: 1
        };

        return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
    }

    public getUserWorkspaces(userId: string): WorkspaceProfile[] {
        return Array.from(this.workspaces.values()).filter(ws =>
            ws.members.some(m => m.userId === userId)
        );
    }
}
