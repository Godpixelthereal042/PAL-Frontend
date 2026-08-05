/**
 * PAL Token Provider Abstraction & JWT Implementation
 * 
 * Governing Spec: PAL-TDD-001 Chapter 7 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import jwt from "jsonwebtoken";
import { palConfig } from "../../core/config.ts";
import { UnauthorizedError, InternalServerError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:TokenProvider");

export interface AccessTokenPayload {
    sub: string;           // User ID
    workspaceId: string;   // Workspace ID
    email: string;         // User Email
    roles: string[];       // Role names/keys
    permissions: string[]; // Effective permission keys
    sessionId: string;     // Active Session ID
    correlationId: string; // Request Correlation ID
    iat?: number;
    exp?: number;
}

export interface ITokenProvider {
    generateAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): Promise<string>;
    verifyAccessToken(token: string): Promise<AccessTokenPayload>;
    decodeAccessToken(token: string): AccessTokenPayload | null;
}

export class JWTTokenProvider implements ITokenProvider {
    private secretKey: string;
    private expiresInSeconds: number;

    constructor(secretKey?: string, expiresInSeconds: number = 900) { // 15 minutes default
        this.secretKey = secretKey || palConfig.auth.jwtSecret || "default-pal-secret-key-change-in-production";
        this.expiresInSeconds = expiresInSeconds;
    }

    public async generateAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): Promise<string> {
        try {
            const token = jwt.sign(payload, this.secretKey, {
                expiresIn: this.expiresInSeconds,
                algorithm: "HS256"
            });
            return token;
        } catch (err: any) {
            logger.error("Failed to generate access token", { userId: payload.sub }, err);
            throw new InternalServerError("Token generation error", { details: { message: err.message } });
        }
    }

    public async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        try {
            const decoded = jwt.verify(token, this.secretKey, { algorithms: ["HS256"] }) as AccessTokenPayload;
            return decoded;
        } catch (err: any) {
            logger.warn("Token verification failed", { error: err.message });
            if (err.name === "TokenExpiredError") {
                throw new UnauthorizedError("Access token has expired", { details: { errorCode: "AUTH_TOKEN_EXPIRED" } });
            }
            throw new UnauthorizedError("Invalid access token", { details: { errorCode: "AUTH_INVALID_TOKEN" } });
        }
    }

    public decodeAccessToken(token: string): AccessTokenPayload | null {
        try {
            const decoded = jwt.decode(token) as AccessTokenPayload;
            return decoded || null;
        } catch {
            return null;
        }
    }
}
