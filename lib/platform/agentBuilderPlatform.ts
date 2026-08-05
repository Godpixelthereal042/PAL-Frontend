/**
 * PAL Agent Builder Platform (PAL-TDD-014, Sprint 27 Milestone 5)
 *
 * Low-code platform enabling enterprises & partners to create custom AI worker agents,
 * configure permissions, execute testing sandboxes, and publish to the Enterprise Marketplace.
 *
 * Architecture: PAL-ARCH-DOC-083
 */

export type PublishingStatus = "DRAFT" | "TESTING_SANDBOX" | "PUBLISHED_MARKETPLACE";

export interface AgentDefinition {
    agentId: string;
    agentName: string;
    domainRole: string;
    permissions: string[];
    isSandboxed: boolean;
    publishingStatus: PublishingStatus;
    createdAt: number;
    publishedAt?: number;
}

export class AgentBuilderPlatform {
    private static instance: AgentBuilderPlatform;
    private agents: Map<string, AgentDefinition> = new Map();

    public static getInstance(): AgentBuilderPlatform {
        if (!AgentBuilderPlatform.instance) {
            AgentBuilderPlatform.instance = new AgentBuilderPlatform();
        }
        return AgentBuilderPlatform.instance;
    }

    public createCustomAgent(agentName: string, domainRole: string, permissions: string[]): AgentDefinition {
        const timestamp = Date.now();
        const agentId = `ag_builder_${timestamp}`;

        const agent: AgentDefinition = {
            agentId,
            agentName,
            domainRole,
            permissions,
            isSandboxed: true,
            publishingStatus: "DRAFT",
            createdAt: timestamp
        };

        this.agents.set(agentId, agent);
        return agent;
    }

    public testInSandbox(agentId: string): AgentDefinition {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error(`Agent definition '${agentId}' not found.`);

        agent.publishingStatus = "TESTING_SANDBOX";
        agent.isSandboxed = true;
        this.agents.set(agentId, agent);
        return agent;
    }

    public publishToMarketplace(agentId: string): AgentDefinition {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error(`Agent definition '${agentId}' not found.`);

        const timestamp = Date.now();
        agent.publishingStatus = "PUBLISHED_MARKETPLACE";
        agent.isSandboxed = false;
        agent.publishedAt = timestamp;
        this.agents.set(agentId, agent);
        return agent;
    }
}
