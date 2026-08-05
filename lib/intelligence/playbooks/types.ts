/**
 * PAL Executive Playbooks & DSL Types (PAL-TDD-002)
 */

export interface PlaybookStepCompensation {
    actionName: string;
    targetProvider?: string;
    inputParameters: Record<string, any>;
    timeoutMs?: number;
}

export interface PlaybookStep {
    id: string;
    title: string;
    actionType: "connector_call" | "ai_reasoning" | "human_approval" | "condition_branch";
    provider?: string;
    actionName: string;
    inputParameters: Record<string, any>;
    estimatedCost?: number;
    timeoutMs?: number;
    compensation?: PlaybookStepCompensation;
    onError: "retry" | "halt" | "rollback" | "escalate";
}

export interface PlaybookTemplate {
    id: string;
    workspaceId: string;
    name: string;
    category: "sales" | "hiring" | "support" | "launch" | "fundraising" | "marketing" | "incident";
    version: string; // e.g. "1.0.0"
    status: "draft" | "active" | "deprecated" | "archived";
    description: string;
    prerequisites: string[];
    steps: PlaybookStep[];
    updatedAt: number;
}

export interface IPlaybookRegistry {
    registerPlaybook(template: PlaybookTemplate): void;
    getPlaybook(playbookId: string): PlaybookTemplate | undefined;
    listPlaybooks(workspaceId: string, category?: string): PlaybookTemplate[];
}
