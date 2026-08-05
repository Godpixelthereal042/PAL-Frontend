/**
 * Integration Audit Logging Subsystem
 *
 * PAL Milestone 4A — Integration Framework
 */

import { getDB } from "../db.ts";
import type { AuditLogEntry } from "./types.ts";

export class IntegrationAuditLogger {
    /**
     * Log a connector operation execution to SQLite database.
     */
    async logExecution(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<AuditLogEntry> {
        const db = await getDB();
        const now = Date.now();
        const id = `audit_${now}_${Math.random().toString(36).slice(2, 8)}`;
        const effectiveUserId = entry.userId || "current_user";

        const logRecord: AuditLogEntry = {
            id,
            integrationId: entry.integrationId || undefined,
            provider: entry.provider,
            connectorId: entry.connectorId,
            userId: effectiveUserId,
            operation: entry.operation,
            status: entry.status,
            requestPayload: entry.requestPayload || undefined,
            responsePayload: entry.responsePayload || undefined,
            errorMessage: entry.errorMessage || undefined,
            executionTimeMs: entry.executionTimeMs,
            createdAt: now,
        };

        try {
            await db.run(
                `INSERT INTO integration_audit_logs (id, integration_id, provider, connector_id, user_id, operation, status, request_payload, response_payload, error_message, execution_time_ms, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    logRecord.id,
                    logRecord.integrationId || null,
                    logRecord.provider,
                    logRecord.connectorId,
                    logRecord.userId,
                    logRecord.operation,
                    logRecord.status,
                    logRecord.requestPayload || null,
                    logRecord.responsePayload || null,
                    logRecord.errorMessage || null,
                    logRecord.executionTimeMs,
                    logRecord.createdAt,
                ]
            );
        } catch (err) {
            console.error("IntegrationAuditLogger: Failed to persist audit log entry:", err);
        }

        return logRecord;
    }

    /**
     * Retrieve audit log entries for a user with optional provider filtering.
     */
    async getAuditLogs(userId: string, options?: { provider?: string; limit?: number }): Promise<AuditLogEntry[]> {
        const db = await getDB();
        const effectiveUserId = userId || "current_user";
        const limit = options?.limit || 50;

        let query = `SELECT * FROM integration_audit_logs WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`;
        const params: any[] = [effectiveUserId];

        if (options?.provider) {
            query += ` AND provider = ?`;
            params.push(options.provider);
        }

        query += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(limit);

        const rows = (await db.all(query, params)) || [];

        return rows.map((r: any) => ({
            id: r.id,
            integrationId: r.integration_id || undefined,
            provider: r.provider,
            connectorId: r.connector_id,
            userId: r.user_id,
            operation: r.operation,
            status: r.status as any,
            requestPayload: r.request_payload || undefined,
            responsePayload: r.response_payload || undefined,
            errorMessage: r.error_message || undefined,
            executionTimeMs: Number(r.execution_time_ms || 0),
            createdAt: Number(r.created_at || Date.now()),
        }));
    }
}

export const globalAuditLogger = new IntegrationAuditLogger();
