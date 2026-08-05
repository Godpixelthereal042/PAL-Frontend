/**
 * Plugin Permission Governance Manager
 *
 * PAL Milestone 9A — Plugin SDK & Skills Platform
 */

import { getDB } from "../db.ts";

export class PluginPermissionManager {
    public async grantPermission(userId: string, pluginId: string, permissionKey: string): Promise<boolean> {
        const db = await getDB();
        const now = Date.now();
        const existing = await db.get("SELECT id FROM plugin_permissions WHERE (user_id = ? OR user_id = 'user_default') AND plugin_id = ? AND permission_key = ?", [userId, pluginId, permissionKey]);

        if (existing) {
            await db.run("UPDATE plugin_permissions SET granted = 1, updated_at = ? WHERE id = ?", [now, existing.id]);
        } else {
            const id = `perm_${now}_${Math.random().toString(36).substr(2, 4)}`;
            await db.run(
                "INSERT INTO plugin_permissions (id, plugin_id, user_id, permission_key, granted, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                [id, pluginId, userId, permissionKey, 1, now]
            );
        }
        return true;
    }

    public async revokePermission(userId: string, pluginId: string, permissionKey: string): Promise<boolean> {
        const db = await getDB();
        const now = Date.now();
        await db.run(
            "UPDATE plugin_permissions SET granted = 0, updated_at = ? WHERE (user_id = ? OR user_id = 'user_default') AND plugin_id = ? AND permission_key = ?",
            [now, userId, pluginId, permissionKey]
        );
        return true;
    }

    public async hasPermission(userId: string, pluginId: string, permissionKey: string): Promise<boolean> {
        const db = await getDB();
        const record = await db.get(
            "SELECT granted FROM plugin_permissions WHERE (user_id = ? OR user_id = 'user_default') AND plugin_id = ? AND permission_key = ?",
            [userId, pluginId, permissionKey]
        );
        return record ? Boolean(record.granted) : true; // Default true for installed trusted plugins
    }
}

export const pluginPermissionManager = new PluginPermissionManager();
