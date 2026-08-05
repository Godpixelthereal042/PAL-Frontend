/**
 * PAL Audit Repository
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 25 (Observability & Audit)
 */

import { BaseRepository } from "../baseRepository.ts";
import { InternalServerError } from "../../core/errors.ts";

export interface AuditLogEntity {
    id: string;
    workspace_id: string;
    actor_id: string;
    actor_type: "human" | "ai_agent" | "service_account" | "connector" | "plugin";
    event: string;
    resource: string;
    result: "allow" | "deny" | "success" | "failure";
    correlation_id: string;
    ip_address?: string;
    metadata?: string; // JSON payload
    created_at: number;
}

export class AuditRepository extends BaseRepository<AuditLogEntity> {
    constructor() {
        super("audit_logs");
    }

    public async logEvent(audit: AuditLogEntity): Promise<AuditLogEntity> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO ${this.tableName} (id, workspace_id, actor_id, actor_type, event, resource, result, correlation_id, ip_address, metadata, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    audit.id,
                    audit.workspace_id,
                    audit.actor_id,
                    audit.actor_type,
                    audit.event,
                    audit.resource,
                    audit.result,
                    audit.correlation_id,
                    audit.ip_address || null,
                    audit.metadata || null,
                    audit.created_at
                ]
            );
            return audit;
        } catch (err: any) {
            this.logger.error("Failed to logEvent", { event: audit.event, correlationId: audit.correlation_id }, err);
            throw new InternalServerError("Database insert error on audit_logs", { details: { message: err.message } });
        }
    }

    public async findByCorrelationId(correlationId: string): Promise<AuditLogEntity[]> {
        return this.findAll("correlation_id = ?", [correlationId]);
    }

    public async findByActor(workspaceId: string, actorId: string): Promise<AuditLogEntity[]> {
        return this.findAll("workspace_id = ? AND actor_id = ?", [workspaceId, actorId]);
    }

    public async findByWorkspace(workspaceId: string, limit: number = 100): Promise<AuditLogEntity[]> {
        try {
            const db = await this.db();
            const sql = `SELECT * FROM ${this.tableName} WHERE workspace_id = ? ORDER BY created_at DESC LIMIT ?`;
            const rows = await db.all(sql, [workspaceId, limit]);
            return (rows || []) as AuditLogEntity[];
        } catch (err: any) {
            this.logger.error("Failed to findByWorkspace", { workspaceId, limit }, err);
            throw new InternalServerError("Database query error on audit_logs", { details: { message: err.message } });
        }
    }
}
