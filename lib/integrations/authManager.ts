/**
 * Authentication Abstraction Manager
 *
 * PAL Milestone 4A — Integration Framework
 */

import { getDB } from "../db.ts";
import type { AuthContext, IntegrationProvider } from "./types.ts";

export class IntegrationAuthManager {
    /**
     * Retrieve authentication context for a user and provider from the database.
     */
    async getAuthContext(userId: string, provider: IntegrationProvider): Promise<AuthContext> {
        const db = await getDB();
        const effectiveUserId = userId || "current_user";

        const row = await db.get(
            `SELECT * FROM integrations WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL) AND provider = ? LIMIT 1`,
            [effectiveUserId, provider]
        );

        if (!row) {
            return {
                provider,
                userId: effectiveUserId,
                grantedScopes: [],
                status: "disconnected",
            };
        }

        let configObj: Record<string, any> = {};
        let grantedScopes: string[] = [];

        if (row.config) {
            try {
                const parsed = JSON.parse(row.config);
                configObj = parsed;
                if (Array.isArray(parsed.scopes)) {
                    grantedScopes = parsed.scopes;
                }
            } catch (e) {
                // Keep defaults on parse failure
            }
        }

        return {
            integrationId: row.id,
            provider: row.provider,
            userId: effectiveUserId,
            accessToken: row.access_token || undefined,
            refreshToken: row.refresh_token || undefined,
            tokenExpiresAt: row.token_expires_at ? Number(row.token_expires_at) : undefined,
            config: configObj,
            grantedScopes,
            status: (row.status as any) || "connected",
        };
    }

    /**
     * Store or update authentication context for a user and provider.
     */
    async saveAuthContext(authContext: AuthContext): Promise<void> {
        const db = await getDB();
        const now = Date.now();
        const effectiveUserId = authContext.userId || "current_user";
        const id = authContext.integrationId || `int_${now}_${Math.random().toString(36).slice(2, 8)}`;

        const configObj = {
            ...(authContext.config || {}),
            scopes: authContext.grantedScopes,
        };

        const existing = await db.get(
            `SELECT id FROM integrations WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL) AND provider = ?`,
            [effectiveUserId, authContext.provider]
        );

        if (existing) {
            await db.run(
                `UPDATE integrations
                 SET status = ?, config = ?, access_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = ?
                 WHERE id = ?`,
                [
                    authContext.status,
                    JSON.stringify(configObj),
                    authContext.accessToken || null,
                    authContext.refreshToken || null,
                    authContext.tokenExpiresAt || null,
                    now,
                    existing.id,
                ]
            );
        } else {
            await db.run(
                `INSERT INTO integrations (id, user_id, provider, account_name, status, config, access_token, refresh_token, token_expires_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    effectiveUserId,
                    authContext.provider,
                    authContext.provider + "_account",
                    authContext.status,
                    JSON.stringify(configObj),
                    authContext.accessToken || null,
                    authContext.refreshToken || null,
                    authContext.tokenExpiresAt || null,
                    now,
                    now,
                ]
            );
        }
    }
}

export const globalAuthManager = new IntegrationAuthManager();
