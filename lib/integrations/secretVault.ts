/**
 * Enterprise Secret Vault (PAL-TDD-004, PAL-ARCH-DOC-027)
 */

import crypto from "crypto";

export interface SecretRecord {
    secretId: string;
    workspaceId: string;
    connectorId: string;
    keyName: string;
    encryptedData: string;
    iv: string;
    authTag: string;
    version: number;
    environment: "sandbox" | "production";
    scopes: string[];
    expiresAt?: number;
    revoked: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface SecretAuditEntry {
    auditId: string;
    secretId: string;
    workspaceId: string;
    action: "create" | "read" | "rotate" | "revoke";
    actorId: string;
    timestamp: number;
}

export class SecretVault {
    private masterKey: Buffer;
    private secretsMap: Map<string, SecretRecord[]> = new Map(); // key: workspaceId:connectorId:keyName
    private auditHistory: SecretAuditEntry[] = [];

    constructor(masterKeyHex?: string) {
        if (masterKeyHex && masterKeyHex.length === 64) {
            this.masterKey = Buffer.from(masterKeyHex, "hex");
        } else {
            this.masterKey = crypto.randomBytes(32);
        }
    }

    private deriveWorkspaceKey(workspaceId: string): Buffer {
        return Buffer.from(crypto.hkdfSync("sha256", this.masterKey, Buffer.from(workspaceId), Buffer.from("pal_secret_vault_v1"), 32));
    }

    async storeSecret(params: {
        workspaceId: string;
        connectorId: string;
        keyName: string;
        secretValue: string;
        environment?: "sandbox" | "production";
        scopes?: string[];
        expiresAt?: number;
        actorId?: string;
    }): Promise<SecretRecord> {
        const { workspaceId, connectorId, keyName, secretValue, environment = "sandbox", scopes = [], expiresAt, actorId = "system" } = params;
        const key = `${workspaceId}:${connectorId}:${keyName}`;
        const versions = this.secretsMap.get(key) || [];
        const newVersion = versions.length + 1;

        const workspaceKey = this.deriveWorkspaceKey(workspaceId);
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", workspaceKey, iv);

        let encrypted = cipher.update(secretValue, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag().toString("hex");

        const secretRecord: SecretRecord = {
            secretId: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            workspaceId,
            connectorId,
            keyName,
            encryptedData: encrypted,
            iv: iv.toString("hex"),
            authTag,
            version: newVersion,
            environment,
            scopes,
            expiresAt,
            revoked: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        versions.push(secretRecord);
        this.secretsMap.set(key, versions);

        this.auditHistory.push({
            auditId: `audit_sec_${Date.now()}`,
            secretId: secretRecord.secretId,
            workspaceId,
            action: newVersion === 1 ? "create" : "rotate",
            actorId,
            timestamp: Date.now()
        });

        return secretRecord;
    }

    async getSecret(workspaceId: string, connectorId: string, keyName: string, actorId = "system"): Promise<string | undefined> {
        const key = `${workspaceId}:${connectorId}:${keyName}`;
        const versions = this.secretsMap.get(key);
        if (!versions || versions.length === 0) return undefined;

        const latest = versions[versions.length - 1];
        if (latest.revoked) return undefined;
        if (latest.expiresAt && Date.now() > latest.expiresAt) return undefined;

        const workspaceKey = this.deriveWorkspaceKey(workspaceId);
        const decipher = crypto.createDecipheriv("aes-256-gcm", workspaceKey, Buffer.from(latest.iv, "hex"));
        decipher.setAuthTag(Buffer.from(latest.authTag, "hex"));

        let decrypted = decipher.update(latest.encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");

        this.auditHistory.push({
            auditId: `audit_sec_${Date.now()}`,
            secretId: latest.secretId,
            workspaceId,
            action: "read",
            actorId,
            timestamp: Date.now()
        });

        return decrypted;
    }

    async revokeSecret(workspaceId: string, connectorId: string, keyName: string, actorId = "system"): Promise<boolean> {
        const key = `${workspaceId}:${connectorId}:${keyName}`;
        const versions = this.secretsMap.get(key);
        if (!versions || versions.length === 0) return false;

        const latest = versions[versions.length - 1];
        latest.revoked = true;
        latest.updatedAt = Date.now();

        this.auditHistory.push({
            auditId: `audit_sec_${Date.now()}`,
            secretId: latest.secretId,
            workspaceId,
            action: "revoke",
            actorId,
            timestamp: Date.now()
        });

        return true;
    }

    maskSecrets(obj: Record<string, any>): Record<string, any> {
        const masked: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
            if (typeof v === "string" && (k.toLowerCase().includes("secret") || k.toLowerCase().includes("token") || k.toLowerCase().includes("key") || k.toLowerCase().includes("pass"))) {
                masked[k] = "[REDACTED_SECRET]";
            } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
                masked[k] = this.maskSecrets(v);
            } else {
                masked[k] = v;
            }
        }
        return masked;
    }

    getAuditHistory(workspaceId: string): SecretAuditEntry[] {
        return this.auditHistory.filter((a) => a.workspaceId === workspaceId);
    }
}
