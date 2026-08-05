/**
 * Workspace Context — Multi-Tenant Isolation Helper (PAL v3.1)
 *
 * Every data-reading/writing API route MUST resolve the workspace for the
 * authenticated user and scope all queries to that workspace.
 */

import { getDB } from "../db.ts";

export interface WorkspaceRecord {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    plan: string;
    created_at: number;
}

/**
 * Resolve the workspace that a user belongs to.
 * If the user has no workspace yet, auto-create one (first-use provisioning).
 */
export async function getWorkspaceForUser(userId: string): Promise<WorkspaceRecord> {
    const db = await getDB();

    // Check if the user already has a workspace
    const user = await db.get("SELECT workspace_id FROM users WHERE id = ?", [userId]);
    if (user?.workspace_id) {
        const ws = await db.get("SELECT * FROM workspaces WHERE id = ?", [user.workspace_id]);
        if (ws) return ws as WorkspaceRecord;
    }

    // Check if the user owns a workspace
    const owned = await db.get("SELECT * FROM workspaces WHERE owner_id = ?", [userId]);
    if (owned) {
        // Link user to their workspace
        await db.run("UPDATE users SET workspace_id = ? WHERE id = ?", [owned.id, userId]);
        return owned as WorkspaceRecord;
    }

    // Auto-provision a new workspace for the user
    const profile = await db.get("SELECT * FROM profile WHERE id = ?", [userId]);
    const wsId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const wsName = profile?.companyName || "My Workspace";
    const baseSlug = wsName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
    const wsSlug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    await db.run(
        "INSERT INTO workspaces (id, name, slug, owner_id, plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [wsId, wsName, wsSlug, userId, "starter", now, now]
    );

    // Link user to the new workspace
    await db.run("UPDATE users SET workspace_id = ? WHERE id = ?", [wsId, userId]);

    return {
        id: wsId,
        name: wsName,
        slug: wsSlug,
        owner_id: userId,
        plan: "starter",
        created_at: now
    };
}

/**
 * Verify that a user has access to the given workspace.
 * Throws if the user does not belong to this workspace.
 */
export async function requireWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
    const db = await getDB();
    const user = await db.get("SELECT workspace_id FROM users WHERE id = ?", [userId]);

    if (!user || user.workspace_id !== workspaceId) {
        throw new Error("Workspace access denied: user does not belong to this workspace");
    }
}
