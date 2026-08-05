/**
 * Resource Allocation Engine (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-032, PAL-ARCH-DOC-039)
 */

import type { DepartmentBudget, DepartmentType, ResourcePoolStatus } from "./schedulerTypes.ts";
import { DepartmentBudgetRepository } from "../db/repositories/governanceRepositories.ts";

export class ResourceAllocationEngine {
    private budgets: Map<DepartmentType, DepartmentBudget> = new Map();
    private usage: Map<DepartmentType, ResourcePoolStatus> = new Map();
    private repo?: DepartmentBudgetRepository;

    constructor(repo?: DepartmentBudgetRepository) {
        this.repo = repo !== undefined ? repo : new DepartmentBudgetRepository();

        // Initialize default departmental budgets
        const defaultDepartments: DepartmentType[] = ["engineering", "finance", "marketing", "sales", "hr", "general"];
        defaultDepartments.forEach((dept) => {
            this.budgets.set(dept, {
                department: dept,
                capitalUSD: 50000,
                aiTokensQuota: 10000000,
                humanHoursQuota: 100,
                computeNodesQuota: 10,
                apiRateLimitQuota: 5000
            });
            this.usage.set(dept, {
                department: dept,
                usedCapitalUSD: 0,
                usedAiTokens: 0,
                usedHumanHours: 0,
                usedComputeNodes: 0,
                usedApiRequests: 0
            });
        });
    }

    setDepartmentBudget(budget: DepartmentBudget): void {
        this.budgets.set(budget.department, budget);

        if (this.repo) {
            const usage = this.usage.get(budget.department);
            this.repo.upsertEntity({
                id: `budget_${budget.department}`,
                workspace_id: "default_workspace",
                department: budget.department,
                capital_usd: budget.capitalUSD,
                ai_tokens_quota: budget.aiTokensQuota,
                human_hours_quota: budget.humanHoursQuota,
                compute_nodes_quota: budget.computeNodesQuota,
                api_rate_limit_quota: budget.apiRateLimitQuota,
                used_capital_usd: usage?.usedCapitalUSD || 0,
                used_ai_tokens: usage?.usedAiTokens || 0,
                used_human_hours: usage?.usedHumanHours || 0,
                used_compute_nodes: usage?.usedComputeNodes || 0,
                used_api_requests: usage?.usedApiRequests || 0,
                period_start: Date.now()
            }).catch(err => console.error("Failed to persist budget", err));
        }
    }

    getDepartmentBudget(department: DepartmentType): DepartmentBudget | undefined {
        return this.budgets.get(department);
    }

    getDepartmentUsage(department: DepartmentType): ResourcePoolStatus | undefined {
        return this.usage.get(department);
    }

    canAllocate(department: DepartmentType, params: { capitalUSD?: number; aiTokens?: number; humanHours?: number; computeNodes?: number; apiRequests?: number }): boolean {
        const budget = this.budgets.get(department);
        const currentUsage = this.usage.get(department);
        if (!budget || !currentUsage) return false;

        if (params.capitalUSD && (currentUsage.usedCapitalUSD + params.capitalUSD > budget.capitalUSD)) return false;
        if (params.aiTokens && (currentUsage.usedAiTokens + params.aiTokens > budget.aiTokensQuota)) return false;
        if (params.humanHours && (currentUsage.usedHumanHours + params.humanHours > budget.humanHoursQuota)) return false;
        if (params.computeNodes && (currentUsage.usedComputeNodes + params.computeNodes > budget.computeNodesQuota)) return false;
        if (params.apiRequests && (currentUsage.usedApiRequests + params.apiRequests > budget.apiRateLimitQuota)) return false;

        return true;
    }

    allocateResource(department: DepartmentType, params: { capitalUSD?: number; aiTokens?: number; humanHours?: number; computeNodes?: number; apiRequests?: number }): boolean {
        if (!this.canAllocate(department, params)) return false;

        const currentUsage = this.usage.get(department)!;
        if (params.capitalUSD) currentUsage.usedCapitalUSD += params.capitalUSD;
        if (params.aiTokens) currentUsage.usedAiTokens += params.aiTokens;
        if (params.humanHours) currentUsage.usedHumanHours += params.humanHours;
        if (params.computeNodes) currentUsage.usedComputeNodes += params.computeNodes;
        if (params.apiRequests) currentUsage.usedApiRequests += params.apiRequests;

        return true;
    }

    resetUsage(department?: DepartmentType): void {
        if (department) {
            const currentUsage = this.usage.get(department);
            if (currentUsage) {
                currentUsage.usedCapitalUSD = 0;
                currentUsage.usedAiTokens = 0;
                currentUsage.usedHumanHours = 0;
                currentUsage.usedComputeNodes = 0;
                currentUsage.usedApiRequests = 0;
            }
        } else {
            for (const currentUsage of this.usage.values()) {
                currentUsage.usedCapitalUSD = 0;
                currentUsage.usedAiTokens = 0;
                currentUsage.usedHumanHours = 0;
                currentUsage.usedComputeNodes = 0;
                currentUsage.usedApiRequests = 0;
            }
        }
    }
}
