import { getDB } from "../db.ts";
import type { Interaction } from "./types.ts";

export async function logInteraction(
    data: Omit<Interaction, "id"> & { id?: string }
): Promise<Interaction> {
    const db = await getDB();
    const id = data.id || `integ_${data.timestamp || Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = data.timestamp || Date.now();
    const metadataJson = JSON.stringify(data.metadata || {});

    await db.run(
        `INSERT INTO interactions (
            id, person_id, user_id, type, summary, source, timestamp, follow_up_date, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            data.personId,
            data.userId,
            data.type,
            data.summary.trim(),
            data.source,
            timestamp,
            data.followUpDate || null,
            metadataJson,
        ]
    );

    // Automatically update last_interaction on the Person record
    await db.run(
        "UPDATE people SET last_interaction = ?, updated_at = ? WHERE id = ? AND (last_interaction IS NULL OR last_interaction < ?)",
        [timestamp, Date.now(), data.personId, timestamp]
    );

    return {
        id,
        personId: data.personId,
        userId: data.userId,
        type: data.type,
        summary: data.summary.trim(),
        source: data.source,
        timestamp,
        followUpDate: data.followUpDate || undefined,
        metadata: data.metadata || {},
    };
}

export async function getInteractionsForPerson(
    personId: string,
    limit: number = 50
): Promise<Interaction[]> {
    const db = await getDB();
    const rows = (await db.all(
        "SELECT * FROM interactions WHERE person_id = ? ORDER BY timestamp DESC LIMIT ?",
        [personId, limit]
    )) || [];

    return rows.map(formatInteractionRow);
}

export async function getRecentInteractions(
    userId: string,
    limit: number = 50
): Promise<Interaction[]> {
    const db = await getDB();
    const rows = (await db.all(
        "SELECT * FROM interactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?",
        [userId, limit]
    )) || [];

    return rows.map(formatInteractionRow);
}

export async function deleteInteraction(id: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.run("DELETE FROM interactions WHERE id = ?", [id]);
    return (result?.changes || 0) > 0;
}

function formatInteractionRow(row: any): Interaction {
    let metadata: Record<string, any> = {};
    try {
        metadata = JSON.parse(row.metadata || "{}");
    } catch {
        metadata = {};
    }

    return {
        id: row.id,
        personId: row.person_id,
        userId: row.user_id,
        type: row.type,
        summary: row.summary,
        source: row.source,
        timestamp: Number(row.timestamp),
        followUpDate: row.follow_up_date || undefined,
        metadata,
    };
}
