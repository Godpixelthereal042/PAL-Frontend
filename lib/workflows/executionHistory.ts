/**
 * Execution History Persistence & Audit Service
 *
 * PAL Milestone 5C — Workflow Automation Engine
 */

import { getDB } from "../db.ts";
import type { WorkflowExecution, ExecutionStepResult, WorkflowExecutionStatus, ExecutionStepStatus } from "./types.ts";

export async function createWorkflowExecution(exec: WorkflowExecution): Promise<WorkflowExecution> {
    const db = await getDB();
    const effectiveUserId = exec.userId || "current_user";

    await db.run(
        `INSERT INTO workflow_executions (id, workflow_id, user_id, trigger_type, status, started_at, completed_at, errors, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            exec.id,
            exec.workflowId,
            effectiveUserId,
            exec.triggerType,
            exec.status,
            exec.startedAt,
            exec.completedAt || null,
            exec.errors ? JSON.stringify(exec.errors) : null,
            exec.metadata ? JSON.stringify(exec.metadata) : null,
        ]
    );

    return exec;
}

export async function updateWorkflowExecution(exec: WorkflowExecution): Promise<WorkflowExecution> {
    const db = await getDB();

    await db.run(
        `UPDATE workflow_executions
         SET status = ?, completed_at = ?, errors = ?, metadata = ?
         WHERE id = ?`,
        [
            exec.status,
            exec.completedAt || Date.now(),
            exec.errors ? JSON.stringify(exec.errors) : null,
            exec.metadata ? JSON.stringify(exec.metadata) : null,
            exec.id,
        ]
    );

    return exec;
}

export async function saveExecutionStep(stepRes: ExecutionStepResult): Promise<ExecutionStepResult> {
    const db = await getDB();

    await db.run(
        `INSERT INTO workflow_execution_steps (id, execution_id, step_index, action_type, status, request_payload, result_payload, error, started_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            stepRes.id,
            stepRes.executionId,
            stepRes.stepIndex,
            stepRes.actionType,
            stepRes.status,
            JSON.stringify(stepRes.requestPayload),
            stepRes.resultPayload ? JSON.stringify(stepRes.resultPayload) : null,
            stepRes.error || null,
            stepRes.startedAt,
            stepRes.completedAt || null,
        ]
    );

    return stepRes;
}

export async function getWorkflowExecutions(workflowId?: string, userId?: string): Promise<WorkflowExecution[]> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    let query = `SELECT * FROM workflow_executions WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`;
    const params: any[] = [effectiveUserId];

    if (workflowId) {
        query += ` AND workflow_id = ?`;
        params.push(workflowId);
    }

    query += ` ORDER BY started_at DESC LIMIT 50`;

    const rows = (await db.all(query, params)) || [];
    const executions: WorkflowExecution[] = [];

    for (const row of rows) {
        const stepRows = (await db.all(
            `SELECT * FROM workflow_execution_steps WHERE execution_id = ? ORDER BY step_index ASC`,
            [row.id]
        )) || [];

        const steps: ExecutionStepResult[] = stepRows.map((s: any) => ({
            id: s.id,
            executionId: s.execution_id,
            stepIndex: s.step_index,
            actionType: s.action_type,
            status: s.status as ExecutionStepStatus,
            requestPayload: s.request_payload ? JSON.parse(s.request_payload) : {},
            resultPayload: s.result_payload ? JSON.parse(s.result_payload) : null,
            error: s.error || null,
            startedAt: Number(s.started_at),
            completedAt: s.completed_at ? Number(s.completed_at) : null,
        }));

        let errs: string[] | null = null;
        if (row.errors) {
            try {
                errs = JSON.parse(row.errors);
            } catch {}
        }

        let meta: Record<string, any> | null = null;
        if (row.metadata) {
            try {
                meta = JSON.parse(row.metadata);
            } catch {}
        }

        executions.push({
            id: row.id,
            workflowId: row.workflow_id,
            userId: row.user_id,
            triggerType: row.trigger_type,
            status: row.status as WorkflowExecutionStatus,
            startedAt: Number(row.started_at),
            completedAt: row.completed_at ? Number(row.completed_at) : null,
            steps,
            errors: errs,
            metadata: meta,
        });
    }

    return executions;
}
