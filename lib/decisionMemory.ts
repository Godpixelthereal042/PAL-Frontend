/**
 * Standalone Decision Memory System
 *
 * PAL Milestone 3B — Decision Memory
 *
 * This module manages PAL's strategic Decision Memory, keeping track of confirmed,
 * pending, superseded, and archived business decisions separately from the Business Brain.
 *
 * Reference: PAL-DOC-003 (AI Architecture) §03, PAL-DOC-002 (MVP) §04
 */

import { getDB } from "./db.ts";

export type DecisionStatus = "pending_confirmation" | "active" | "superseded" | "archived";

export interface DecisionRecord {
    id: string;
    user_id: string;
    project_id: string | null;
    title: string;
    description: string | null;
    rationale: string | null;
    impact_area: string | null;
    status: DecisionStatus;
    superseded_by: string | null;
    confirmed_at: number | null;
    created_at: number;
    updated_at: number | null;
}

export interface CreateDecisionInput {
    projectId?: string | null;
    title: string;
    description?: string | null;
    rationale?: string | null;
    impactArea?: string | null;
    status?: DecisionStatus;
    autoConfirm?: boolean;
}

export interface UpdateDecisionInput {
    title?: string;
    description?: string | null;
    rationale?: string | null;
    impactArea?: string | null;
    status?: DecisionStatus;
}

export interface DecisionFilterOptions {
    status?: DecisionStatus;
    projectId?: string | null;
}

/**
 * Creates a new decision record. Defaults to 'pending_confirmation' state
 * unless autoConfirm is true or status is explicitly provided as 'active'.
 */
export async function createDecision(userId: string, input: CreateDecisionInput): Promise<DecisionRecord> {
    const db = await getDB();
    const now = Date.now();
    const decisionId = `dec_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const effectiveUserId = userId || "current_user";

    let status: DecisionStatus = input.status || "pending_confirmation";
    let confirmedAt: number | null = null;

    if (input.autoConfirm || status === "active") {
        status = "active";
        confirmedAt = now;
    }

    const dbProjectId = input.projectId ? input.projectId : "";

    await db.run(
        `INSERT INTO decisions (id, user_id, project_id, title, description, rationale, impact_area, status, superseded_by, confirmed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            decisionId,
            effectiveUserId,
            dbProjectId,
            input.title.trim(),
            input.description || null,
            input.rationale || null,
            input.impactArea || null,
            status,
            null,
            confirmedAt,
            now,
            now,
        ]
    );

    const record = await getDecision(decisionId, effectiveUserId);
    if (!record) {
        throw new Error(`Failed to retrieve newly created decision '${decisionId}'.`);
    }
    return record;
}

/**
 * Confirms a decision, transitioning its status from 'pending_confirmation' to 'active'.
 */
export async function confirmDecision(decisionId: string, userId: string): Promise<DecisionRecord> {
    const db = await getDB();
    const now = Date.now();
    const effectiveUserId = userId || "current_user";

    const existing = await getDecision(decisionId, effectiveUserId);
    if (!existing) {
        throw new Error(`Decision '${decisionId}' not found for user '${effectiveUserId}'.`);
    }

    await db.run(
        `UPDATE decisions
         SET status = 'active', confirmed_at = ?, updated_at = ?
         WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [now, now, decisionId, effectiveUserId]
    );

    const updated = await getDecision(decisionId, effectiveUserId);
    return updated!;
}

/**
 * Retrieves a single decision record by ID.
 */
export async function getDecision(decisionId: string, userId: string): Promise<DecisionRecord | null> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const row = await db.get(
        `SELECT * FROM decisions
         WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [decisionId, effectiveUserId]
    );

    if (!row) return null;

    return {
        id: row.id,
        user_id: row.user_id,
        project_id: (row.project_id && row.project_id !== "") ? row.project_id : null,
        title: row.title,
        description: row.description || null,
        rationale: row.rationale || null,
        impact_area: row.impact_area || null,
        status: row.status as DecisionStatus,
        superseded_by: row.superseded_by || null,
        confirmed_at: row.confirmed_at ? Number(row.confirmed_at) : null,
        created_at: Number(row.created_at || Date.now()),
        updated_at: Number(row.updated_at || Date.now()),
    };
}

/**
 * Retrieves all active strategic decisions for the user (used by Context Engine).
 */
export async function getActiveDecisions(userId: string): Promise<DecisionRecord[]> {
    return getDecisions(userId, { status: "active" });
}

/**
 * Retrieves decisions filtered by status or project ID.
 */
export async function getDecisions(userId: string, options?: DecisionFilterOptions): Promise<DecisionRecord[]> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    let query = `SELECT * FROM decisions WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`;
    const params: any[] = [effectiveUserId];

    if (options?.status) {
        query += ` AND status = ?`;
        params.push(options.status);
    }

    if (options?.projectId !== undefined) {
        if (options.projectId === null) {
            query += ` AND (project_id IS NULL OR project_id = '')`;
        } else {
            query += ` AND project_id = ?`;
            params.push(options.projectId);
        }
    }

    query += ` ORDER BY created_at DESC`;

    const rows = (await db.all(query, params)) || [];

    return rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        project_id: (row.project_id && row.project_id !== "") ? row.project_id : null,
        title: row.title,
        description: row.description || null,
        rationale: row.rationale || null,
        impact_area: row.impact_area || null,
        status: row.status as DecisionStatus,
        superseded_by: row.superseded_by || null,
        confirmed_at: row.confirmed_at ? Number(row.confirmed_at) : null,
        created_at: Number(row.created_at || Date.now()),
        updated_at: Number(row.updated_at || Date.now()),
    }));
}

/**
 * Updates properties of an existing decision.
 */
export async function updateDecision(decisionId: string, userId: string, updates: UpdateDecisionInput): Promise<DecisionRecord> {
    const db = await getDB();
    const now = Date.now();
    const effectiveUserId = userId || "current_user";

    const existing = await getDecision(decisionId, effectiveUserId);
    if (!existing) {
        throw new Error(`Decision '${decisionId}' not found for user '${effectiveUserId}'.`);
    }

    const title = updates.title !== undefined ? updates.title.trim() : existing.title;
    const description = updates.description !== undefined ? updates.description : existing.description;
    const rationale = updates.rationale !== undefined ? updates.rationale : existing.rationale;
    const impactArea = updates.impactArea !== undefined ? updates.impactArea : existing.impact_area;
    const status = updates.status !== undefined ? updates.status : existing.status;
    const confirmedAt = status === "active" && !existing.confirmed_at ? now : existing.confirmed_at;

    await db.run(
        `UPDATE decisions
         SET title = ?, description = ?, rationale = ?, impact_area = ?, status = ?, confirmed_at = ?, updated_at = ?
         WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [title, description, rationale, impactArea, status, confirmedAt, now, decisionId, effectiveUserId]
    );

    const updated = await getDecision(decisionId, effectiveUserId);
    return updated!;
}

/**
 * Archives a decision, setting its status to 'archived'.
 */
export async function archiveDecision(decisionId: string, userId: string): Promise<DecisionRecord> {
    return updateDecision(decisionId, userId, { status: "archived" });
}

/**
 * Atomically supersedes an old decision by creating a new active decision
 * and marking the old decision as 'superseded' with superseded_by = newDecision.id.
 */
export async function supersedeDecision(
    oldDecisionId: string,
    newDecisionInput: CreateDecisionInput,
    userId: string
): Promise<{ newDecision: DecisionRecord; supersededDecision: DecisionRecord }> {
    const db = await getDB();
    const now = Date.now();
    const effectiveUserId = userId || "current_user";

    const oldRecord = await getDecision(oldDecisionId, effectiveUserId);
    if (!oldRecord) {
        throw new Error(`Old decision '${oldDecisionId}' not found for supersession.`);
    }

    // 1. Create the new decision (defaults to active when superseding)
    const newDecision = await createDecision(effectiveUserId, {
        ...newDecisionInput,
        status: newDecisionInput.status || "active",
        autoConfirm: true,
    });

    // 2. Link old decision as superseded
    await db.run(
        `UPDATE decisions
         SET status = 'superseded', superseded_by = ?, updated_at = ?
         WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [newDecision.id, now, oldDecisionId, effectiveUserId]
    );

    const supersededDecision = (await getDecision(oldDecisionId, effectiveUserId))!;

    return {
        newDecision,
        supersededDecision,
    };
}
