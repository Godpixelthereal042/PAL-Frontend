/**
 * Agent Watcher Manager
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

import { executiveEventBus } from "./executiveEventBus.ts";
import { cooOrchestrator } from "../agents/cooOrchestrator.ts";
import { executiveApprovalQueue } from "../approvals/approvalQueue.ts";
import type { ExecutiveEvent, EventWatcher } from "./eventTypes.ts";

export class AgentWatcherManager {
    private watchers: EventWatcher[] = [
        {
            id: "watcher_coo",
            name: "COO Watcher",
            agentRole: "coo",
            eventTypes: ["health_score_dropped"],
            enabled: true,
        },
        {
            id: "watcher_ops",
            name: "Operations Watcher",
            agentRole: "operations",
            eventTypes: ["workflow_failed", "commitment_missed"],
            enabled: true,
        },
        {
            id: "watcher_finance",
            name: "Finance Watcher",
            agentRole: "finance",
            eventTypes: ["invoice_overdue"],
            enabled: true,
        },
        {
            id: "watcher_sales",
            name: "Sales & Growth Watcher",
            agentRole: "sales_growth",
            eventTypes: ["relationship_declined"],
            enabled: true,
        },
        {
            id: "watcher_project",
            name: "Project Watcher",
            agentRole: "project",
            eventTypes: ["project_updated"],
            enabled: true,
        },
        {
            id: "watcher_chief",
            name: "Chief of Staff Watcher",
            agentRole: "chief_of_staff",
            eventTypes: ["calendar_changed"],
            enabled: true,
        },
    ];

    constructor() {
        this.registerSubscriptions();
    }

    private registerSubscriptions() {
        executiveEventBus.subscribe("*", async (event: ExecutiveEvent) => {
            await this.handleEvent(event);
        });
    }

    public async handleEvent(event: ExecutiveEvent): Promise<void> {
        const matchingWatcher = this.watchers.find(
            (w) => w.enabled && (w.eventTypes.includes(event.type) || w.eventTypes.includes("*" as any))
        );

        if (!matchingWatcher) return;

        // Execute Multi-Agent Orchestration for event
        const orchestration = await cooOrchestrator.orchestrate("user_default", `Event: ${event.type} - ${event.businessImpact}`);

        // Stage proposal in Approval Queue
        if (orchestration.primaryRecommendation) {
            await executiveApprovalQueue.stageAction(
                "user_default",
                matchingWatcher.agentRole,
                "CREATE_TASK",
                `Proposed Action for ${event.type}: ${orchestration.primaryRecommendation}`,
                {
                    title: `Execute: ${orchestration.primaryRecommendation}`,
                    description: `Generated automatically by ${matchingWatcher.name} following business event '${event.type}'.`,
                    priority: event.severity === "critical" || event.severity === "high" ? "high" : "medium",
                },
                event.id
            );
        }
    }

    public listWatchers(): EventWatcher[] {
        return this.watchers;
    }
}

export const agentWatcherManager = new AgentWatcherManager();
