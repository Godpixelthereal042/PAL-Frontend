/**
 * PAL Trust Evolution Engine (PAL-TDD-007, Sprint 20 Milestone 4)
 *
 * Tracks historical execution outcomes, computes dynamic agent trust scores,
 * manages automatic autonomy level promotions (L3 -> L4) and demotions,
 * and maintains the CEO Preference Model derived from executive human overrides.
 *
 * Architecture: PAL-ARCH-DOC-040
 */

import type { ExecutiveAgentRole } from "../agents/executiveAgentCouncil.ts";
import type { DomainCategory, AutonomyActionLevel } from "../autonomy/actionPolicyEngine.ts";

export interface AgentTrustProfile {
    agentRole: ExecutiveAgentRole;
    domain: DomainCategory;
    currentAutonomyLevel: AutonomyActionLevel;
    totalActionsExecuted: number;
    approvedActionsCount: number;
    rejectedActionsCount: number;
    successRatePct: number;        // 0.0 - 100.0
    trustScore: number;            // 0.0 - 100.0
    isEligibleForL4Promotion: boolean;
    lastEvaluatedAt: number;
}

export interface ExecutiveOverride {
    overrideId: string;
    decisionId: string;
    agentRole: ExecutiveAgentRole;
    originalRecommendation: string;
    ceoOverrideAction: string;
    perceivedStrategicIntent: "growth_preservation" | "cost_reduction" | "risk_mitigation" | "velocity_acceleration";
    outcomeSummary?: string;
    timestamp: number;
}

export class TrustEvolutionEngine {
    private static instance: TrustEvolutionEngine;
    private profiles: Map<ExecutiveAgentRole, AgentTrustProfile> = new Map();
    private ceoOverrides: ExecutiveOverride[] = [];

    constructor() {
        this.initializeDefaultProfiles();
    }

    public static getInstance(): TrustEvolutionEngine {
        if (!TrustEvolutionEngine.instance) {
            TrustEvolutionEngine.instance = new TrustEvolutionEngine();
        }
        return TrustEvolutionEngine.instance;
    }

    private initializeDefaultProfiles(): void {
        const defaults: AgentTrustProfile[] = [
            {
                agentRole: "ceo",
                domain: "operations",
                currentAutonomyLevel: 4,
                totalActionsExecuted: 120,
                approvedActionsCount: 118,
                rejectedActionsCount: 2,
                successRatePct: 98.3,
                trustScore: 98.3,
                isEligibleForL4Promotion: true,
                lastEvaluatedAt: Date.now()
            },
            {
                agentRole: "cfo",
                domain: "finance",
                currentAutonomyLevel: 3,
                totalActionsExecuted: 45,
                approvedActionsCount: 41,
                rejectedActionsCount: 4,
                successRatePct: 91.1,
                trustScore: 91.1,
                isEligibleForL4Promotion: false,
                lastEvaluatedAt: Date.now()
            },
            {
                agentRole: "cro",
                domain: "sales",
                currentAutonomyLevel: 3,
                totalActionsExecuted: 60,
                approvedActionsCount: 58,
                rejectedActionsCount: 2,
                successRatePct: 96.7,
                trustScore: 96.7,
                isEligibleForL4Promotion: true,
                lastEvaluatedAt: Date.now()
            },
            {
                agentRole: "coo",
                domain: "operations",
                currentAutonomyLevel: 3,
                totalActionsExecuted: 30,
                approvedActionsCount: 30,
                rejectedActionsCount: 0,
                successRatePct: 100.0,
                trustScore: 100.0,
                isEligibleForL4Promotion: true,
                lastEvaluatedAt: Date.now()
            }
        ];

        for (const p of defaults) {
            this.profiles.set(p.agentRole, p);
        }
    }

    public recordActionOutcome(agentRole: ExecutiveAgentRole, wasApproved: boolean): AgentTrustProfile {
        const profile = this.profiles.get(agentRole) || {
            agentRole,
            domain: "operations",
            currentAutonomyLevel: 2,
            totalActionsExecuted: 0,
            approvedActionsCount: 0,
            rejectedActionsCount: 0,
            successRatePct: 0,
            trustScore: 0,
            isEligibleForL4Promotion: false,
            lastEvaluatedAt: Date.now()
        };

        profile.totalActionsExecuted += 1;
        if (wasApproved) {
            profile.approvedActionsCount += 1;
        } else {
            profile.rejectedActionsCount += 1;
        }

        profile.successRatePct = Math.round((profile.approvedActionsCount / profile.totalActionsExecuted) * 1000) / 10;
        profile.trustScore = profile.successRatePct;
        profile.lastEvaluatedAt = Date.now();

        // Level 4 Promotion Criteria: Total actions >= 20 AND successRatePct >= 95.0%
        profile.isEligibleForL4Promotion = profile.totalActionsExecuted >= 20 && profile.successRatePct >= 95.0;

        // Auto-promote to L4 if eligible and currently L3
        if (profile.isEligibleForL4Promotion && profile.currentAutonomyLevel === 3) {
            profile.currentAutonomyLevel = 4;
        }

        // Auto-demote from L4 to L3 if success rate falls below 90%
        if (profile.currentAutonomyLevel === 4 && profile.successRatePct < 90.0) {
            profile.currentAutonomyLevel = 3;
            profile.isEligibleForL4Promotion = false;
        }

        this.profiles.set(agentRole, profile);
        return profile;
    }

    public recordCEOOverride(params: {
        decisionId: string;
        agentRole: ExecutiveAgentRole;
        originalRecommendation: string;
        ceoOverrideAction: string;
        perceivedStrategicIntent: ExecutiveOverride["perceivedStrategicIntent"];
    }): ExecutiveOverride {
        const override: ExecutiveOverride = {
            overrideId: `ovr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            decisionId: params.decisionId,
            agentRole: params.agentRole,
            originalRecommendation: params.originalRecommendation,
            ceoOverrideAction: params.ceoOverrideAction,
            perceivedStrategicIntent: params.perceivedStrategicIntent,
            timestamp: Date.now()
        };

        this.ceoOverrides.push(override);
        return override;
    }

    public getTrustProfile(agentRole: ExecutiveAgentRole): AgentTrustProfile | undefined {
        return this.profiles.get(agentRole);
    }

    public getCEOPreferenceModel(): {
        dominantStrategicIntent: ExecutiveOverride["perceivedStrategicIntent"];
        totalOverridesRecorded: number;
        overrides: ExecutiveOverride[];
    } {
        if (this.ceoOverrides.length === 0) {
            return {
                dominantStrategicIntent: "growth_preservation",
                totalOverridesRecorded: 0,
                overrides: []
            };
        }

        const counts: Record<ExecutiveOverride["perceivedStrategicIntent"], number> = {
            growth_preservation: 0,
            cost_reduction: 0,
            risk_mitigation: 0,
            velocity_acceleration: 0
        };

        for (const ovr of this.ceoOverrides) {
            counts[ovr.perceivedStrategicIntent] += 1;
        }

        let dominant: ExecutiveOverride["perceivedStrategicIntent"] = "growth_preservation";
        let maxCount = -1;

        for (const [intent, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                dominant = intent as ExecutiveOverride["perceivedStrategicIntent"];
            }
        }

        return {
            dominantStrategicIntent: dominant,
            totalOverridesRecorded: this.ceoOverrides.length,
            overrides: [...this.ceoOverrides]
        };
    }
}
