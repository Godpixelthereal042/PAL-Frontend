/**
 * Base Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import type { AgentRole, AgentContext, AgentResponse } from "./types.ts";

export abstract class BaseAgent {
    public abstract readonly role: AgentRole;
    public abstract readonly name: string;
    public abstract readonly description: string;
    public abstract readonly capabilities: string[];
    public abstract readonly priority: number;

    public abstract analyze(context: AgentContext): Promise<AgentResponse>;
}
