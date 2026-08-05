import type { DeadLetterQueueRecord, IDeadLetterQueue } from "./types.ts";
import { BaseRepository } from "../db/baseRepository.ts";

export class DeadLetterQueueRepository extends BaseRepository<any> {
    constructor() {
        super("dead_letter_queue");
    }
}

export class DeadLetterQueue implements IDeadLetterQueue {
    private records: Map<string, DeadLetterQueueRecord[]> = new Map();
    private repo: DeadLetterQueueRepository = new DeadLetterQueueRepository();

    async enqueue(record: DeadLetterQueueRecord): Promise<void> {
        const list = this.records.get(record.workspaceId) || [];
        list.push(record);
        this.records.set(record.workspaceId, list);

        this.repo.insertEntity({
            id: record.dlqId,
            workspace_id: record.workspaceId,
            task_node_id: record.taskNodeId,
            worker_role: record.workerRole,
            error_details: record.errorDetails,
            failed_attempts_count: record.failedAttemptsCount,
            enqueued_at: record.enqueuedAt || Date.now()
        }).catch(err => console.error("Failed to persist DLQ record", err));
    }

    async getRecords(workspaceId: string): Promise<DeadLetterQueueRecord[]> {
        return this.records.get(workspaceId) || [];
    }

    async clearRecord(dlqId: string): Promise<boolean> {
        for (const [workspaceId, list] of this.records.entries()) {
            const index = list.findIndex((r) => r.dlqId === dlqId);
            if (index !== -1) {
                list.splice(index, 1);
                this.records.set(workspaceId, list);
                this.repo.deleteById(dlqId).catch(err => console.error("Failed to delete DLQ record", err));
                return true;
            }
        }
        return false;
    }
}
