/**
 * Real Company Pilot & Setup Engine (PAL-TDD-006, Sprint 15)
 *
 * Manages company pilot onboarding, industry vertical classification, revenue goals,
 * tool inventory, and constructs the initial Business Intelligence Profile.
 */

export interface PilotCompanyProfile {
    pilotId: string;
    workspaceId: string;
    companyName: string;
    industry: "saas" | "ecommerce" | "agency" | "fintech" | "general_tech";
    teamSize: number;
    monthlyRevenueUSD: number;
    targetRevenueGoalUSD: number;
    targetTimeframeMonths: number;
    connectedTools: string[];
    primaryKPIs: string[];
    onboardedAt: number;
    status: "active_pilot" | "graduated" | "churned";
}

export class CompanyPilotEngine {
    private static instance: CompanyPilotEngine;
    private pilots: Map<string, PilotCompanyProfile> = new Map();

    constructor() {
        this.initializeSeedPilots();
    }

    public static getInstance(): CompanyPilotEngine {
        if (!CompanyPilotEngine.instance) {
            CompanyPilotEngine.instance = new CompanyPilotEngine();
        }
        return CompanyPilotEngine.instance;
    }

    private initializeSeedPilots(): void {
        const seedPilots: PilotCompanyProfile[] = [
            {
                pilotId: "plt_acme_saas",
                workspaceId: "ws_demo_company",
                companyName: "Acme SaaS Technologies",
                industry: "saas",
                teamSize: 14,
                monthlyRevenueUSD: 50000,
                targetRevenueGoalUSD: 100000,
                targetTimeframeMonths: 6,
                connectedTools: ["stripe", "hubspot", "slack", "google_workspace"],
                primaryKPIs: ["ARR Growth", "Net Revenue Retention", "Churn Rate"],
                onboardedAt: Date.now() - 30 * 86400 * 1000,
                status: "active_pilot"
            },
            {
                pilotId: "plt_shop_direct",
                workspaceId: "ws_shop_direct",
                companyName: "ShopDirect E-Commerce",
                industry: "ecommerce",
                teamSize: 8,
                monthlyRevenueUSD: 75000,
                targetRevenueGoalUSD: 150000,
                targetTimeframeMonths: 6,
                connectedTools: ["shopify", "stripe", "klaviyo_stub"],
                primaryKPIs: ["AOV", "Conversion Rate", "Customer Retention"],
                onboardedAt: Date.now() - 20 * 86400 * 1000,
                status: "active_pilot"
            },
            {
                pilotId: "plt_nexus_agency",
                workspaceId: "ws_nexus_agency",
                companyName: "Nexus Digital Agency",
                industry: "agency",
                teamSize: 22,
                monthlyRevenueUSD: 120000,
                targetRevenueGoalUSD: 200000,
                targetTimeframeMonths: 12,
                connectedTools: ["quickbooks", "hubspot", "slack"],
                primaryKPIs: ["Utilization Rate", "Invoice Aging", "Project Margin"],
                onboardedAt: Date.now() - 15 * 86400 * 1000,
                status: "active_pilot"
            }
        ];

        for (const p of seedPilots) {
            this.pilots.set(p.pilotId, p);
        }
    }

    public registerPilot(params: {
        workspaceId: string;
        companyName: string;
        industry: PilotCompanyProfile["industry"];
        teamSize: number;
        monthlyRevenueUSD: number;
        targetRevenueGoalUSD: number;
        targetTimeframeMonths?: number;
        connectedTools: string[];
        primaryKPIs: string[];
    }): PilotCompanyProfile {
        const profile: PilotCompanyProfile = {
            pilotId: `plt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId: params.workspaceId,
            companyName: params.companyName,
            industry: params.industry,
            teamSize: params.teamSize,
            monthlyRevenueUSD: params.monthlyRevenueUSD,
            targetRevenueGoalUSD: params.targetRevenueGoalUSD,
            targetTimeframeMonths: params.targetTimeframeMonths || 6,
            connectedTools: params.connectedTools,
            primaryKPIs: params.primaryKPIs,
            onboardedAt: Date.now(),
            status: "active_pilot"
        };

        this.pilots.set(profile.pilotId, profile);
        return profile;
    }

    public getPilots(): PilotCompanyProfile[] {
        return Array.from(this.pilots.values());
    }

    public getPilotByWorkspace(workspaceId: string): PilotCompanyProfile | undefined {
        return Array.from(this.pilots.values()).find(p => p.workspaceId === workspaceId);
    }
}
