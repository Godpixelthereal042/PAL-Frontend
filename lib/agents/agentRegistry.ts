/**
 * Central Executive Agent Registry
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "./baseAgent.ts";
import type { AgentRole } from "./types.ts";

export class AgentRegistry {
    private agents: Map<AgentRole, BaseAgent> = new Map();

    public register(agent: BaseAgent): void {
        this.agents.set(agent.role, agent);
    }

    public get(role: AgentRole): BaseAgent | undefined {
        return this.agents.get(role);
    }

    public listAgents(): BaseAgent[] {
        return Array.from(this.agents.values()).sort((a, b) => b.priority - a.priority);
    }

    public has(role: AgentRole): boolean {
        return this.agents.has(role);
    }
}

export const globalAgentRegistry = new AgentRegistry();
