/**
 * Workflow Registry & SQLite Persistence Service
 *
 * PAL Milestone 5C — Workflow Automation Engine
 */

import { getDB } from "../db.ts";
import type { Workflow } from "./types.ts";

export async function saveWorkflow(wf: Workflow): Promise<Workflow> {
    const db = await getDB();
    const effectiveUserId = wf.userId || "current_user";
    const now = Date.now();

    const existing = await db.get(
        `SELECT id FROM workflows WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [wf.id, effectiveUserId]
    );

    if (existing) {
        await db.run(
            `UPDATE workflows
             SET name = ?, description = ?, enabled = ?, trigger = ?, conditions = ?, actions = ?, schedule = ?, metadata = ?, updated_at = ?
             WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
            [
                wf.name,
                wf.description || null,
                wf.enabled ? 1 : 0,
                JSON.stringify(wf.trigger),
                wf.conditions ? JSON.stringify(wf.conditions) : null,
                JSON.stringify(wf.actions),
                wf.schedule ? JSON.stringify(wf.schedule) : null,
                wf.metadata ? JSON.stringify(wf.metadata) : null,
                now,
                wf.id,
                effectiveUserId,
            ]
        );
    } else {
        await db.run(
            `INSERT INTO workflows (id, user_id, name, description, enabled, trigger, conditions, actions, schedule, metadata, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                wf.id,
                effectiveUserId,
                wf.name,
                wf.description || null,
                wf.enabled ? 1 : 0,
                JSON.stringify(wf.trigger),
                wf.conditions ? JSON.stringify(wf.conditions) : null,
                JSON.stringify(wf.actions),
                wf.schedule ? JSON.stringify(wf.schedule) : null,
                wf.metadata ? JSON.stringify(wf.metadata) : null,
                wf.createdAt || now,
                now,
            ]
        );
    }

    return {
        ...wf,
        userId: effectiveUserId,
        updatedAt: now,
    };
}

export async function getWorkflowById(id: string, userId: string): Promise<Workflow | null> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const row = await db.get(
        `SELECT * FROM workflows WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [id, effectiveUserId]
    );

    if (!row) return null;
    return mapRowToWorkflow(row);
}

export async function getWorkflows(userId: string): Promise<Workflow[]> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const rows = (await db.all(
        `SELECT * FROM workflows WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL) ORDER BY created_at DESC`,
        [effectiveUserId]
    )) || [];

    return rows.map(mapRowToWorkflow);
}

export async function deleteWorkflow(id: string, userId: string): Promise<boolean> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const res = await db.run(
        `DELETE FROM workflows WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [id, effectiveUserId]
    );

    return (res?.changes || 0) > 0;
}

export async function toggleWorkflow(id: string, userId: string, enabled?: boolean): Promise<Workflow | null> {
    const current = await getWorkflowById(id, userId);
    if (!current) return null;

    const newEnabled = enabled !== undefined ? enabled : !current.enabled;
    return saveWorkflow({
        ...current,
        enabled: newEnabled,
    });
}

function mapRowToWorkflow(row: any): Workflow {
    let triggerObj: any = { type: "manual_run" };
    let conditionsObj: any = null;
    let actionsArr: any[] = [];
    let scheduleObj: any = null;
    let metaObj: any = null;

    if (row.trigger) {
        try {
            triggerObj = JSON.parse(row.trigger);
        } catch {}
    }
    if (row.conditions) {
        try {
            conditionsObj = JSON.parse(row.conditions);
        } catch {}
    }
    if (row.actions) {
        try {
            actionsArr = JSON.parse(row.actions);
        } catch {}
    }
    if (row.schedule) {
        try {
            scheduleObj = JSON.parse(row.schedule);
        } catch {}
    }
    if (row.metadata) {
        try {
            metaObj = JSON.parse(row.metadata);
        } catch {}
    }

    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description || null,
        enabled: row.enabled === 1,
        trigger: triggerObj,
        conditions: conditionsObj,
        actions: actionsArr,
        schedule: scheduleObj,
        metadata: metaObj,
        createdAt: Number(row.created_at || Date.now()),
        updatedAt: Number(row.updated_at || Date.now()),
    };
}
