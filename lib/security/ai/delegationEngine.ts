/**
 * PAL AI Executive Delegation Engine
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 24 (AI Governance)
 */

import crypto from "crypto";
import { AuditRepository } from "../../db/repositories/auditRepository.ts";
import { ForbiddenError, ValidationError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:DelegationEngine");

export interface DelegationRecord {
    id: string;
    workspaceId: string;
    delegatorId: string;
    delegateeId: string;
    scope: string; // e.g. "projects:write"
    maxCost?: number;
    parentDelegationId?: string;
    status: "active" | "revoked" | "expired";
    createdAt: number;
    expiresAt: number;
}

export class DelegationEngine {
    private delegations: Map<string, DelegationRecord> = new Map();
    private auditRepo: AuditRepository;

    constructor(auditRepo?: AuditRepository) {
        this.auditRepo = auditRepo || new AuditRepository();
    }

    public async createDelegation(params: {
        workspaceId: string;
        delegatorId: string;
        delegateeId: string;
        scope: string;
        ttlSeconds?: number;
        maxCost?: number;
        parentDelegationId?: string;
    }): Promise<DelegationRecord> {
        const { workspaceId, delegatorId, delegateeId, scope, ttlSeconds = 3600, maxCost, parentDelegationId } = params;

        // Safety Constraint 1: Self-delegation is invalid
        if (delegatorId === delegateeId) {
            throw new ValidationError("Self-delegation is invalid", { details: { delegatorId, delegateeId } });
        }

        // Safety Constraint 2: Detect Circular Delegation Chains (e.g. A -> B -> A)
        this.detectCircularDelegation(delegatorId, delegateeId);

        const id = `del_${crypto.randomUUID()}`;
        const now = Date.now();
        const expiresAt = now + (ttlSeconds * 1000);

        const delegation: DelegationRecord = {
            id,
            workspaceId,
            delegatorId,
            delegateeId,
            scope,
            maxCost,
            parentDelegationId,
            status: "active",
            createdAt: now,
            expiresAt
        };

        this.delegations.set(id, delegation);

        // Audit Log
        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: workspaceId,
            actor_id: delegatorId,
            actor_type: "human",
            event: "DelegationGranted",
            resource: scope,
            result: "success",
            correlation_id: `corr_${crypto.randomUUID()}`,
            metadata: JSON.stringify({ delegateeId, expiresAt, parentDelegationId }),
            created_at: now
        });

        logger.info("Delegation granted successfully", { delegationId: id, delegatorId, delegateeId, scope });
        return delegation;
    }

    public async revokeDelegation(delegationId: string, revokerId: string): Promise<boolean> {
        const delegation = this.delegations.get(delegationId);
        if (!delegation) return false;

        delegation.status = "revoked";
        this.delegations.set(delegationId, delegation);

        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: delegation.workspaceId,
            actor_id: revokerId,
            actor_type: "human",
            event: "DelegationRevoked",
            resource: delegation.scope,
            result: "success",
            correlation_id: `corr_${crypto.randomUUID()}`,
            metadata: JSON.stringify({ delegationId }),
            created_at: Date.now()
        });

        logger.info("Delegation revoked", { delegationId, revokerId });
        return true;
    }

    public validateDelegation(delegationId: string, requiredScope: string): boolean {
        const delegation = this.delegations.get(delegationId);
        if (!delegation) return false;

        if (delegation.status !== "active") return false;
        if (Date.now() > delegation.expiresAt) {
            delegation.status = "expired";
            return false;
        }

        // Scope verification
        if (delegation.scope === "*" || delegation.scope === requiredScope) {
            return true;
        }
        return false;
    }

    private detectCircularDelegation(delegatorId: string, delegateeId: string): void {
        const visited = new Set<string>([delegatorId, delegateeId]);

        for (const [, del] of this.delegations.entries()) {
            if (del.status === "active") {
                if (del.delegatorId === delegateeId && del.delegateeId === delegatorId) {
                    logger.warn("Circular delegation chain detected and rejected", { delegatorId, delegateeId });
                    throw new ForbiddenError("Circular delegation chain detected; delegation request rejected", {
                        details: { errorCode: "GOVERNANCE_CIRCULAR_DELEGATION_BLOCKED" }
                    });
                }
            }
        }
    }
}
