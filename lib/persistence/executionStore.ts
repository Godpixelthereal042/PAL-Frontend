import type { CheckpointRecord, IExecutionStore, IdempotencyRecord } from "./types.ts";
import { BaseRepository } from "../db/baseRepository.ts";

export class CheckpointRepository extends BaseRepository<any> {
    constructor() {
        super("execution_checkpoints");
    }
}

export class IdempotencyRepository extends BaseRepository<any> {
    constructor() {
        super("idempotency_records");
    }
}

export class ExecutionStore implements IExecutionStore {
    private checkpoints: Map<string, CheckpointRecord[]> = new Map();
    private idempotencyKeys: Map<string, IdempotencyRecord> = new Map();
    private checkpointRepo: CheckpointRepository = new CheckpointRepository();
    private idempotencyRepo: IdempotencyRepository = new IdempotencyRepository();

    async saveCheckpoint(record: CheckpointRecord): Promise<void> {
        const list = this.checkpoints.get(record.instanceId) || [];
        list.push(record);
        this.checkpoints.set(record.instanceId, list);

        this.checkpointRepo.insertEntity({
            id: record.checkpointId,
            instance_id: record.instanceId,
            workspace_id: record.workspaceId,
            execution_version: record.executionVersion,
            state_data: JSON.stringify(record.agentMemoryState || {}),
            created_at: record.timestamp || Date.now()
        }).catch(err => console.error("Failed to persist checkpoint", err));
    }

    async getLatestCheckpoint(instanceId: string): Promise<CheckpointRecord | undefined> {
        const list = this.checkpoints.get(instanceId) || [];
        if (list.length === 0) return undefined;
        return list[list.length - 1];
    }

    async listCheckpoints(workspaceId: string): Promise<CheckpointRecord[]> {
        const results: CheckpointRecord[] = [];
        for (const list of this.checkpoints.values()) {
            for (const rec of list) {
                if (rec.workspaceId === workspaceId) {
                    results.push(rec);
                }
            }
        }
        return results;
    }

    async deleteCheckpoint(checkpointId: string): Promise<void> {
        for (const [instanceId, list] of this.checkpoints.entries()) {
            const index = list.findIndex((c) => c.checkpointId === checkpointId);
            if (index !== -1) {
                list.splice(index, 1);
                this.checkpoints.set(instanceId, list);
                break;
            }
        }
        this.checkpointRepo.deleteById(checkpointId).catch(err => console.error("Failed to delete checkpoint", err));
    }

    async saveIdempotencyKey(record: IdempotencyRecord): Promise<void> {
        this.idempotencyKeys.set(record.idempotencyKey, record);
        this.idempotencyRepo.insertEntity({
            id: record.idempotencyKey,
            workspace_id: record.workspaceId,
            idempotency_key: record.idempotencyKey,
            output_data: JSON.stringify(record.outputData || {}),
            created_at: record.executedAt || Date.now()
        }).catch(err => console.error("Failed to persist idempotency key", err));
    }

    async getIdempotencyRecord(idempotencyKey: string): Promise<IdempotencyRecord | undefined> {
        return this.idempotencyKeys.get(idempotencyKey);
    }
}

export const SupabaseExecutionStore = ExecutionStore;
