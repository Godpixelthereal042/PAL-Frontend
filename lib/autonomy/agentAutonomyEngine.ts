/**
 * AI Agent Autonomy Level & Trust Engine (PAL-TDD-006, Sprint 13)
 *
 * Configures PAL trust levels (Level 1: Advisor, Level 2: Assistant, Level 3: Operator, Level 4: Executive Agent)
 * with domain-specific governance controls.
 */

export type AutonomyLevel = 1 | 2 | 3 | 4;

export interface AutonomyConfig {
    workspaceId: string;
    domain: "finance" | "marketing" | "sales" | "operations";
    level: AutonomyLevel;
    levelName: string;
    requiresHumanApproval: boolean;
    maxAutoSpendLimitUSD: number;
    lastUpdated: number;
}

export class AgentAutonomyEngine {
    private static instance: AgentAutonomyEngine;
    private configs: Map<string, AutonomyConfig[]> = new Map(); // key: workspaceId

    constructor() {
        this.initializeDefaultConfigs("ws_demo_company");
    }

    public static getInstance(): AgentAutonomyEngine {
        if (!AgentAutonomyEngine.instance) {
            AgentAutonomyEngine.instance = new AgentAutonomyEngine();
        }
        return AgentAutonomyEngine.instance;
    }

    private initializeDefaultConfigs(workspaceId: string): void {
        const defaults: AutonomyConfig[] = [
            { workspaceId, domain: "finance", level: 2, levelName: "Level 2 — Assistant", requiresHumanApproval: true, maxAutoSpendLimitUSD: 1000, lastUpdated: Date.now() },
            { workspaceId, domain: "marketing", level: 3, levelName: "Level 3 — Operator", requiresHumanApproval: false, maxAutoSpendLimitUSD: 2500, lastUpdated: Date.now() },
            { workspaceId, domain: "sales", level: 3, levelName: "Level 3 — Operator", requiresHumanApproval: false, maxAutoSpendLimitUSD: 5000, lastUpdated: Date.now() },
            { workspaceId, domain: "operations", level: 4, levelName: "Level 4 — Executive Agent", requiresHumanApproval: false, maxAutoSpendLimitUSD: 10000, lastUpdated: Date.now() }
        ];
        this.configs.set(workspaceId, defaults);
    }

    public getAutonomyConfigs(workspaceId: string): AutonomyConfig[] {
        return this.configs.get(workspaceId) || [];
    }

    public setAutonomyLevel(workspaceId: string, domain: AutonomyConfig["domain"], level: AutonomyLevel): AutonomyConfig {
        const list = this.getAutonomyConfigs(workspaceId);
        let item = list.find(c => c.domain === domain);

        const levelNames: Record<AutonomyLevel, string> = {
            1: "Level 1 — Advisor",
            2: "Level 2 — Assistant",
            3: "Level 3 — Operator",
            4: "Level 4 — Executive Agent"
        };

        if (!item) {
            item = {
                workspaceId,
                domain,
                level,
                levelName: levelNames[level],
                requiresHumanApproval: level <= 2,
                maxAutoSpendLimitUSD: level === 1 ? 0 : level === 2 ? 1000 : level === 3 ? 5000 : 10000,
                lastUpdated: Date.now()
            };
            list.push(item);
        } else {
            item.level = level;
            item.levelName = levelNames[level];
            item.requiresHumanApproval = level <= 2;
            item.maxAutoSpendLimitUSD = level === 1 ? 0 : level === 2 ? 1000 : level === 3 ? 5000 : 10000;
            item.lastUpdated = Date.now();
        }

        this.configs.set(workspaceId, list);
        return item;
    }
}
