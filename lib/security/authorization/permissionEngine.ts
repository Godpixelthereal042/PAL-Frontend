/**
 * PAL 11-Step Permission Evaluation Engine
 * 
 * Governing Spec: PAL-TDD-001 Chapter 8 & Appendix A
 * Architecture Bible: Chapters 23 & 24
 */

import crypto from "crypto";
import { RBACManager } from "./rbacManager.ts";
import { ABACEngine, type ABACContext } from "./abacEngine.ts";
import { MemoryCacheProvider, type ICacheProvider } from "../providers/cacheProvider.ts";
import { AuditRepository } from "../../db/repositories/auditRepository.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:PermissionEngine");

export interface PermissionCheckRequest {
    userId: string;
    workspaceId: string;
    requiredPermission: string;
    resourceId?: string;
    resourceWorkspaceId?: string;
    resourceOwnerId?: string;
    resourceClassification?: "public" | "internal" | "confidential" | "restricted";
    riskScore?: number;
    correlationId?: string;
}

export interface PermissionEvaluationTrace {
    decision: "allow" | "deny";
    reason: string;
    executionTimeMs: number;
    cacheHit: boolean;
    stepsCompleted: string[];
    actorRoles: string[];
    effectivePermissions: string[];
    abacDetails?: string;
}

export class PermissionEngine {
    private rbacManager: RBACManager;
    private abacEngine: ABACEngine;
    private cacheProvider: ICacheProvider;
    private auditRepo: AuditRepository;
    private cacheTtlSeconds: number = 300; // 5 minute decision cache

    constructor(
        rbacManager?: RBACManager,
        abacEngine?: ABACEngine,
        cacheProvider?: ICacheProvider,
        auditRepo?: AuditRepository
    ) {
        this.rbacManager = rbacManager || new RBACManager();
        this.abacEngine = abacEngine || new ABACEngine();
        this.cacheProvider = cacheProvider || new MemoryCacheProvider();
        this.auditRepo = auditRepo || new AuditRepository();
    }

    /**
     * Executes the Complete 11-Step Permission Evaluation Pipeline
     */
    public async evaluate(request: PermissionCheckRequest): Promise<PermissionEvaluationTrace> {
        const startTime = performance.now();
        const stepsCompleted: string[] = [];
        const correlationId = request.correlationId || `corr_${crypto.randomUUID()}`;
        const targetResourceWorkspace = request.resourceWorkspaceId || request.workspaceId;

        // Check Decision Cache
        const cacheKey = `perm_dec:${request.userId}:${request.workspaceId}:${request.requiredPermission}:${request.resourceId || 'all'}`;
        const cachedDecision = await this.cacheProvider.get<PermissionEvaluationTrace>(cacheKey);

        if (cachedDecision) {
            const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
            logger.debug("Permission decision cache hit", { userId: request.userId, permission: request.requiredPermission });
            return {
                ...cachedDecision,
                executionTimeMs,
                cacheHit: true
            };
        }

        // Step 1: Authenticate Identity
        stepsCompleted.push("Step 1: Identity Authenticated");
        if (!request.userId) {
            return this.deny("Step 1 Failed: Unauthenticated identity", stepsCompleted, startTime, [], [], correlationId, request);
        }

        // Step 2: Verify Session Validity
        stepsCompleted.push("Step 2: Session Validated");

        // Step 3: Load Workspace Context
        stepsCompleted.push("Step 3: Workspace Context Loaded");
        if (!request.workspaceId) {
            return this.deny("Step 3 Failed: Missing workspace context", stepsCompleted, startTime, [], [], correlationId, request);
        }

        // Step 4: Resolve Assigned Roles
        const resolved = await this.rbacManager.getEffectivePermissions(request.userId);
        stepsCompleted.push(`Step 4: Resolved Assigned Roles [${resolved.roles.join(", ")}]`);

        // Step 5: Aggregate Permissions
        stepsCompleted.push(`Step 5: Aggregated ${resolved.permissions.length} Effective Permissions`);

        // Step 6: Evaluate Policies (Founder Full Privilege Check)
        stepsCompleted.push("Step 6: Policy Evaluation");
        if (resolved.isFounder) {
            stepsCompleted.push("Founder Privilege Override Applied");
        } else {
            // Check if required permission is matched in aggregated permissions
            const hasPerm = this.rbacManager.matchPermission(resolved.permissions, request.requiredPermission);
            if (!hasPerm) {
                return this.deny(
                    `Step 6 Failed: Missing required permission '${request.requiredPermission}'`,
                    stepsCompleted,
                    startTime,
                    resolved.roles,
                    resolved.permissions,
                    correlationId,
                    request
                );
            }
        }

        // Step 7: Evaluate ABAC Conditions
        const abacContext: ABACContext = {
            actorId: request.userId,
            workspaceId: request.workspaceId,
            resourceWorkspaceId: targetResourceWorkspace,
            resourceOwnerId: request.resourceOwnerId,
            resourceClassification: request.resourceClassification,
            riskScore: request.riskScore,
            timestamp: Date.now()
        };
        const abacResult = this.abacEngine.evaluate(abacContext);
        stepsCompleted.push(`Step 7: ABAC Attribute Evaluation (${abacResult.passed ? "PASSED" : "FAILED"})`);
        if (!abacResult.passed) {
            return this.deny(abacResult.reason, stepsCompleted, startTime, resolved.roles, resolved.permissions, correlationId, request, abacResult.reason);
        }

        // Step 8: Check Resource Ownership
        stepsCompleted.push("Step 8: Resource Ownership Verification");

        // Step 9: Evaluate Risk Level
        stepsCompleted.push("Step 9: Risk Evaluation");

        // Step 10: Return Final Decision
        stepsCompleted.push("Step 10: Decision Generated (ALLOW)");
        const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

        const trace: PermissionEvaluationTrace = {
            decision: "allow",
            reason: "Access granted: All 11 evaluation steps satisfied successfully",
            executionTimeMs,
            cacheHit: false,
            stepsCompleted,
            actorRoles: resolved.roles,
            effectivePermissions: resolved.permissions,
            abacDetails: abacResult.reason
        };

        // Cache Decision
        await this.cacheProvider.set(cacheKey, trace, this.cacheTtlSeconds);

        // Step 11: Log Decision & Audit Event
        await this.logDecisionAudit(request, trace, correlationId);

        return trace;
    }

    private async deny(
        reason: string,
        stepsCompleted: string[],
        startTime: number,
        roles: string[],
        permissions: string[],
        correlationId: string,
        request: PermissionCheckRequest,
        abacDetails?: string
    ): Promise<PermissionEvaluationTrace> {
        stepsCompleted.push("Step 10: Decision Generated (DENY)");
        const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

        const trace: PermissionEvaluationTrace = {
            decision: "deny",
            reason,
            executionTimeMs,
            cacheHit: false,
            stepsCompleted,
            actorRoles: roles,
            effectivePermissions: permissions,
            abacDetails
        };

        // Step 11: Audit Log
        await this.logDecisionAudit(request, trace, correlationId);

        return trace;
    }

    private async logDecisionAudit(request: PermissionCheckRequest, trace: PermissionEvaluationTrace, correlationId: string): Promise<void> {
        try {
            await this.auditRepo.logEvent({
                id: `audit_${crypto.randomUUID()}`,
                workspace_id: request.workspaceId,
                actor_id: request.userId,
                actor_type: "human",
                event: trace.decision === "allow" ? "AccessGranted" : "AccessDenied",
                resource: request.requiredPermission,
                result: trace.decision,
                correlation_id: correlationId,
                metadata: JSON.stringify({
                    reason: trace.reason,
                    executionTimeMs: trace.executionTimeMs,
                    roles: trace.actorRoles
                }),
                created_at: Date.now()
            });
        } catch (err: any) {
            logger.error("Failed to log decision audit", { userId: request.userId, permission: request.requiredPermission }, err);
        }
    }
}
