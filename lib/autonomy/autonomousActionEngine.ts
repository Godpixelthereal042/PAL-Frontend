/**
 * PAL Autonomous Action Engine (PAL-TDD-007, Sprint 20 Milestone 3)
 *
 * Executes business operations within strict trust boundaries, manages rollback plans,
 * produces cryptographic AI Decision Passports, and logs execution audit trails.
 *
 * Architecture: PAL-ARCH-DOC-039
 */

import type { ExecutiveAgentRole } from "../agents/executiveAgentCouncil.ts";
import { ActionPolicyEngine } from "./actionPolicyEngine.ts";
import type { AutonomyActionLevel, DomainCategory, ActionRiskClassification } from "./actionPolicyEngine.ts";
import { AIDecisionPassportEngine } from "../trust/aiDecisionPassport.ts";

export interface AutonomousActionRequest {
    actionId: string;
    agentRole: ExecutiveAgentRole;
    domain: DomainCategory;
    actionLevel: AutonomyActionLevel;
    title: string;
    description: string;
    estimatedCostUSD: number;
    riskClassification: ActionRiskClassification;
    rollbackPlan: string;
    agentTrustScorePct: number;
}

export interface AutonomousActionExecutionResult {
    actionId: string;
    status: "executed" | "queued_for_approval" | "rejected";
    executedAutonomously: boolean;
    requiresHumanSignoff: boolean;
    policyReason: string;
    rollbackRegistered: boolean;
    passportId?: string;
    executedAt: number;
}

export class AutonomousActionEngine {
    private static instance: AutonomousActionEngine;
    private policyEngine = ActionPolicyEngine.getInstance();
    private passportEngine = AIDecisionPassportEngine.getInstance();
    private rollbackRegistry: Map<string, string> = new Map(); // actionId -> rollbackPlan
    private actionLog: AutonomousActionExecutionResult[] = [];

    public static getInstance(): AutonomousActionEngine {
        if (!AutonomousActionEngine.instance) {
            AutonomousActionEngine.instance = new AutonomousActionEngine();
        }
        return AutonomousActionEngine.instance;
    }

    public executeAction(req: AutonomousActionRequest, workspaceId = "ws_demo_company"): AutonomousActionExecutionResult {
        const timestamp = Date.now();

        // 1. Evaluate policy
        const policy = this.policyEngine.evaluateActionPolicy({
            domain: req.domain,
            actionLevel: req.actionLevel,
            estimatedCostUSD: req.estimatedCostUSD,
            riskClassification: req.riskClassification,
            agentTrustScorePct: req.agentTrustScorePct
        });

        // 2. Queue for approval if required or not permitted autonomously
        if (policy.requiresApproval || !policy.permitted) {
            const queuedResult: AutonomousActionExecutionResult = {
                actionId: req.actionId,
                status: "queued_for_approval",
                executedAutonomously: false,
                requiresHumanSignoff: true,
                policyReason: policy.reason,
                rollbackRegistered: false,
                executedAt: timestamp
            };
            this.actionLog.push(queuedResult);
            return queuedResult;
        }

        // 3. Register Rollback Plan for side-effecting actions (Level 3 & 4)
        if (req.actionLevel >= 3) {
            this.rollbackRegistry.set(req.actionId, req.rollbackPlan);
        }

        // 4. Record spend if cost > 0
        if (req.estimatedCostUSD > 0) {
            this.policyEngine.recordSpend(req.domain, req.estimatedCostUSD);
        }

        // 5. Issue cryptographic AI Decision Passport
        const passport = this.passportEngine.issuePassport({
            decisionId: req.actionId,
            workspaceId,
            actionSummary: `${req.agentRole.toUpperCase()}: ${req.title}`,
            whyPALDidThis: req.description,
            dataInfluences: [`Domain:${req.domain}`, `ActionLevel:${req.actionLevel}`, `TrustScore:${req.agentTrustScorePct}%`],
            alternativesConsidered: ["Defer execution to manual human review", "Request lower-cost vendor quote"],
            approvedByUserId: "autonomous_policy_engine",
            approvalRole: "Autonomous Policy Engine"
        });

        const executedResult: AutonomousActionExecutionResult = {
            actionId: req.actionId,
            status: "executed",
            executedAutonomously: true,
            requiresHumanSignoff: false,
            policyReason: policy.reason,
            rollbackRegistered: req.actionLevel >= 3,
            passportId: passport.passportId,
            executedAt: timestamp
        };

        this.actionLog.push(executedResult);
        return executedResult;
    }

    public rollbackAction(actionId: string): { success: boolean; rollbackPlan?: string } {
        const plan = this.rollbackRegistry.get(actionId);
        if (!plan) {
            return { success: false };
        }
        this.rollbackRegistry.delete(actionId);
        return { success: true, rollbackPlan: plan };
    }

    public getActionHistory(): AutonomousActionExecutionResult[] {
        return [...this.actionLog];
    }
}
