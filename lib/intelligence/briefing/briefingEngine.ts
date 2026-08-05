import { ExecutiveBrain } from "../brain/executiveBrain.ts";
import { EventEngine } from "../events/eventEngine.ts";
import type { BriefSection, BriefType, DeliveryChannel, ExecutiveBrief, IBriefingEngine } from "./types.ts";

export class BriefingEngine implements IBriefingEngine {
    private brain: ExecutiveBrain;
    private eventEngine: EventEngine;

    constructor(brain?: ExecutiveBrain, eventEngine?: EventEngine) {
        this.brain = brain || new ExecutiveBrain();
        this.eventEngine = eventEngine || new EventEngine();
    }

    async generateBrief(
        workspaceId: string,
        targetUserId: string,
        briefType: BriefType,
        customParams?: Record<string, any>
    ): Promise<ExecutiveBrief> {
        const worldModel = await this.brain.getWorldModel(workspaceId);
        const objectives = await this.brain.getObjectives(workspaceId);
        const priorityQueue = this.eventEngine.getPriorityQueue();

        const briefId = `brief_${briefType}_${Date.now()}`;
        const now = Date.now();

        let title = "";
        let executiveSummary = "";
        let urgency: ExecutiveBrief["urgency"] = "medium";
        const sections: BriefSection[] = [];

        switch (briefType) {
            case "morning":
                title = "Morning Executive Brief";
                executiveSummary = `Cash runway stands at ${worldModel.observed.financialRunwayMonths} months ($${(worldModel.observed.currentARR / 1000000).toFixed(2)}M ARR). Sprint progress is at ${worldModel.observed.sprintProgressPercentage}%.`;
                urgency = worldModel.observed.financialRunwayMonths < 6 ? "critical" : "medium";

                sections.push({
                    heading: "Financial & Operational Health",
                    contentMarkdown: `- **Runway**: ${worldModel.observed.financialRunwayMonths} months\n- **Current ARR**: $${(worldModel.observed.currentARR / 1000000).toFixed(2)}M\n- **Open Incidents**: ${worldModel.observed.openIncidentsCount}`,
                    keyMetrics: {
                        runwayMonths: worldModel.observed.financialRunwayMonths,
                        arrUSD: worldModel.observed.currentARR,
                        openIncidents: worldModel.observed.openIncidentsCount,
                    },
                });

                sections.push({
                    heading: "Strategic Objectives",
                    contentMarkdown: objectives.map((o) => `- **${o.title}**: Current ${o.currentValue} / Target ${o.targetValue} (${o.status})`).join("\n"),
                });
                break;

            case "risk":
                title = "Critical Risk & Alert Brief";
                const criticalEvt = priorityQueue.find((e) => e.severity === "critical") || priorityQueue[0];
                executiveSummary = criticalEvt ? criticalEvt.summary : "No unhandled critical operational risks detected.";
                urgency = "critical";

                sections.push({
                    heading: "Detected Operational Vulnerabilities",
                    contentMarkdown: priorityQueue.slice(0, 3).map((e) => `- [${e.severity.toUpperCase()}] **${e.title}**: ${e.summary}`).join("\n"),
                });
                break;

            case "revenue":
                title = "Revenue & Pipeline Performance Brief";
                executiveSummary = `ARR currently at $${(worldModel.observed.currentARR / 1000000).toFixed(2)}M. 12 active deals in sales pipeline.`;
                urgency = "medium";

                sections.push({
                    heading: "Sales Pipeline Velocity",
                    contentMarkdown: `- **Active Deals**: ${worldModel.observed.activeDealsCount}\n- **Forecasted 30-Day ARR**: $${(worldModel.predicted.projectedARR30Days / 1000000).toFixed(2)}M`,
                    keyMetrics: {
                        activeDeals: worldModel.observed.activeDealsCount,
                        projectedARR: worldModel.predicted.projectedARR30Days,
                    },
                });
                break;

            case "decision":
                title = "Executive Decision Proposal";
                executiveSummary = customParams?.summary || "Decision recommendation formulated for executive sign-off.";
                urgency = "high";

                sections.push({
                    heading: "Recommended Strategic Action",
                    contentMarkdown: customParams?.details || "Option C (Balanced Plan) recommended by Executive Council.",
                    actionableOptions: customParams?.options || [
                        { optionId: "option_c_balanced", label: "Approve Option C", description: "Balanced plan with 22/100 risk score", isRecommended: true },
                        { optionId: "option_a_conservative", label: "Select Option A", description: "Conservative low-cost path", isRecommended: false },
                    ],
                });
                break;

            default:
                title = "Executive Progress Brief";
                executiveSummary = "Operational trajectory remains aligned with quarterly objectives.";
                urgency = "low";

                sections.push({
                    heading: "General Operations",
                    contentMarkdown: `- Sprint Completion: ${worldModel.observed.sprintProgressPercentage}%`,
                });
                break;
        }

        return {
            id: briefId,
            workspaceId,
            targetUserId,
            briefType,
            title,
            executiveSummary,
            sections,
            urgency,
            deliveredChannels: ["in_app_chat", "dashboard"],
            readStatus: "unread",
            createdAt: now,
        };
    }

    formatForChannel(brief: ExecutiveBrief, channel: DeliveryChannel): string | Record<string, any> {
        switch (channel) {
            case "in_app_chat":
                return `📌 **${brief.title}** (${brief.urgency.toUpperCase()})\n\n${brief.executiveSummary}\n\n` +
                    brief.sections.map((s) => `### ${s.heading}\n${s.contentMarkdown}`).join("\n\n");

            case "dashboard":
                return {
                    widgetTitle: brief.title,
                    summary: brief.executiveSummary,
                    urgencyColor: brief.urgency === "critical" ? "red" : brief.urgency === "high" ? "orange" : "blue",
                    sectionData: brief.sections,
                };

            case "email":
                return `Subject: [PAL Executive Brief] ${brief.title}\n\n${brief.executiveSummary}\n\n` +
                    brief.sections.map((s) => `${s.heading.toUpperCase()}\n-------------------\n${s.contentMarkdown}`).join("\n\n");

            case "push":
                return `PAL Alert [${brief.title}]: ${brief.executiveSummary.substring(0, 100)}...`;

            default:
                return brief.executiveSummary;
        }
    }
}
