/**
 * Executive Scheduler Engine (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-032, PAL-ARCH-DOC-039)
 */

import { ResourceAllocationEngine } from "./resourceAllocationEngine.ts";
import type { ScheduledTaskItem } from "./schedulerTypes.ts";
import { ScheduledTaskRepository } from "../db/repositories/governanceRepositories.ts";

export class ExecutiveScheduler {
    private resourceEngine: ResourceAllocationEngine;
    private queue: ScheduledTaskItem[] = [];
    private repo?: ScheduledTaskRepository;

    constructor(resourceEngine?: ResourceAllocationEngine, repo?: ScheduledTaskRepository) {
        this.resourceEngine = resourceEngine || new ResourceAllocationEngine();
        this.repo = repo !== undefined ? repo : new ScheduledTaskRepository();
    }

    calculateEconomicPriority(task: ScheduledTaskItem): number {
        const totalCost = task.tokenCostUSD + task.computeCostUSD + (task.riskScore * 0.05) + 0.001;
        const netBenefit = task.expectedBenefitUSD * task.confidence;
        const epr = (netBenefit / totalCost) * task.reversibilityScore;
        return Number(epr.toFixed(4));
    }

    enqueueTask(task: ScheduledTaskItem): ScheduledTaskItem {
        const epr = this.calculateEconomicPriority(task);
        const item: ScheduledTaskItem = {
            ...task,
            economicPriorityRating: epr
        };
        this.queue.push(item);
        this.sortQueue();

        if (this.repo) {
            this.repo.upsertEntity({
                id: item.taskId,
                workspace_id: "default_workspace",
                task_name: item.taskName,
                department: item.department,
                priority_class: item.priorityClass,
                expected_benefit_usd: item.expectedBenefitUSD,
                token_cost_usd: item.tokenCostUSD,
                compute_cost_usd: item.computeCostUSD,
                risk_score: item.riskScore,
                confidence: item.confidence,
                reversibility_score: item.reversibilityScore,
                economic_priority_rating: epr,
                prerequisites: JSON.stringify(item.prerequisites || []),
                status: "queued",
                created_at: item.createdAt || Date.now()
            }).catch(err => console.error("Failed to persist scheduled task", err));
        }

        return item;
    }

    private sortQueue(): void {
        const classRank = {
            critical_path: 4,
            high_roi: 3,
            routine: 2,
            background_maintenance: 1
        };

        this.queue.sort((a, b) => {
            const rankDiff = (classRank[b.priorityClass] || 0) - (classRank[a.priorityClass] || 0);
            if (rankDiff !== 0) return rankDiff;
            return (b.economicPriorityRating || 0) - (a.economicPriorityRating || 0);
        });
    }

    getNextExecutableTask(): ScheduledTaskItem | undefined {
        for (let i = 0; i < this.queue.length; i++) {
            const task = this.queue[i];

            // Check if department has available resource capacity
            const canRun = this.resourceEngine.canAllocate(task.department, {
                capitalUSD: task.tokenCostUSD + task.computeCostUSD,
                aiTokens: Math.ceil(task.tokenCostUSD * 100000),
                computeNodes: 1
            });

            if (canRun) {
                // Reserve resources and remove from queue
                this.resourceEngine.allocateResource(task.department, {
                    capitalUSD: task.tokenCostUSD + task.computeCostUSD,
                    aiTokens: Math.ceil(task.tokenCostUSD * 100000),
                    computeNodes: 1
                });

                this.queue.splice(i, 1);
                return task;
            }
        }

        return undefined; // All candidate tasks are currently capacity-throttled
    }

    getResourceAllocationEngine(): ResourceAllocationEngine {
        return this.resourceEngine;
    }

    getQueueLength(): number {
        return this.queue.length;
    }
}
