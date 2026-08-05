/**
 * PAL AI Agent Repository
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import { BaseRepository } from "../baseRepository.ts";
import { InternalServerError } from "../../core/errors.ts";

export interface AIAgentEntity {
    id: string;
    workspace_id: string;
    agent_type: "coo" | "cfo" | "ops" | "sales" | "marketing" | "legal" | "hr";
    display_name: string;
    name?: string;
    role?: string;
    status: "active" | "disabled" | "suspended";
    authority_level?: "advisory" | "assisted" | "operational";
    permission_profile: string; // JSON serialized string of permission scopes
    capabilities?: string;
    allowed_tools?: string;
    max_budget_per_action?: number;
    created_at: number;
}

export class AIAgentRepository extends BaseRepository<AIAgentEntity> {
    constructor() {
        super("ai_agents");
    }

    public async findByWorkspace(workspaceId: string): Promise<AIAgentEntity[]> {
        return this.findAll("workspace_id = ?", [workspaceId]);
    }

    public async findByAgentType(workspaceId: string, agentType: string): Promise<AIAgentEntity | null> {
        try {
            const db = await this.db();
            const row = await db.get(`SELECT * FROM ${this.tableName} WHERE workspace_id = ? AND agent_type = ?`, [
                workspaceId,
                agentType
            ]);
            return row ? (row as AIAgentEntity) : null;
        } catch (err: any) {
            this.logger.error("Failed to findByAgentType", { workspaceId, agentType }, err);
            throw new InternalServerError("Database query error on ai_agents", { details: { message: err.message } });
        }
    }

    public async createAgent(agent: AIAgentEntity): Promise<AIAgentEntity> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO ${this.tableName} (id, workspace_id, agent_type, display_name, status, permission_profile, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    agent.id,
                    agent.workspace_id,
                    agent.agent_type,
                    agent.display_name,
                    agent.status,
                    agent.permission_profile,
                    agent.created_at
                ]
            );
            return agent;
        } catch (err: any) {
            this.logger.error("Failed to createAgent", { agentId: agent.id }, err);
            throw new InternalServerError("Database insert error on ai_agents", { details: { message: err.message } });
        }
    }

    public async updatePermissionProfile(agentId: string, permissionProfile: string): Promise<boolean> {
        try {
            const db = await this.db();
            const res = await db.run(`UPDATE ${this.tableName} SET permission_profile = ? WHERE id = ?`, [
                permissionProfile,
                agentId
            ]);
            return (res.changes || 0) > 0;
        } catch (err: any) {
            this.logger.error("Failed to updatePermissionProfile", { agentId }, err);
            throw new InternalServerError("Database update error on ai_agents", { details: { message: err.message } });
        }
    }

    public async updateStatus(agentId: string, status: string): Promise<boolean> {
        try {
            const db = await this.db();
            const res = await db.run(`UPDATE ${this.tableName} SET status = ? WHERE id = ?`, [status, agentId]);
            return (res.changes || 0) > 0;
        } catch (err: any) {
            this.logger.error("Failed to updateStatus", { agentId }, err);
            throw new InternalServerError("Database update error on ai_agents", { details: { message: err.message } });
        }
    }
}
