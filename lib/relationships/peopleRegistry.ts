import { getDB } from "../db.ts";
import type { Person, RelationshipFilter } from "./types.ts";

export async function createPerson(
    data: Omit<Person, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Person> {
    const db = await getDB();
    const now = Date.now();
    const id = data.id || `person_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const tagsJson = JSON.stringify(data.tags || []);
    const metadataJson = JSON.stringify(data.metadata || {});

    await db.run(
        `INSERT INTO people (
            id, user_id, name, role, organization_id, email, phone,
            relationship_type, tags, notes, last_interaction, created_at, updated_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            data.userId,
            data.name.trim(),
            data.role || null,
            data.organizationId || null,
            data.email ? data.email.trim().toLowerCase() : null,
            data.phone || null,
            data.relationshipType,
            tagsJson,
            data.notes || null,
            data.lastInteraction || now,
            now,
            now,
            metadataJson,
        ]
    );

    return (await getPersonById(id))!;
}

export async function getPersonById(id: string): Promise<Person | null> {
    const db = await getDB();
    const row = await db.get("SELECT * FROM people WHERE id = ?", [id]);
    if (!row) return null;

    return formatPersonRow(row);
}

export async function getPeople(userId: string, filter?: RelationshipFilter): Promise<Person[]> {
    const db = await getDB();
    let query = "SELECT * FROM people WHERE user_id = ?";
    const params: any[] = [userId];

    if (filter?.organizationId) {
        query += " AND organization_id = ?";
        params.push(filter.organizationId);
    }

    if (filter?.relationshipType) {
        query += " AND relationship_type = ?";
        params.push(filter.relationshipType);
    }

    if (filter?.name) {
        query += " AND LOWER(name) LIKE ?";
        params.push(`%${filter.name.toLowerCase()}%`);
    }

    query += " ORDER BY last_interaction DESC";

    const rows = (await db.all(query, params)) || [];
    let people = rows.map(formatPersonRow);

    if (filter?.tag) {
        const tagLower = filter.tag.toLowerCase();
        people = people.filter((p) => p.tags.some((t) => t.toLowerCase() === tagLower));
    }

    if (filter?.query) {
        const q = filter.query.toLowerCase();
        people = people.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.role && p.role.toLowerCase().includes(q)) ||
                (p.email && p.email.toLowerCase().includes(q)) ||
                (p.notes && p.notes.toLowerCase().includes(q)) ||
                p.tags.some((t) => t.toLowerCase().includes(q))
        );
    }

    return people;
}

export async function findPersonByNameOrEmail(userId: string, term: string): Promise<Person | null> {
    const db = await getDB();
    const termLower = term.trim().toLowerCase();

    const row = await db.get(
        `SELECT * FROM people 
         WHERE user_id = ? AND (LOWER(name) = ? OR LOWER(email) = ? OR LOWER(name) LIKE ?)
         ORDER BY last_interaction DESC LIMIT 1`,
        [userId, termLower, termLower, `%${termLower}%`]
    );

    return row ? formatPersonRow(row) : null;
}

export async function updatePerson(id: string, updates: Partial<Person>): Promise<Person | null> {
    const db = await getDB();
    const existing = await getPersonById(id);
    if (!existing) return null;

    const now = Date.now();
    const updated: Person = {
        ...existing,
        ...updates,
        updatedAt: now,
    };

    const tagsJson = JSON.stringify(updated.tags || []);
    const metadataJson = JSON.stringify(updated.metadata || {});

    await db.run(
        `UPDATE people SET 
            name = ?, role = ?, organization_id = ?, email = ?, phone = ?,
            relationship_type = ?, tags = ?, notes = ?, last_interaction = ?,
            updated_at = ?, metadata = ?
         WHERE id = ?`,
        [
            updated.name.trim(),
            updated.role || null,
            updated.organizationId || null,
            updated.email ? updated.email.trim().toLowerCase() : null,
            updated.phone || null,
            updated.relationshipType,
            tagsJson,
            updated.notes || null,
            updated.lastInteraction || now,
            now,
            metadataJson,
            id,
        ]
    );

    return getPersonById(id);
}

export async function deletePerson(id: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.run("DELETE FROM people WHERE id = ?", [id]);
    return (result?.changes || 0) > 0;
}

function formatPersonRow(row: any): Person {
    let tags: string[] = [];
    try {
        tags = JSON.parse(row.tags || "[]");
    } catch {
        tags = [];
    }

    let metadata: Record<string, any> = {};
    try {
        metadata = JSON.parse(row.metadata || "{}");
    } catch {
        metadata = {};
    }

    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        role: row.role || undefined,
        organizationId: row.organization_id || undefined,
        email: row.email || undefined,
        phone: row.phone || undefined,
        relationshipType: row.relationship_type,
        tags,
        notes: row.notes || undefined,
        lastInteraction: row.last_interaction ? Number(row.last_interaction) : undefined,
        createdAt: Number(row.created_at),
        updatedAt: Number(row.updated_at),
        metadata,
    };
}
