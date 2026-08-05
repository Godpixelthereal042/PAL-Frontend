/**
 * Executive Skills Framework
 *
 * PAL Milestone 9A — Plugin SDK & Skills Platform
 */

import type { ExecutiveSkill } from "./types.ts";

export class SkillsFramework {
    private skills: Map<string, ExecutiveSkill> = new Map();

    constructor() {
        this.registerDefaultSkills();
    }

    public registerSkill(skill: ExecutiveSkill): void {
        this.skills.set(skill.id, skill);
    }

    public getSkill(id: string): ExecutiveSkill | undefined {
        return this.skills.get(id);
    }

    public listSkills(): ExecutiveSkill[] {
        return Array.from(this.skills.values());
    }

    private registerDefaultSkills() {
        this.registerSkill({
            id: "skill_swot_analysis",
            name: "SWOT Analysis Generator",
            description: "Generates strengths, weaknesses, opportunities, and threats breakdown from business context.",
            inputs: { category: "string" },
            outputs: { swotReport: "object" },
            requiredPermissions: ["READ_BUSINESS_BRAIN"],
        });

        this.registerSkill({
            id: "skill_investor_followup",
            name: "Investor Outreach Assistant",
            description: "Drafts tailored investor follow-up communications based on decision recency.",
            inputs: { personId: "string" },
            outputs: { emailDraft: "string" },
            requiredPermissions: ["READ_RELATIONSHIPS", "CREATE_TASKS"],
        });

        this.registerSkill({
            id: "skill_sales_forecast",
            name: "Sales & Cash Flow Forecaster",
            description: "Models 90-day cash flow projections and uncollected invoice risks.",
            inputs: { days: "number" },
            outputs: { forecast: "object" },
            requiredPermissions: ["READ_INVOICES"],
        });

        this.registerSkill({
            id: "skill_marketing_campaign",
            name: "Marketing Campaign Planner",
            description: "Formulates strategic customer segment campaign specs and target return budgets.",
            inputs: { budget: "number" },
            outputs: { campaignPlan: "object" },
            requiredPermissions: ["READ_BUSINESS_BRAIN"],
        });
    }
}

export const globalSkillsFramework = new SkillsFramework();
