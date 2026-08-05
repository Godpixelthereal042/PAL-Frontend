/**
 * PAL Connector Authentication & Encryption Engine
 * 
 * Governing Spec: PAL-TDD-001 Chapter 10 & Appendix A
 * Architecture Bible: Chapter 23 & 24
 */

import crypto from "crypto";
import { getDB } from "../../db.ts";
import { AuditRepository } from "../../db/repositories/auditRepository.ts";
import { UnauthorizedError, ValidationError, ForbiddenError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:ConnectorAuthEngine");

const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_SECRET || "pal-default-master-secret-key-32b", "pal-salt", 32);
const ALGORITHM = "aes-256-gcm";

export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scopes: string[];
}

export class ConnectorAuthEngine {
    private auditRepo: AuditRepository;

    constructor(auditRepo?: AuditRepository) {
        this.auditRepo = auditRepo || new AuditRepository();
    }

    public encryptToken(token: string): { encrypted: string; iv: string; authTag: string } {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(token, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag().toString("hex");

        return {
            encrypted,
            iv: iv.toString("hex"),
            authTag
        };
    }

    public decryptToken(encrypted: string, ivHex: string, authTagHex: string): string {
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }

    public async storeConnectorTokens(params: {
        connectorId: string;
        workspaceId: string;
        provider: string;
        tokens: OAuthTokens;
    }): Promise<void> {
        const { encrypted, iv, authTag } = this.encryptToken(params.tokens.accessToken);
        const now = Date.now();

        const db = await getDB();
        await db.run(
            `INSERT INTO connectors (id, workspace_id, type, provider, name, status, config, access_token, auth_type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                params.connectorId,
                params.workspaceId,
                params.provider,
                params.provider,
                `${params.provider} Integration`,
                "connected",
                JSON.stringify({ encrypted, iv, authTag, scopes: params.tokens.scopes }),
                encrypted,
                "oauth2",
                now,
                now
            ]
        );

        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: params.workspaceId,
            actor_id: params.connectorId,
            actor_type: "connector",
            event: "ConnectorTokensStored",
            resource: `/connectors/${params.connectorId}`,
            result: "success",
            correlation_id: `corr_${crypto.randomUUID()}`,
            metadata: JSON.stringify({ provider: params.provider, scopes: params.tokens.scopes }),
            created_at: now
        });

        logger.info("Connector tokens encrypted and stored successfully", { connectorId: params.connectorId, provider: params.provider });
    }

    public async validateConnectorAccess(connectorId: string, requestWorkspaceId: string, requiredScope: string): Promise<boolean> {
        const db = await getDB();
        const connector = await db.get("SELECT * FROM connectors WHERE id = ?", [connectorId]);

        if (!connector) {
            throw new UnauthorizedError("Connector not found", { details: { connectorId } });
        }

        // Enforce Workspace Tenant Isolation
        if (connector.workspace_id !== requestWorkspaceId) {
            logger.warn("Security Violation: Connector cross-workspace access blocked", { connectorId, connectorWorkspace: connector.workspace_id, requestWorkspaceId });
            throw new ForbiddenError("Connector tenant boundary violation", { details: { errorCode: "CONNECTOR_TENANT_VIOLATION" } });
        }

        const config = typeof connector.config === "string" ? JSON.parse(connector.config) : connector.config;
        const scopes: string[] = config.scopes || [];

        return scopes.includes(requiredScope) || scopes.includes("*");
    }
}
