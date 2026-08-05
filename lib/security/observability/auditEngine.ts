/**
 * PAL Security Audit & Observability Engine
 * 
 * Governing Spec: PAL-TDD-001 Chapter 13 & Appendix A
 * Architecture Bible: Chapter 23 & 24
 */

import crypto from "crypto";
import { AuditRepository, type AuditLogEntity } from "../../db/repositories/auditRepository.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:AuditEngine");
const AUDIT_SECRET = process.env.AUDIT_SIGNATURE_SECRET || "pal-audit-tamper-proof-secret-2026";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface LogAuditEventParams {
    workspaceId: string;
    actorId: string;
    actorType: "human" | "ai_agent" | "service_account" | "connector" | "plugin";
    event: string; // e.g. "UserLoggedIn", "AccessDenied", "DelegationGranted"
    resource: string;
    result: "success" | "deny" | "allow" | "failure";
    severity?: AuditSeverity;
    correlationId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
}

export interface SecurityTelemetryMetrics {
    totalAuditEvents: number;
    accessDeniedCount: number;
    highRiskEventsCount: number;
    criticalAlertsCount: number;
}

export class AuditEngine {
    private auditRepo: AuditRepository;
    private metrics: SecurityTelemetryMetrics = {
        totalAuditEvents: 0,
        accessDeniedCount: 0,
        highRiskEventsCount: 0,
        criticalAlertsCount: 0
    };

    constructor(auditRepo?: AuditRepository) {
        this.auditRepo = auditRepo || new AuditRepository();
    }

    public async logAuditEvent(params: LogAuditEventParams): Promise<AuditLogEntity & { signature: string }> {
        const id = `audit_${crypto.randomUUID()}`;
        const now = Date.now();
        const correlationId = params.correlationId || `corr_${crypto.randomUUID()}`;
        const severity = params.severity || (params.result === "deny" ? "high" : "low");

        const rawData = `${id}:${params.workspaceId}:${params.actorId}:${params.event}:${params.result}:${now}`;
        const signature = crypto.createHmac("sha256", AUDIT_SECRET).update(rawData).digest("hex");

        const metadataWithSig = {
            ...(params.metadata || {}),
            severity,
            tamperSignature: signature
        };

        const auditEntry: AuditLogEntity = {
            id,
            workspace_id: params.workspaceId,
            actor_id: params.actorId,
            actor_type: params.actorType,
            event: params.event,
            resource: params.resource,
            result: params.result,
            correlation_id: correlationId,
            ip_address: params.ipAddress,
            metadata: JSON.stringify(metadataWithSig),
            created_at: now
        };

        await this.auditRepo.logEvent(auditEntry);

        // Update telemetry metrics
        this.metrics.totalAuditEvents++;
        if (params.result === "deny") this.metrics.accessDeniedCount++;
        if (severity === "high") this.metrics.highRiskEventsCount++;
        if (severity === "critical") this.metrics.criticalAlertsCount++;

        logger.info(`Audit Event [${params.event}] logged`, {
            auditId: id,
            correlationId,
            severity,
            actorId: params.actorId
        });

        return {
            ...auditEntry,
            signature
        };
    }

    public verifyTamperSignature(logEntry: AuditLogEntity, signature: string): boolean {
        const rawData = `${logEntry.id}:${logEntry.workspace_id}:${logEntry.actor_id}:${logEntry.event}:${logEntry.result}:${logEntry.created_at}`;
        const expectedSignature = crypto.createHmac("sha256", AUDIT_SECRET).update(rawData).digest("hex");
        return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"));
    }

    public getTelemetryMetrics(): SecurityTelemetryMetrics {
        return { ...this.metrics };
    }
}
