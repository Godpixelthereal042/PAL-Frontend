/**
 * PAL Persistence, Recovery & Monitoring Types (PAL-TDD-003, PAL-ARCH-DOC-023, PAL-ARCH-DOC-025)
 */

import type { ExecutionContext } from "../runtime/types.ts";
import type { TaskDAG } from "../tasks/types.ts";

export type RecoveryReason = "restart" | "crash" | "manual" | "timeout";

export interface CheckpointRecord {
    checkpointId: string;
    instanceId: string;
    workspaceId: string;
    correlationId: string;
    dagId: string;
    executionVersion: number;
    completedNodeIds: string[];
    activeNodeId: string;
    nodeOutputs: Record<string, any>;
    agentMemoryState: Record<string, any>;
    consumedTokensTotal: { input: number; output: number };
    timestamp: number;
}

export interface IdempotencyRecord {
    idempotencyKey: string;
    workspaceId: string;
    toolId: string;
    actionName: string;
    outputData: Record<string, any>;
    executedAt: number;
}

export interface RecoverySession {
    recoveryId: string;
    instanceId: string;
    workspaceId: string;
    checkpointId: string;
    previousVersion: number;
    newVersion: number;
    reason: RecoveryReason;
    recoveredAt: number;
}

export interface IExecutionStore {
    saveCheckpoint(record: CheckpointRecord): Promise<void>;
    getLatestCheckpoint(instanceId: string): Promise<CheckpointRecord | undefined>;
    listCheckpoints(workspaceId: string): Promise<CheckpointRecord[]>;
    deleteCheckpoint(checkpointId: string): Promise<void>;

    saveIdempotencyKey(record: IdempotencyRecord): Promise<void>;
    getIdempotencyRecord(idempotencyKey: string): Promise<IdempotencyRecord | undefined>;
}

export interface IRecoveryEngine {
    recoverDAG(
        instanceId: string,
        reason: RecoveryReason,
        store?: IExecutionStore
    ): Promise<{ recoveredDAG: TaskDAG; version: number; session: RecoverySession }>;

    verifyIdempotency(idempotencyKey: string): Promise<boolean>;
}
