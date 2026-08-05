/**
 * Enterprise Organization Model (PAL-TDD-005, PAL-ARCH-DOC-034)
 */

import type { ExecutiveCouncilMember } from "./negotiationTypes.ts";
import type { DepartmentType } from "./schedulerTypes.ts";

export interface DepartmentModel {
    name: DepartmentType;
    leaderTitle: string;
    allocatedBudgetUSD: number;
    headcount: number;
}

export interface Organization {
    orgId: string;
    name: string;
    departments: Map<DepartmentType, DepartmentModel>;
    totalBudgetUSD: number;
    councilMembers: ExecutiveCouncilMember[];
}

export function createDefaultOrganization(): Organization {
    const councilMembers: ExecutiveCouncilMember[] = [
        { id: "mem_cfo", name: "Chief Financial Officer", department: "finance", authorityLevel: 9, voteWeight: 3.0, expertise: ["capital_allocation", "financial_risk", "mrr_growth"] },
        { id: "mem_cto", name: "Chief Technology Officer", department: "engineering", authorityLevel: 9, voteWeight: 3.0, expertise: ["system_architecture", "deployment_safety", "compute_efficiency"] },
        { id: "mem_cmo", name: "Chief Marketing Officer", department: "marketing", authorityLevel: 8, voteWeight: 2.0, expertise: ["cac_optimization", "lead_generation", "brand_reputation"] },
        { id: "mem_cro", name: "VP of Global Sales", department: "sales", authorityLevel: 8, voteWeight: 2.5, expertise: ["pipeline_velocity", "customer_retention", "ltv_expansion"] },
        { id: "mem_legal", name: "General Counsel", department: "general", authorityLevel: 9, voteWeight: 2.5, expertise: ["compliance", "regulatory_risk", "contract_terms"] }
    ];

    const departments = new Map<DepartmentType, DepartmentModel>();
    departments.set("finance", { name: "finance", leaderTitle: "CFO", allocatedBudgetUSD: 50000, headcount: 4 });
    departments.set("engineering", { name: "engineering", leaderTitle: "CTO", allocatedBudgetUSD: 120000, headcount: 15 });
    departments.set("marketing", { name: "marketing", leaderTitle: "CMO", allocatedBudgetUSD: 40000, headcount: 5 });
    departments.set("sales", { name: "sales", leaderTitle: "VP Sales", allocatedBudgetUSD: 60000, headcount: 8 });
    departments.set("hr", { name: "hr", leaderTitle: "VP HR", allocatedBudgetUSD: 20000, headcount: 3 });
    departments.set("general", { name: "general", leaderTitle: "General Counsel", allocatedBudgetUSD: 30000, headcount: 2 });

    return {
        orgId: "org_default_acme",
        name: "Acme Enterprise Operating Unit",
        departments,
        totalBudgetUSD: 320000,
        councilMembers
    };
}
