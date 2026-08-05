/**
 * PAL Service Account & API Key Manager
 * 
 * Governing Spec: PAL-TDD-001 Chapter 10 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Security)
 */

import crypto from "crypto";
import { getDB } from "../../db.ts";
import { AuditRepository } from "../../db/repositories/auditRepository.ts";
import { UnauthorizedError, ValidationError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:ServiceAccountManager");

export interface ServiceAccount {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    scopes: string[];
    status: "active" | "revoked";
    createdAt: number;
    expiresAt?: number;
}

export interface GeneratedAPIKey {
    rawKey: string; // "pal_sk_..." shown ONLY once upon generation
    keyHash: string;
    prefix: string;
}

export class ServiceAccountManager {
    private auditRepo: AuditRepository;

    constructor(auditRepo?: AuditRepository) {
        this.auditRepo = auditRepo || new AuditRepository();
    }

    public async createServiceAccount(params: {
        workspaceId: string;
        name: string;
        description?: string;
        scopes?: string[];
        ttlDays?: number;
    }): Promise<{ serviceAccount: ServiceAccount; apiKey: GeneratedAPIKey }> {
        if (!params.workspaceId || !params.name) {
            throw new ValidationError("Workspace ID and name are required", { details: { params } });
        }

        const id = `sa_${crypto.randomUUID()}`;
        const now = Date.now();
        const expiresAt = params.ttlDays ? now + params.ttlDays * 86400000 : undefined;
        const scopes = params.scopes || ["read"];

        const apiKey = this.generateAPIKey();

        const db = await getDB();
        await db.run(
            `INSERT INTO service_accounts (id, workspace_id, client_id, name, service_name, description, hashed_secret, scopes, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, params.workspaceId, id, params.name, params.name, params.description || null, apiKey.keyHash, JSON.stringify(scopes), "active", now]
        );

        // Audit Log
        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: params.workspaceId,
            actor_id: id,
            actor_type: "service_account",
            event: "ServiceAccountCreated",
            resource: `/service-accounts/${id}`,
            result: "success",
            correlation_id: `corr_${crypto.randomUUID()}`,
            metadata: JSON.stringify({ name: params.name, keyPrefix: apiKey.prefix }),
            created_at: now
        });

        logger.info("Service Account created successfully", { id, name: params.name, prefix: apiKey.prefix });

        return {
            serviceAccount: {
                id,
                workspaceId: params.workspaceId,
                name: params.name,
                description: params.description,
                scopes,
                status: "active",
                createdAt: now,
                expiresAt
            },
            apiKey
        };
    }

    public generateAPIKey(): GeneratedAPIKey {
        const randomHex = crypto.randomBytes(24).toString("hex");
        const rawKey = `pal_sk_${randomHex}`;
        const prefix = rawKey.substring(0, 10);
        const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

        return { rawKey, keyHash, prefix };
    }

    public async verifyAPIKey(rawKey: string): Promise<{ serviceAccountId: string; workspaceId: string; scopes: string[] }> {
        if (!rawKey || !rawKey.startsWith("pal_sk_")) {
            throw new UnauthorizedError("Invalid API Key format", { details: { rawKey: rawKey ? "invalid_prefix" : "empty" } });
        }

        const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
        const db = await getDB();
        const row = await db.get("SELECT * FROM service_accounts WHERE status = 'active'");

        if (!row) {
            throw new UnauthorizedError("Service Account inactive or key invalid", { details: { errorCode: "AUTH_SERVICE_ACCOUNT_INVALID" } });
        }

        return {
            serviceAccountId: row.id,
            workspaceId: row.workspace_id,
            scopes: typeof row.scopes === "string" ? JSON.parse(row.scopes) : ["read"]
        };
    }

    public async revokeServiceAccount(serviceAccountId: string, revokerId: string): Promise<boolean> {
        const db = await getDB();
        const res = await db.run("UPDATE service_accounts SET status = 'revoked' WHERE id = ?", [serviceAccountId]);
        const revoked = (res.changes || 0) > 0;

        if (revoked) {
            await this.auditRepo.logEvent({
                id: `audit_${crypto.randomUUID()}`,
                workspace_id: "system",
                actor_id: revokerId,
                actor_type: "human",
                event: "ServiceAccountRevoked",
                resource: `/service-accounts/${serviceAccountId}`,
                result: "success",
                correlation_id: `corr_${crypto.randomUUID()}`,
                created_at: Date.now()
            });
        }

        logger.info("Service account revocation completed", { serviceAccountId, revoked });
        return revoked;
    }
}
