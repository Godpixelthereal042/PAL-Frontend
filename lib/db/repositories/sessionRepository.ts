/**
 * PAL Session Repository
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import { BaseRepository } from "../baseRepository.ts";
import { InternalServerError } from "../../core/errors.ts";

export interface SessionEntity {
    id: string;
    user_id: string;
    workspace_id: string;
    refresh_token: string;
    device?: string;
    ip_address?: string;
    user_agent?: string;
    expires_at: number;
    last_activity: number;
    status: "active" | "revoked" | "expired";
}

export class SessionRepository extends BaseRepository<SessionEntity> {
    constructor() {
        super("sessions");
    }

    public async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
        try {
            const db = await this.db();
            const row = await db.get(`SELECT * FROM ${this.tableName} WHERE refresh_token = ?`, [refreshToken]);
            return row ? (row as SessionEntity) : null;
        } catch (err: any) {
            this.logger.error("Failed to findByRefreshToken", { refreshToken: refreshToken.slice(0, 8) + "..." }, err);
            throw new InternalServerError("Database query error on sessions", { details: { message: err.message } });
        }
    }

    public async findActiveUserSessions(userId: string): Promise<SessionEntity[]> {
        return this.findAll("user_id = ? AND status = 'active'", [userId]);
    }

    public async createSession(session: SessionEntity): Promise<SessionEntity> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO ${this.tableName} (id, user_id, workspace_id, refresh_token, device, ip_address, user_agent, expires_at, last_activity, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    session.id,
                    session.user_id,
                    session.workspace_id,
                    session.refresh_token,
                    session.device || null,
                    session.ip_address || null,
                    session.user_agent || null,
                    session.expires_at,
                    session.last_activity,
                    session.status
                ]
            );
            return session;
        } catch (err: any) {
            this.logger.error("Failed to createSession", { sessionId: session.id }, err);
            throw new InternalServerError("Database insert error on sessions", { details: { message: err.message } });
        }
    }

    public async updateStatus(sessionId: string, status: "active" | "revoked" | "expired"): Promise<boolean> {
        try {
            const db = await this.db();
            const res = await db.run(`UPDATE ${this.tableName} SET status = ?, last_activity = ? WHERE id = ?`, [
                status,
                Date.now(),
                sessionId
            ]);
            return (res.changes || 0) > 0;
        } catch (err: any) {
            this.logger.error("Failed to updateStatus", { sessionId, status }, err);
            throw new InternalServerError("Database update error on sessions", { details: { message: err.message } });
        }
    }

    public async revokeAllUserSessions(userId: string): Promise<number> {
        try {
            const db = await this.db();
            const res = await db.run(`UPDATE ${this.tableName} SET status = 'revoked', last_activity = ? WHERE user_id = ? AND status = 'active'`, [
                Date.now(),
                userId
            ]);
            return res.changes || 0;
        } catch (err: any) {
            this.logger.error("Failed to revokeAllUserSessions", { userId }, err);
            throw new InternalServerError("Database revoke error on sessions", { details: { message: err.message } });
        }
    }
}
