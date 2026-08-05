/**
 * PAL Agent Skill & Marketplace Framework (PAL-TDD-006, Sprint 12)
 *
 * Modular skill architecture for extending PAL with specialized domain skills
 * (Sales Agent, Finance Agent, Marketing Agent, Operations Agent).
 */

export interface AgentSkillDefinition {
    skillId: string;
    name: string;
    domain: "sales" | "finance" | "marketing" | "operations";
    description: string;
    requiredPermissions: string[];
    version: string;
    isInstalled: boolean;
    ratingStars?: number; // e.g. 5.0
    reviewCount?: number;
    isEnterpriseCertified?: boolean;
}

export class SkillMarketplaceEngine {
    private static instance: SkillMarketplaceEngine;
    private skills: Map<string, AgentSkillDefinition> = new Map();

    constructor() {
        this.initializeDefaultSkills();
    }

    public static getInstance(): SkillMarketplaceEngine {
        if (!SkillMarketplaceEngine.instance) {
            SkillMarketplaceEngine.instance = new SkillMarketplaceEngine();
        }
        return SkillMarketplaceEngine.instance;
    }

    private initializeDefaultSkills(): void {
        const defaultSkills: AgentSkillDefinition[] = [
            {
                skillId: "skill_sales_agent",
                name: "Sales Pipeline & Lead Scoring Agent",
                domain: "sales",
                description: "Scans CRM deals, prioritizes high-value leads, and drafts follow-up emails.",
                requiredPermissions: ["crm_read", "email_draft"],
                version: "1.0.0",
                isInstalled: true
            },
            {
                skillId: "skill_finance_agent",
                name: "Cash Flow & SaaS Expense Audit Agent",
                domain: "finance",
                description: "Monitors monthly burn, flags unutilized SaaS subscriptions, and calculates cash runway.",
                requiredPermissions: ["billing_read", "expense_audit"],
                version: "1.0.0",
                isInstalled: true
            },
            {
                skillId: "skill_marketing_agent",
                name: "Campaign ROI & Churn Prevention Agent",
                domain: "marketing",
                description: "Analyzes acquisition campaigns and dispatches trial re-engagement workflows.",
                requiredPermissions: ["analytics_read", "email_dispatch"],
                version: "1.0.0",
                isInstalled: true
            },
            {
                skillId: "skill_operations_agent",
                name: "Process Bottleneck & DAG Optimizer Agent",
                domain: "operations",
                description: "Detects team bottlenecks, optimizes TaskDAG execution, and monitors SLAs.",
                requiredPermissions: ["workflow_manage", "approval_stage"],
                version: "1.0.0",
                isInstalled: true
            },
            {
                skillId: "skill_legal_ops",
                name: "Legal Operations & Compliance Agent",
                domain: "operations",
                description: "Scans contracts, tracks renewal dates, and enforces compliance checks.",
                requiredPermissions: ["contract_read", "compliance_audit"],
                version: "1.0.0",
                isInstalled: false
            },
            {
                skillId: "skill_hr_agent",
                name: "HR & Hiring Intelligence Agent",
                domain: "operations",
                description: "Monitors candidate pipelines, analyzes team performance, and tracks employee retention.",
                requiredPermissions: ["hr_read", "analytics_read"],
                version: "1.0.0",
                isInstalled: false
            }
        ];

        for (const s of defaultSkills) {
            this.skills.set(s.skillId, s);
        }
    }

    public getSkills(): AgentSkillDefinition[] {
        return Array.from(this.skills.values());
    }

    public getSkill(skillId: string): AgentSkillDefinition | undefined {
        return this.skills.get(skillId);
    }

    public installSkill(skillId: string): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) return false;

        skill.isInstalled = true;
        this.skills.set(skillId, skill);
        return true;
    }
}
