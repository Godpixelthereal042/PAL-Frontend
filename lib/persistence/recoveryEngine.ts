import type { TaskDAG } from "../tasks/types.ts";
import { ExecutionStore } from "./executionStore.ts";
import type {
    IExecutionStore,
    IRecoveryEngine,
    RecoveryReason,
    RecoverySession,
} from "./types.ts";

export class RecoveryEngine implements IRecoveryEngine {
    private store: IExecutionStore;

    constructor(store?: IExecutionStore) {
        this.store = store || new ExecutionStore();
    }

    async recoverDAG(
        instanceId: string,
        reason: RecoveryReason,
        storeOverride?: IExecutionStore
    ): Promise<{ recoveredDAG: TaskDAG; version: number; session: RecoverySession }> {
        const targetStore = storeOverride || this.store;
        const checkpoint = await targetStore.getLatestCheckpoint(instanceId);

        if (!checkpoint) {
            throw new Error(`No checkpoint found for agent instance '${instanceId}'`);
        }

        const newVersion = checkpoint.executionVersion + 1;
        const recoveryId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const now = Date.now();

        const session: RecoverySession = {
            recoveryId,
            instanceId,
            workspaceId: checkpoint.workspaceId,
            checkpointId: checkpoint.checkpointId,
            previousVersion: checkpoint.executionVersion,
            newVersion,
            reason,
            recoveredAt: now,
        };

        // Re-hydrate DAG structure from checkpoint memory
        const recoveredDAG: TaskDAG = {
            dagId: checkpoint.dagId,
            workspaceId: checkpoint.workspaceId,
            correlationId: checkpoint.correlationId,
            goalDescription: "Recovered Task DAG Execution",
            nodes: new Map(),
            executionLayers: [],
            status: "executing",
            createdAt: checkpoint.timestamp,
            updatedAt: now,
        };

        // Update checkpoint record with incremented version
        checkpoint.executionVersion = newVersion;
        await targetStore.saveCheckpoint(checkpoint);

        return {
            recoveredDAG,
            version: newVersion,
            session,
        };
    }

    async verifyIdempotency(idempotencyKey: string): Promise<boolean> {
        const record = await this.store.getIdempotencyRecord(idempotencyKey);
        // Returns true if side-effect has ALREADY been executed (duplicate call prevented)
        return Boolean(record);
    }
}
