/**
 * Executive Policy Engine (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-033, PAL-ARCH-DOC-039)
 */

import type { ExecutivePolicy } from "./strategyTypes.ts";
import { ExecutivePolicyRepository } from "../db/repositories/governanceRepositories.ts";

export class ExecutivePolicyEngine {
    private policies: Map<string, ExecutivePolicy> = new Map();
    private repo?: ExecutivePolicyRepository;

    constructor(repo?: ExecutivePolicyRepository) {
        this.repo = repo !== undefined ? repo : new ExecutivePolicyRepository();

        // Register default SOP policies
        this.registerPolicy({
            name: "No Friday Evening Deployments",
            version: "v1.0",
            severity: "mandatory",
            owner: "VP Engineering",
            tags: ["engineering", "deployment", "sop"],
            appliesTo: ["engineering"],
            conditions: ["params.dayOfWeek === 'Friday'", "params.hour >= 17"],
            actions: ["block_execution"],
            justification: "Deployments after Friday 5 PM risk unstaffed weekend outages.",
            source: "Company SOP Policy #104",
            enabled: true
        });

        this.registerPolicy({
            name: "High Value Refund Approval",
            version: "v1.0",
            severity: "mandatory",
            owner: "CFO",
            tags: ["finance", "refund", "approval"],
            appliesTo: ["finance"],
            conditions: ["params.amountUSD > 5000"],
            actions: ["require_approval"],
            justification: "Refunds exceeding $5,000 USD require explicit CFO sign-off.",
            source: "Financial Controls SOP #201",
            enabled: true
        });
    }

    registerPolicy(params: Omit<ExecutivePolicy, "id" | "createdAt">): ExecutivePolicy {
        const id = `pol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const policy: ExecutivePolicy = {
            ...params,
            id,
            createdAt: Date.now()
        };
        this.policies.set(id, policy);

        if (this.repo) {
            this.repo.insertEntity({
                id,
                workspace_id: "default_workspace",
                name: policy.name,
                version: policy.version,
                severity: policy.severity,
                owner: policy.owner,
                tags: JSON.stringify(policy.tags),
                applies_to: JSON.stringify(policy.appliesTo),
                conditions: JSON.stringify(policy.conditions),
                actions: JSON.stringify(policy.actions),
                justification: policy.justification,
                source: policy.source,
                enabled: policy.enabled ? 1 : 0,
                expires_at: policy.expiresAt,
                created_at: policy.createdAt
            }).catch(err => console.error("Failed to persist policy", err));
        }

        return policy;
    }

    evaluateTaskPolicies(department: string, actionName: string, params: Record<string, any>): {
        allowed: boolean;
        requiresApproval: boolean;
        applicablePolicies: ExecutivePolicy[];
        violations: string[];
    } {
        const applicablePolicies: ExecutivePolicy[] = [];
        const violations: string[] = [];
        let requiresApproval = false;
        let allowed = true;

        for (const policy of this.policies.values()) {
            if (!policy.enabled) continue;
            if (policy.appliesTo.includes(department) || policy.appliesTo.includes("*")) {
                applicablePolicies.push(policy);

                if (actionName.includes("refund") && params.amountUSD > 5000 && policy.actions.includes("require_approval")) {
                    requiresApproval = true;
                }

                if (actionName.includes("deploy") && params.isFridayEvening && policy.actions.includes("block_execution")) {
                    allowed = false;
                    violations.push(`Policy Violation: [${policy.name}] - ${policy.justification}`);
                }
            }
        }

        return { allowed, requiresApproval, applicablePolicies, violations };
    }

    getPolicies(): ExecutivePolicy[] {
        return Array.from(this.policies.values());
    }
}
