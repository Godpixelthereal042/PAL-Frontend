/**
 * PAL Workflow Engine & Resumable State Types (PAL-TDD-002)
 */

import type { PlaybookStep, PlaybookTemplate } from "../playbooks/types.ts";

export type WorkflowStatus = "pending" | "executing" | "paused_for_approval" | "completed" | "failed" | "rolling_back";

export interface WorkflowInstance {
    instanceId: string;
    workspaceId: string;
    correlationId: string;
    playbookId: string;
    currentStepIndex: number;
    status: WorkflowStatus;
    executedSteps: Array<{
        stepId: string;
        actionName: string;
        executedAt: number;
        output: any;
    }>;
    approvalState?: {
        requiredAction: string;
        requestedAt: number;
        approvedBy?: string;
        approvedAt?: number;
    };
    rollbackState?: {
        compensatedStepsCount: number;
        rollbackReason: string;
    };
    createdAt: number;
    updatedAt: number;
}

export interface IRollbackManager {
    rollbackWorkflow(instance: WorkflowInstance, playbook: PlaybookTemplate, reason: string): Promise<WorkflowInstance>;
}

export interface IWorkflowEngine {
    startWorkflow(workspaceId: string, correlationId: string, playbookId: string, initialInputs: Record<string, any>): Promise<WorkflowInstance>;
    approveWorkflowStep(instanceId: string, approverId: string): Promise<WorkflowInstance>;
    getWorkflowInstance(instanceId: string): WorkflowInstance | undefined;
}
