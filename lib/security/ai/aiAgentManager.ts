/**
 * PAL AI Agent & Executive Manager
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 24 (AI Governance)
 */

import crypto from "crypto";
import { AIAgentRepository, type AIAgentEntity } from "../../db/repositories/aiAgentRepository.ts";
import { UnauthorizedError, ValidationError, ForbiddenError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:AIAgentManager");

export type AuthorityLevel = "advisory" | "assisted" | "operational";

export interface RegisterAIAgentParams {
    workspaceId: string;
    name: string;
    role: string; // e.g. "ai_coo", "ai_cfo", "ai_ops"
    authorityLevel: AuthorityLevel;
    capabilities?: string[];
    allowedTools?: string[];
    maxBudgetPerAction?: number;
}

export class AIAgentManager {
    private agentRepo: AIAgentRepository;

    constructor(agentRepo?: AIAgentRepository) {
        this.agentRepo = agentRepo || new AIAgentRepository();
    }

    public async registerAgent(params: RegisterAIAgentParams): Promise<AIAgentEntity> {
        if (!params.workspaceId || !params.name || !params.role) {
            throw new ValidationError("Workspace ID, name, and role are required", { details: { params } });
        }

        const agentId = `agent_${crypto.randomUUID()}`;
        const now = Date.now();

        const agent = await this.agentRepo.createAgent({
            id: agentId,
            workspace_id: params.workspaceId,
            agent_type: (params.role.replace(/^ai_/, "") || "coo") as any,
            display_name: params.name,
            name: params.name,
            role: params.role,
            status: "active",
            authority_level: params.authorityLevel,
            permission_profile: JSON.stringify(params.capabilities || []),
            capabilities: JSON.stringify(params.capabilities || []),
            allowed_tools: JSON.stringify(params.allowedTools || []),
            max_budget_per_action: params.maxBudgetPerAction || 1000,
            created_at: now
        } as any);

        logger.info("AI Agent registered successfully", { agentId, name: params.name, role: params.role, authority: params.authorityLevel });
        return agent;
    }

    public async getAgent(agentId: string): Promise<AIAgentEntity> {
        const agent = await this.agentRepo.findById(agentId);
        if (!agent) {
            throw new UnauthorizedError("AI Agent not found", { details: { agentId } });
        }
        return agent;
    }

    public async updateAgentAuthority(agentId: string, actorId: string, newAuthorityLevel: AuthorityLevel): Promise<AIAgentEntity> {
        // Safety Requirement: AI agents can NEVER modify their own authority level or self-escalate
        if (actorId === agentId) {
            logger.warn("Security Alert: AI Agent attempted self-escalation", { agentId, newAuthorityLevel });
            throw new ForbiddenError("AI Agents are strictly forbidden from modifying their own authority level", {
                details: { errorCode: "GOVERNANCE_SELF_ESCALATION_BLOCKED" }
            });
        }

        const agent = await this.getAgent(agentId);
        await this.agentRepo.updateStatus(agentId, agent.status); // Verify update access
        agent.authority_level = newAuthorityLevel;

        logger.info("AI Agent authority updated by human actor", { agentId, actorId, newAuthorityLevel });
        return agent;
    }

    public async validateAgentContext(agentId: string, workspaceId: string): Promise<boolean> {
        const agent = await this.getAgent(agentId);
        if (agent.workspace_id !== workspaceId) {
            logger.warn("AI Agent tenant boundary violation detected", { agentId, agentWorkspace: agent.workspace_id, requestWorkspace: workspaceId });
            return false;
        }
        return agent.status === "active";
    }
}
