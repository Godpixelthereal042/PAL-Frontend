import { getDB } from "../db.ts";
import type { Organization } from "./types.ts";

export async function createOrganization(
    data: Omit<Organization, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Organization> {
    const db = await getDB();
    const now = Date.now();
    const id = data.id || `org_${now}_${Math.random().toString(36).slice(2, 8)}`;

    await db.run(
        `INSERT INTO organizations (
            id, user_id, name, industry, website, description,
            relationship_strength, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            data.userId,
            data.name.trim(),
            data.industry || null,
            data.website || null,
            data.description || null,
            data.relationshipStrength || "healthy",
            data.notes || null,
            now,
            now,
        ]
    );

    return (await getOrganizationById(id))!;
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
    const db = await getDB();
    const row = await db.get("SELECT * FROM organizations WHERE id = ?", [id]);
    if (!row) return null;

    return formatOrgRow(row);
}

export async function getOrganizations(userId: string): Promise<Organization[]> {
    const db = await getDB();
    const rows = (await db.all("SELECT * FROM organizations WHERE user_id = ? ORDER BY name ASC", [userId])) || [];
    return rows.map(formatOrgRow);
}

export async function findOrganizationByName(userId: string, name: string): Promise<Organization | null> {
    const db = await getDB();
    const nameLower = name.trim().toLowerCase();
    const row = await db.get(
        "SELECT * FROM organizations WHERE user_id = ? AND LOWER(name) = ? LIMIT 1",
        [userId, nameLower]
    );
    return row ? formatOrgRow(row) : null;
}

export async function updateOrganization(
    id: string,
    updates: Partial<Organization>
): Promise<Organization | null> {
    const db = await getDB();
    const existing = await getOrganizationById(id);
    if (!existing) return null;

    const now = Date.now();
    const updated: Organization = {
        ...existing,
        ...updates,
        updatedAt: now,
    };

    await db.run(
        `UPDATE organizations SET 
            name = ?, industry = ?, website = ?, description = ?,
            relationship_strength = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
        [
            updated.name.trim(),
            updated.industry || null,
            updated.website || null,
            updated.description || null,
            updated.relationshipStrength,
            updated.notes || null,
            now,
            id,
        ]
    );

    return getOrganizationById(id);
}

export async function deleteOrganization(id: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.run("DELETE FROM organizations WHERE id = ?", [id]);
    return (result?.changes || 0) > 0;
}

function formatOrgRow(row: any): Organization {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        industry: row.industry || undefined,
        website: row.website || undefined,
        description: row.description || undefined,
        relationshipStrength: row.relationship_strength || "healthy",
        notes: row.notes || undefined,
        createdAt: Number(row.created_at),
        updatedAt: Number(row.updated_at),
    };
}
