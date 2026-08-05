/**
 * Project Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "../baseAgent.ts";
import type { AgentRole, AgentContext, AgentResponse, AgentFinding } from "../types.ts";

export class ProjectAgent extends BaseAgent {
    public readonly role: AgentRole = "project";
    public readonly name = "Project Agent";
    public readonly description = "Monitors project progress, detects blocked work, recommends resource allocation, and highlights deadline risks.";
    public readonly capabilities = ["project_velocity_tracking", "milestone_monitoring", "deadline_forecasting"];
    public readonly priority = 80;

    public async analyze(context: AgentContext): Promise<AgentResponse> {
        const intel = context.intelligence;
        const findings: AgentFinding[] = [];

        if (intel.topForecast) {
            findings.push({
                id: `proj_forecast_${Date.now()}`,
                category: "project",
                severity: "medium",
                title: `Project Delivery Forecast: ${intel.topForecast.prediction}`,
                detail: `Supporting evidence: ${intel.topForecast.supportingData.join("; ")}`,
                recommendation: "Maintain focus time allocation to preserve early completion pace.",
                confidence: intel.topForecast.confidence,
                actionUrl: "/projects",
            });
        }

        return {
            agentRole: this.role,
            agentName: this.name,
            focus: "Project Completion Velocity & Milestone Scheduling",
            findings,
            confidence: 0.88,
        };
    }
}
