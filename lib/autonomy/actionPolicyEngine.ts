/**
 * Autonomous Action Policy Engine (PAL-TDD-007, Sprint 20 Milestone 3)
 *
 * Evaluates action execution permissions against level policies, daily domain spend caps,
 * risk classifications (reversible vs irreversible), and Level 4 promotion eligibility rules.
 *
 * Architecture: PAL-ARCH-DOC-039
 */

export type AutonomyActionLevel = 1 | 2 | 3 | 4;
export type DomainCategory = "finance" | "marketing" | "sales" | "operations";
export type ActionRiskClassification = "reversible" | "irreversible";

export interface DomainSpendLimits {
    domain: DomainCategory;
    dailyLimitUSD: number;
    currentDailySpendUSD: number;
}

export interface PolicyEvaluationResult {
    permitted: boolean;
    requiresApproval: boolean;
    reason: string;
    evaluatedLevel: AutonomyActionLevel;
    effectiveSpendLimitUSD: number;
    riskClassification: ActionRiskClassification;
}

export class ActionPolicyEngine {
    private static instance: ActionPolicyEngine;

    // Daily Spend Limits per domain (User Specified for Sprint 20)
    private domainLimits: Map<DomainCategory, number> = new Map([
        ["finance", 2000],
        ["marketing", 5000],
        ["sales", 10000],
        ["operations", 15000]
    ]);

    private currentDailySpend: Map<DomainCategory, number> = new Map([
        ["finance", 0],
        ["marketing", 0],
        ["sales", 0],
        ["operations", 0]
    ]);

    public static getInstance(): ActionPolicyEngine {
        if (!ActionPolicyEngine.instance) {
            ActionPolicyEngine.instance = new ActionPolicyEngine();
        }
        return ActionPolicyEngine.instance;
    }

    public evaluateActionPolicy(params: {
        domain: DomainCategory;
        actionLevel: AutonomyActionLevel;
        estimatedCostUSD: number;
        riskClassification: ActionRiskClassification;
        agentTrustScorePct: number; // 0-100
    }): PolicyEvaluationResult {
        const dailyLimit = this.domainLimits.get(params.domain) || 2000;
        const currentSpend = this.currentDailySpend.get(params.domain) || 0;

        // Level 1: Unlimited Analysis
        if (params.actionLevel === 1) {
            return {
                permitted: true,
                requiresApproval: false,
                reason: "Level 1 Analysis is read-only and always permitted without approval.",
                evaluatedLevel: 1,
                effectiveSpendLimitUSD: Infinity,
                riskClassification: params.riskClassification
            };
        }

        // Level 2: Unlimited Proposals
        if (params.actionLevel === 2) {
            return {
                permitted: true,
                requiresApproval: false,
                reason: "Level 2 Proposals create draft recommendations without side-effects.",
                evaluatedLevel: 2,
                effectiveSpendLimitUSD: Infinity,
                riskClassification: params.riskClassification
            };
        }

        // Level 3: Requires Approval
        if (params.actionLevel === 3) {
            return {
                permitted: true,
                requiresApproval: true,
                reason: "Level 3 Actions require explicit human executive sign-off before execution.",
                evaluatedLevel: 3,
                effectiveSpendLimitUSD: dailyLimit,
                riskClassification: params.riskClassification
            };
        }

        // Level 4: Autonomous Domain Management
        // Rule: Only permitted if historical trust score > 95% AND cost is within daily domain limit AND action is reversible
        if (params.actionLevel === 4) {
            if (params.agentTrustScorePct <= 95) {
                return {
                    permitted: false,
                    requiresApproval: true,
                    reason: `Level 4 Autonomous Execution denied. Agent trust score (${params.agentTrustScorePct}%) is below required 95% threshold. Escalated to Level 3 approval.`,
                    evaluatedLevel: 4,
                    effectiveSpendLimitUSD: dailyLimit,
                    riskClassification: params.riskClassification
                };
            }

            if (params.riskClassification === "irreversible") {
                return {
                    permitted: false,
                    requiresApproval: true,
                    reason: "Level 4 Autonomous Execution denied. Irreversible actions always require human sign-off regardless of trust level.",
                    evaluatedLevel: 4,
                    effectiveSpendLimitUSD: dailyLimit,
                    riskClassification: "irreversible"
                };
            }

            if (currentSpend + params.estimatedCostUSD > dailyLimit) {
                return {
                    permitted: false,
                    requiresApproval: true,
                    reason: `Level 4 Autonomous Execution denied. Action cost ($${params.estimatedCostUSD}) exceeds remaining daily ${params.domain} spend cap ($${dailyLimit - currentSpend}).`,
                    evaluatedLevel: 4,
                    effectiveSpendLimitUSD: dailyLimit,
                    riskClassification: params.riskClassification
                };
            }

            return {
                permitted: true,
                requiresApproval: false,
                reason: `Level 4 Autonomous Execution granted. Trust score (${params.agentTrustScorePct}%) > 95%, within daily spend cap ($${dailyLimit}), and action is reversible.`,
                evaluatedLevel: 4,
                effectiveSpendLimitUSD: dailyLimit,
                riskClassification: params.riskClassification
            };
        }

        return {
            permitted: false,
            requiresApproval: true,
            reason: "Invalid action level specified.",
            evaluatedLevel: params.actionLevel,
            effectiveSpendLimitUSD: 0,
            riskClassification: params.riskClassification
        };
    }

    public recordSpend(domain: DomainCategory, amountUSD: number): void {
        const current = this.currentDailySpend.get(domain) || 0;
        this.currentDailySpend.set(domain, current + amountUSD);
    }

    public resetDailySpend(): void {
        this.currentDailySpend.set("finance", 0);
        this.currentDailySpend.set("marketing", 0);
        this.currentDailySpend.set("sales", 0);
        this.currentDailySpend.set("operations", 0);
    }
}
