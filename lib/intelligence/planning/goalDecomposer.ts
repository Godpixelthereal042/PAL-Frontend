import type { ExecutionMilestone, ExecutionTaskNode, IGoalDecomposer } from "./types.ts";

export class GoalDecomposer implements IGoalDecomposer {
    async decomposeGoal(
        workspaceId: string,
        goal: string,
        context: any
    ): Promise<{ tasks: ExecutionTaskNode[]; milestones: ExecutionMilestone[] }> {
        const lowerGoal = goal.toLowerCase();

        if (lowerGoal.includes("cloud") || lowerGoal.includes("aws") || lowerGoal.includes("infrastructure") || lowerGoal.includes("spend")) {
            const tasks: ExecutionTaskNode[] = [
                {
                    id: "task_audit_infra",
                    title: "Audit Active AWS Cloud Infrastructure & Idle Instances",
                    domain: "engineering",
                    prerequisites: [],
                    estimatedCost: 0,
                    estimatedTimeHours: 12,
                    assignedRole: "ai_ops",
                    riskScore: 10,
                },
                {
                    id: "task_rightsize_nodes",
                    title: "Rightsize Database Instances & Apply Savings Plans",
                    domain: "finance",
                    prerequisites: ["task_audit_infra"],
                    estimatedCost: 150,
                    estimatedTimeHours: 24,
                    assignedRole: "ai_cfo",
                    riskScore: 25,
                },
                {
                    id: "task_verify_perf",
                    title: "Run Load Tests & Verify Performance Benchmarks",
                    domain: "operations",
                    prerequisites: ["task_rightsize_nodes"],
                    estimatedCost: 50,
                    estimatedTimeHours: 16,
                    assignedRole: "ai_coo",
                    riskScore: 20,
                },
            ];

            const milestones: ExecutionMilestone[] = [
                {
                    id: "ms_audit_complete",
                    name: "Infrastructure Audit Complete",
                    targetDayOffset: 2,
                    deliverables: ["AWS Infrastructure Audit Report"],
                    verificationCriteria: "All unattached EBS volumes and idle EC2 instances identified.",
                },
                {
                    id: "ms_cost_reduction_active",
                    name: "25% Cost Reduction Applied",
                    targetDayOffset: 7,
                    deliverables: ["Updated AWS Billing Projection"],
                    verificationCriteria: "Monthly burn rate reduced by target threshold without SLA degradation.",
                },
            ];

            return { tasks, milestones };
        }

        // Generic Strategic Goal Default
        const tasks: ExecutionTaskNode[] = [
            {
                id: "task_req_analysis",
                title: "Conduct Initial Strategic Analysis",
                domain: "operations",
                prerequisites: [],
                estimatedCost: 0,
                estimatedTimeHours: 8,
                assignedRole: "ai_coo",
                riskScore: 15,
            },
            {
                id: "task_exec_plan",
                title: "Formulate Tactical Implementation Roadmap",
                domain: "engineering",
                prerequisites: ["task_req_analysis"],
                estimatedCost: 200,
                estimatedTimeHours: 16,
                assignedRole: "ai_ops",
                riskScore: 20,
            },
        ];

        const milestones: ExecutionMilestone[] = [
            {
                id: "ms_strategy_approved",
                name: "Strategy Alignment Complete",
                targetDayOffset: 3,
                deliverables: ["Executive Strategic Brief"],
                verificationCriteria: "Goal decomposition signed off by Executive Council.",
            },
        ];

        return { tasks, milestones };
    }
}
