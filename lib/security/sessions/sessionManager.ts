/**
 * PAL Session Manager & Refresh Token Rotation (RTR)
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import crypto from "crypto";
import { SessionRepository, type SessionEntity } from "../../db/repositories/sessionRepository.ts";
import { UnauthorizedError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:SessionManager");

export interface CreateSessionParams {
    userId: string;
    workspaceId: string;
    device?: string;
    ipAddress?: string;
    userAgent?: string;
    ttlDays?: number;
}

export interface RefreshResult {
    sessionId: string;
    userId: string;
    workspaceId: string;
    newRefreshToken: string;
}

export class SessionManager {
    private sessionRepo: SessionRepository;
    private defaultTtlDays: number = 30;

    constructor(sessionRepo?: SessionRepository) {
        this.sessionRepo = sessionRepo || new SessionRepository();
    }

    public async createSession(params: CreateSessionParams): Promise<SessionEntity> {
        const sessionId = `sess_${crypto.randomUUID()}`;
        const refreshToken = `rt_${crypto.randomBytes(32).toString("hex")}`;
        const ttl = (params.ttlDays || this.defaultTtlDays) * 86400 * 1000;
        const now = Date.now();

        const session: SessionEntity = {
            id: sessionId,
            user_id: params.userId,
            workspace_id: params.workspaceId,
            refresh_token: refreshToken,
            device: params.device,
            ip_address: params.ipAddress,
            user_agent: params.userAgent,
            expires_at: now + ttl,
            last_activity: now,
            status: "active"
        };

        await this.sessionRepo.createSession(session);
        logger.info("New session created", { sessionId, userId: params.userId });
        return session;
    }

    public async validateSession(sessionId: string): Promise<SessionEntity> {
        const session = await this.sessionRepo.findById(sessionId);
        if (!session || session.status !== "active") {
            throw new UnauthorizedError("Session is invalid or revoked", { details: { sessionId } });
        }

        if (Date.now() > session.expires_at) {
            await this.sessionRepo.updateStatus(sessionId, "expired");
            throw new UnauthorizedError("Session has expired", { details: { sessionId } });
        }

        return session;
    }

    /**
     * Refresh Session Token with Refresh Token Rotation (RTR).
     * Revokes old token and issues new refresh token. If reuse is detected, revokes all user sessions.
     */
    public async refreshSessionToken(refreshToken: string): Promise<RefreshResult> {
        const session = await this.sessionRepo.findByRefreshToken(refreshToken);

        if (!session) {
            logger.warn("Reused or non-existent refresh token attempt", { refreshToken: refreshToken.slice(0, 8) });
            throw new UnauthorizedError("Invalid or expired refresh token", { details: { errorCode: "AUTH_REFRESH_EXPIRED" } });
        }

        if (session.status === "revoked") {
            logger.error("Token reuse detected on revoked session! Revoking all user sessions for safety.", {
                userId: session.user_id,
                sessionId: session.id
            });
            await this.sessionRepo.revokeAllUserSessions(session.user_id);
            throw new UnauthorizedError("Security violation: Refresh token reuse detected. All sessions revoked.", {
                details: { errorCode: "AUTH_TOKEN_REUSE_DETECTED" }
            });
        }

        if (Date.now() > session.expires_at) {
            await this.sessionRepo.updateStatus(session.id, "expired");
            throw new UnauthorizedError("Refresh token expired", { details: { errorCode: "AUTH_REFRESH_EXPIRED" } });
        }

        // Issue new refresh token & rotate
        const newRefreshToken = `rt_${crypto.randomBytes(32).toString("hex")}`;
        const now = Date.now();

        await this.sessionRepo.updateStatus(session.id, "revoked"); // Mark previous refresh token revoked

        const newSession = await this.createSession({
            userId: session.user_id,
            workspaceId: session.workspace_id,
            device: session.device,
            ipAddress: session.ip_address,
            userAgent: session.user_agent
        });

        logger.info("Refresh Token Rotation completed", { oldSessionId: session.id, newSessionId: newSession.id });

        return {
            sessionId: newSession.id,
            userId: newSession.user_id,
            workspaceId: newSession.workspace_id,
            newRefreshToken: newSession.refresh_token
        };
    }

    public async revokeSession(sessionId: string): Promise<boolean> {
        return this.sessionRepo.updateStatus(sessionId, "revoked");
    }

    public async revokeAllUserSessions(userId: string): Promise<number> {
        return this.sessionRepo.revokeAllUserSessions(userId);
    }
}
