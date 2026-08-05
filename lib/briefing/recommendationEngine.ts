/**
 * Executive Recommendation Engine
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Answers the single core question:
 * "If the founder accomplishes only one thing today, what should it be?"
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { Priority, Risk, Opportunity, Recommendation } from "./types.ts";

export function generateRecommendation(
    context: BusinessContext,
    priorities: Priority[],
    risks: Risk[],
    opportunities: Opportunity[]
): Recommendation {
    const evidence: string[] = [];

    // 1. Check for Critical Risk Blockers (Top Priority Override)
    const criticalRisk = risks.find((r) => r.severity === "critical");
    if (criticalRisk) {
        evidence.push(`Critical Risk Detected: ${criticalRisk.title}`);
        if (criticalRisk.mitigation) evidence.push(`Suggested Mitigation: ${criticalRisk.mitigation}`);

        return {
            title: `Address Critical Risk: ${criticalRisk.title}`,
            reason: criticalRisk.impact,
            expectedImpact: "Prevents immediate business disruption and protects operational cash flow / timeline.",
            confidence: 95,
            supportingEvidence: evidence,
        };
    }

    // 2. Highest Scoring Strategic Priority
    if (priorities.length > 0) {
        const topPriority = priorities[0];
        evidence.push(`Top Ranked Priority: ${topPriority.title} (Score: ${topPriority.score})`);
        evidence.push(`Reason: ${topPriority.reason}`);

        if (topPriority.deadline) {
            evidence.push(`Target Deadline: ${topPriority.deadline}`);
        }

        if (opportunities.length > 0) {
            evidence.push(`Opportunity Alignment: ${opportunities[0].title}`);
        }

        return {
            title: topPriority.title,
            reason: `${topPriority.reason}. Completing this unblocks maximum strategic progress today.`,
            expectedImpact: "Drives highest progress toward core founder targets and maintains momentum.",
            confidence: 90,
            supportingEvidence: evidence,
        };
    }

    // 3. Project Advancement Fallback
    const activeProject = context.projects.find((p) => {
        const st = p.status.toLowerCase();
        return st !== "completed" && st !== "done";
    });

    if (activeProject) {
        evidence.push(`Active Project: ${activeProject.title} (${activeProject.priority} priority)`);

        return {
            title: `Advance Project: ${activeProject.title}`,
            reason: `Focus on delivering key milestones for '${activeProject.title}'.`,
            expectedImpact: "Moves primary active project closer to completion.",
            confidence: 85,
            supportingEvidence: evidence,
        };
    }

    // 4. Default Founder Organization Recommendation
    return {
        title: "Define Core Business Brain Goals and Top Priorities",
        reason: "Operational context is currently light. Setting explicit priorities ensures AI reasoning aligns with your targets.",
        expectedImpact: "Establishes clear direction and enables proactive AI assistance.",
        confidence: 80,
        supportingEvidence: ["Context Engine snapshot shows unconfigured or minimal active goals."],
    };
}
