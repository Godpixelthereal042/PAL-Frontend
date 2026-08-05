import type { IPlaybookRegistry, PlaybookTemplate } from "./types.ts";

export class PlaybookRegistry implements IPlaybookRegistry {
    private playbooks: Map<string, PlaybookTemplate> = new Map();

    constructor() {
        this.loadDefaultPlaybooks("ws_default");
    }

    registerPlaybook(template: PlaybookTemplate): void {
        this.playbooks.set(template.id, template);
    }

    getPlaybook(playbookId: string): PlaybookTemplate | undefined {
        return this.playbooks.get(playbookId);
    }

    listPlaybooks(workspaceId: string, category?: string): PlaybookTemplate[] {
        return Array.from(this.playbooks.values()).filter(
            (p) => (p.workspaceId === workspaceId || p.workspaceId === "ws_default") && (!category || p.category === category)
        );
    }

    private loadDefaultPlaybooks(workspaceId: string): void {
        const salesPlaybook: PlaybookTemplate = {
            id: "playbook_sales_qualification",
            workspaceId,
            name: "Enterprise Inbound Lead Qualification",
            category: "sales",
            version: "1.0.0",
            status: "active",
            description: "Enriches inbound enterprise leads, calculates fit score, and drafts sales briefing.",
            prerequisites: ["salesforce_connector"],
            steps: [
                {
                    id: "step_enrich",
                    title: "Enrich Company Domain & Firmographics",
                    actionType: "connector_call",
                    provider: "clearbit",
                    actionName: "enrich_domain",
                    inputParameters: { domain: "{{lead_domain}}" },
                    onError: "retry",
                },
                {
                    id: "step_approval",
                    title: "Executive Approval for Enterprise Discount",
                    actionType: "human_approval",
                    actionName: "approve_sales_discount",
                    inputParameters: { maxDiscountPercent: 15 },
                    estimatedCost: 0,
                    onError: "escalate",
                },
                {
                    id: "step_assign",
                    title: "Assign Deal Owner & Schedule Introduction",
                    actionType: "connector_call",
                    provider: "hubspot",
                    actionName: "assign_owner",
                    inputParameters: { ownerId: "{{sales_rep_id}}" },
                    compensation: {
                        actionName: "unassign_owner",
                        inputParameters: { ownerId: "{{sales_rep_id}}" },
                    },
                    onError: "rollback",
                },
            ],
            updatedAt: Date.now(),
        };

        const incidentPlaybook: PlaybookTemplate = {
            id: "playbook_incident_outage",
            workspaceId,
            name: "Severity 1 System Outage Response",
            category: "incident",
            version: "1.0.0",
            status: "active",
            description: "Responds to critical service outages by alerting on-call team and updating status page.",
            prerequisites: ["aws_connector", "pagerduty_connector"],
            steps: [
                {
                    id: "step_pagerduty",
                    title: "Trigger PagerDuty Incident Alert",
                    actionType: "connector_call",
                    provider: "pagerduty",
                    actionName: "trigger_incident",
                    inputParameters: { severity: "CRITICAL" },
                    onError: "retry",
                },
                {
                    id: "step_statuspage",
                    title: "Update Public Status Page",
                    actionType: "connector_call",
                    provider: "statuspage",
                    actionName: "update_status",
                    inputParameters: { status: "investigating" },
                    compensation: {
                        actionName: "update_status",
                        inputParameters: { status: "operational" },
                    },
                    onError: "rollback",
                },
            ],
            updatedAt: Date.now(),
        };

        this.registerPlaybook(salesPlaybook);
        this.registerPlaybook(incidentPlaybook);
    }
}
