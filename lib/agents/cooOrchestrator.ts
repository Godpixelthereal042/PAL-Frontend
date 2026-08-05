/**
 * AI COO Orchestrator
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { globalAgentRegistry, AgentRegistry } from "./agentRegistry.ts";
import { COOAgent } from "./specialized/cooAgent.ts";
import { ChiefOfStaffAgent } from "./specialized/chiefOfStaffAgent.ts";
import { OperationsAgent } from "./specialized/operationsAgent.ts";
import { SalesGrowthAgent } from "./specialized/salesGrowthAgent.ts";
import { FinanceAgent } from "./specialized/financeAgent.ts";
import { ProjectAgent } from "./specialized/projectAgent.ts";
import { executiveIntelligenceEngine } from "../intelligence/intelligenceEngine.ts";
import type { AgentRole, AgentContext, AgentResponse, OrchestrationResult } from "./types.ts";

// Register default specialized agents
globalAgentRegistry.register(new COOAgent());
globalAgentRegistry.register(new ChiefOfStaffAgent());
globalAgentRegistry.register(new OperationsAgent());
globalAgentRegistry.register(new SalesGrowthAgent());
globalAgentRegistry.register(new FinanceAgent());
globalAgentRegistry.register(new ProjectAgent());

export class COOOrchestrator {
    private registry: AgentRegistry;

    constructor(registry: AgentRegistry = globalAgentRegistry) {
        this.registry = registry;
    }

    public async orchestrate(
        userId = "user_default",
        prompt?: string,
        options: { roles?: AgentRole[]; forceRefresh?: boolean } = {}
    ): Promise<OrchestrationResult> {
        const now = Date.now();

        // 1. Single Shared Memory Fetch (prevents duplicate queries)
        const intel = await executiveIntelligenceEngine.getExecutiveIntelligence(userId, { forceRefresh: options.forceRefresh });

        const agentContext: AgentContext = {
            userId,
            snapshot: intel.snapshot,
            intelligence: intel,
        };

        // 2. Select Relevant Agents
        const targetRoles = options.roles || this.selectAgentsForPrompt(prompt);
        const activeAgents = targetRoles
            .map((role) => this.registry.get(role))
            .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined);

        // 3. Parallel Execution across selected agents
        const responses: AgentResponse[] = await Promise.all(
            activeAgents.map((agent) =>
                agent.analyze(agentContext).catch((err) => {
                    console.error(`Agent ${agent.name} execution error:`, err);
                    return {
                        agentRole: agent.role,
                        agentName: agent.name,
                        focus: "Error fallback",
                        findings: [],
                        confidence: 0.5,
                    };
                })
            )
        );

        // 4. Synthesize & Deduplicate Findings
        const allFindings = responses.flatMap((r) => r.findings);
        const primaryRec = intel.recommendations.length > 0
            ? intel.recommendations[0].recommendation
            : "Review Executive Dashboard priorities & proceed with milestone execution";

        const whyItMatters = intel.recommendations.length > 0
            ? intel.recommendations[0].whyItMatters
            : "Preserves operational momentum across active business context";

        const totalConf = responses.reduce((sum, r) => sum + r.confidence, 0);
        const unifiedConfidence = responses.length > 0 ? Math.round((totalConf / responses.length) * 100) / 100 : 0.90;

        const summaryParts = responses
            .filter((r) => r.findings.length > 0)
            .map((r) => `[${r.agentName}]: ${r.findings[0].title}`);

        const synthesizedSummary = summaryParts.length > 0
            ? summaryParts.join(" | ")
            : "All specialized executive agents report healthy operational status.";

        return {
            timestamp: now,
            primaryRecommendation: primaryRec,
            whyItMatters,
            synthesizedSummary,
            unifiedConfidence,
            participatingAgents: activeAgents.map((a) => a.role),
            agentResponses: responses,
        };
    }

    private selectAgentsForPrompt(prompt?: string): AgentRole[] {
        if (!prompt) {
            return ["coo", "chief_of_staff", "operations", "sales_growth", "finance", "project"];
        }

        const text = prompt.toLowerCase();
        const roles: Set<AgentRole> = new Set(["coo"]); // COO is always included

        if (text.includes("launch") || text.includes("delay") || text.includes("schedule") || text.includes("project")) {
            roles.add("project");
            roles.add("finance");
            roles.add("sales_growth");
        }
        if (text.includes("invoice") || text.includes("money") || text.includes("cash") || text.includes("cost") || text.includes("revenue")) {
            roles.add("finance");
        }
        if (text.includes("investor") || text.includes("client") || text.includes("outreach") || text.includes("customer")) {
            roles.add("sales_growth");
        }
        if (text.includes("task") || text.includes("workflow") || text.includes("automation") || text.includes("process")) {
            roles.add("operations");
        }
        if (text.includes("brief") || text.includes("decision") || text.includes("meeting") || text.includes("agenda")) {
            roles.add("chief_of_staff");
        }

        if (roles.size === 1) {
            return ["coo", "chief_of_staff", "operations", "sales_growth", "finance", "project"];
        }

        return Array.from(roles);
    }
}

export const cooOrchestrator = new COOOrchestrator();
