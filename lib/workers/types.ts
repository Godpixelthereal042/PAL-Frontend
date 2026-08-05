/**
 * PAL Worker Agent System Types & Shared Response Contract (PAL-TDD-003, PAL-ARCH-DOC-025)
 */

import type { ExecutionContext, WorkerRoleType } from "../runtime/types.ts";

export interface WorkerArtifact {
    artifactId: string;
    name: string;
    type: "document" | "code" | "data" | "image" | "email_draft";
    content: string | Record<string, any>;
}

export interface WorkerExecutionRequest {
    taskId: string;
    workspaceId: string;
    correlationId: string;
    taskDescription: string;
    inputParameters: Record<string, any>;
    context: ExecutionContext;
    /** When true, destructive operations are validated but not executed against live APIs. */
    dryRun?: boolean;
}

export interface WorkerExecutionResponse {
    taskId: string;
    workerRole: WorkerRoleType;
    status: "success" | "failed" | "requires_approval";
    outputs: Record<string, any>;
    artifacts: WorkerArtifact[];
    metrics: {
        latencyMs: number;
        inputTokens: number;
        outputTokens: number;
        estimatedCostUSD: number;
    };
    invokedTools: string[];
    retryable: boolean;
    humanApprovalRequired: boolean;
    warnings: string[];
    isStub?: boolean;
    errorDetails?: string;
}

export interface IWorkerAgent {
    getWorkerRole(): WorkerRoleType;
    getCapabilities(): string[];
    executeTask(request: WorkerExecutionRequest): Promise<WorkerExecutionResponse>;
}
