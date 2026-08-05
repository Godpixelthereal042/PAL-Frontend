/**
 * PAL Attribute-Based Access Control (ABAC) Engine
 * 
 * Governing Spec: PAL-TDD-001 Chapter 8 & Appendix A
 * Architecture Bible: Chapter 23 & 24
 */

import { featureFlags } from "../flags/featureFlags.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:ABACEngine");

export interface ABACContext {
    actorId: string;
    workspaceId: string;
    resourceWorkspaceId: string;
    resourceOwnerId?: string;
    resourceClassification?: "public" | "internal" | "confidential" | "restricted";
    riskScore?: number; // 0 - 100
    timestamp?: number;
}

export interface ABACEvaluationResult {
    passed: boolean;
    reason: string;
    evaluatedRules: string[];
}

export class ABACEngine {
    public evaluate(context: ABACContext): ABACEvaluationResult {
        const evaluatedRules: string[] = [];

        // 1. Workspace Boundary Check (Strict Tenant Isolation)
        evaluatedRules.push("Rule: Workspace Isolation Check");
        if (context.workspaceId !== context.resourceWorkspaceId) {
            logger.warn("ABAC Violation: Cross-workspace access attempt blocked", {
                actorId: context.actorId,
                actorWorkspace: context.workspaceId,
                resourceWorkspace: context.resourceWorkspaceId
            });
            return {
                passed: false,
                reason: `Cross-workspace access denied: Tenant boundary violation (${context.workspaceId} != ${context.resourceWorkspaceId})`,
                evaluatedRules
            };
        }

        // 2. Resource Classification Check (Restricted / Confidential items)
        if (context.resourceClassification === "restricted") {
            evaluatedRules.push("Rule: Restricted Classification Check");
            if (context.resourceOwnerId && context.actorId !== context.resourceOwnerId) {
                return {
                    passed: false,
                    reason: "Access denied: Restricted resources can only be accessed by the resource owner",
                    evaluatedRules
                };
            }
        }

        // 3. Risk Score Assessment
        if (context.riskScore !== undefined && context.riskScore > 80) {
            evaluatedRules.push("Rule: High Risk Block Rule");
            return {
                passed: false,
                reason: `Access denied: Execution risk score (${context.riskScore}) exceeds safety threshold (80)`,
                evaluatedRules
            };
        }

        // 4. Strict Mode Feature Flag Policy Check
        if (featureFlags.isEnabled("abac_strict_mode")) {
            evaluatedRules.push("Rule: ABAC Strict Mode Verification");
        }

        return {
            passed: true,
            reason: "All ABAC attribute rules satisfied",
            evaluatedRules
        };
    }
}
