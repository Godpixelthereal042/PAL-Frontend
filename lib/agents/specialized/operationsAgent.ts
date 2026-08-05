/**
 * Operations Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "../baseAgent.ts";
import type { AgentRole, AgentContext, AgentResponse, AgentFinding } from "../types.ts";

export class OperationsAgent extends BaseAgent {
    public readonly role: AgentRole = "operations";
    public readonly name = "Operations Agent";
    public readonly description = "Monitors workflows, detects automation opportunities, tracks overdue tasks, and surfaces operational risks.";
    public readonly capabilities = ["workflow_monitoring", "automation_detection", "task_tracking"];
    public readonly priority = 80;

    public async analyze(context: AgentContext): Promise<AgentResponse> {
        const ctx = context.snapshot.businessContext;
        const findings: AgentFinding[] = [];

        const overdueTasks = (ctx.tasks || []).filter((t) => t.dueDate && new Date(t.dueDate).getTime() < Date.now() && t.status.toLowerCase() !== "completed");
        if (overdueTasks.length > 0) {
            findings.push({
                id: `ops_tasks_${Date.now()}`,
                category: "operational",
                severity: overdueTasks.length >= 3 ? "critical" : "high",
                title: `${overdueTasks.length} Overdue Task(s) Bottlenecking Operations`,
                detail: `Task "${overdueTasks[0].title}" was due on ${overdueTasks[0].dueDate}.`,
                recommendation: "Reassign or complete overdue operational tasks immediately.",
                confidence: 0.95,
                actionUrl: "/tasks",
            });
        }

        return {
            agentRole: this.role,
            agentName: this.name,
            focus: "Workflow Automation & Task Execution",
            findings,
            confidence: 0.92,
        };
    }
}
