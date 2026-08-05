/**
 * PAL AI Governance Policy & Safety Evaluator
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 24 (AI Governance)
 */

import { type AIAgentEntity } from "../../db/repositories/aiAgentRepository.ts";
import { ForbiddenError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:GovernancePolicy");

export interface ActionEvaluationParams {
    agent: AIAgentEntity;
    actionName: string;
    estimatedCost?: number;
    targetResource?: string;
    isHighRisk?: boolean;
    approverId?: string;
}

export interface GovernancePolicyResult {
    allowed: boolean;
    requiresHumanApproval: boolean;
    reason: string;
    policyCode: string;
}

const HIGH_RISK_ACTIONS = new Set([
    "database:drop",
    "user:revoke_role",
    "financial:wire_transfer",
    "connector:delete",
    "security:override"
]);

export class GovernancePolicyEvaluator {
    public evaluateAction(params: ActionEvaluationParams): GovernancePolicyResult {
        const { agent, actionName, estimatedCost = 0, isHighRisk, approverId } = params;

        // Safety Constraint 1: AI cannot approve its own actions
        if (approverId && approverId === agent.id) {
            logger.warn("Security Alert: AI Agent attempted self-approval of action", { agentId: agent.id, actionName });
            throw new ForbiddenError("AI Agents cannot approve their own high-risk actions", {
                details: { errorCode: "GOVERNANCE_SELF_APPROVAL_BLOCKED" }
            });
        }

        // Check High-Risk Actions
        const highRisk = isHighRisk || HIGH_RISK_ACTIONS.has(actionName);
        if (highRisk && !approverId) {
            return {
                allowed: false,
                requiresHumanApproval: true,
                reason: `High-risk action '${actionName}' requires explicit human approval`,
                policyCode: "HIGH_RISK_HUMAN_APPROVAL_REQUIRED"
            };
        }

        // Advisory Authority Level: Can NEVER execute directly
        if (agent.authority_level === "advisory") {
            return {
                allowed: false,
                requiresHumanApproval: true,
                reason: `Agent '${agent.name}' holds Advisory authority; direct action execution prohibited`,
                policyCode: "ADVISORY_TIER_RESTRICTION"
            };
        }

        // Budget Cap Check
        const maxBudget = agent.max_budget_per_action || 1000;
        if (estimatedCost > maxBudget && !approverId) {
            return {
                allowed: false,
                requiresHumanApproval: true,
                reason: `Action cost ($${estimatedCost}) exceeds agent budget limit ($${maxBudget}); requires human approval`,
                policyCode: "BUDGET_CAP_EXCEEDED"
            };
        }

        // Assisted Authority Level: Requires approval above threshold
        if (agent.authority_level === "assisted" && estimatedCost > 500 && !approverId) {
            return {
                allowed: false,
                requiresHumanApproval: true,
                reason: `Assisted authority agent requires approval for actions over $500 threshold`,
                policyCode: "ASSISTED_THRESHOLD_EXCEEDED"
            };
        }

        return {
            allowed: true,
            requiresHumanApproval: false,
            reason: "Action satisfies all AI governance policy rules",
            policyCode: "GOVERNANCE_PASSED"
        };
    }
}
