/**
 * Centralized Connector Authentication Manager
 *
 * PAL Milestone 8C — Enterprise Connectivity Framework
 */

import { getDB } from "../../db.ts";
import type { ConnectorAuthCredentials } from "./types.ts";

export class ConnectorAuthManager {
    public async saveCredentials(
        userId: string,
        connectorId: string,
        credentials: ConnectorAuthCredentials
    ): Promise<boolean> {
        const db = await getDB();
        const now = Date.now();
        const existing = await db.get("SELECT id FROM integrations WHERE user_id = ? AND (provider = ? OR connector_id = ?)", [userId, connectorId, connectorId]);

        if (existing) {
            await db.run(
                "UPDATE integrations SET access_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = ? WHERE id = ?",
                [credentials.accessToken || credentials.apiKey || null, credentials.refreshToken || null, credentials.expiresAt || null, now, existing.id]
            );
        } else {
            const id = `integ_${now}_${Math.random().toString(36).substr(2, 4)}`;
            await db.run(
                "INSERT INTO integrations (id, user_id, provider, connector_id, access_token, refresh_token, token_expires_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [id, userId, connectorId, connectorId, credentials.accessToken || credentials.apiKey || null, credentials.refreshToken || null, credentials.expiresAt || null, "connected", now, now]
            );
        }
        return true;
    }

    public async getCredentials(userId: string, connectorId: string): Promise<ConnectorAuthCredentials | null> {
        const db = await getDB();
        const record = await db.get("SELECT * FROM integrations WHERE (user_id = ? OR user_id = 'user_default') AND (provider = ? OR connector_id = ?)", [userId, connectorId, connectorId]);

        if (!record || !record.access_token) return null;

        return {
            accessToken: record.access_token,
            refreshToken: record.refresh_token,
            expiresAt: record.token_expires_at,
            scopes: ["read", "write"],
        };
    }

    public async revokeCredentials(userId: string, connectorId: string): Promise<boolean> {
        const db = await getDB();
        await db.run("DELETE FROM integrations WHERE (user_id = ? OR user_id = 'user_default') AND (provider = ? OR connector_id = ?)", [userId, connectorId, connectorId]);
        return true;
    }
}

export const connectorAuthManager = new ConnectorAuthManager();
