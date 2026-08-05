/**
 * PAL Executive Planning Engine Types & Interfaces (PAL-TDD-002)
 */

export interface ExecutionTaskNode {
    id: string;
    title: string;
    domain: "finance" | "engineering" | "sales" | "marketing" | "operations" | "legal" | "hr";
    prerequisites: string[]; // Node IDs that must complete first
    estimatedCost: number;
    estimatedTimeHours: number;
    assignedRole: string;
    riskScore: number; // 0 - 100
}

export interface ExecutionMilestone {
    id: string;
    name: string;
    targetDayOffset: number;
    deliverables: string[];
    verificationCriteria: string;
}

export interface ExecutionPlan {
    id: string;
    workspaceId: string;
    objectiveId?: string;
    title: string;
    goalDescription: string;
    tasks: ExecutionTaskNode[];
    executionOrder: string[]; // Topological sort of task IDs
    milestones: ExecutionMilestone[];
    totalEstimatedCost: number;
    totalEstimatedTimeHours: number;
    createdAt: number;
}

export interface IGoalDecomposer {
    decomposeGoal(workspaceId: string, goal: string, context: any): Promise<{
        tasks: ExecutionTaskNode[];
        milestones: ExecutionMilestone[];
    }>;
}

export interface IPlanningEngine {
    createExecutionPlan(workspaceId: string, goalDescription: string, context?: any): Promise<ExecutionPlan>;
}
