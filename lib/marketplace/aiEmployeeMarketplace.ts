/**
 * PAL AI Employee Marketplace 2.0 Engine (PAL-TDD-007, Sprint 20 Milestone 7)
 *
 * Economy for enterprise-certified AI employees, industry-specific specialized agents,
 * compliance badge verification (HIPAA, SOC2, GDPR), and partner ecosystem distribution.
 *
 * Architecture: PAL-ARCH-DOC-043
 */

export type CertificationLevel = "community" | "verified" | "enterprise_certified" | "partner";
export type IndustryVertical = "healthcare" | "finance" | "legal" | "retail" | "saas";
export type ComplianceBadge = "HIPAA" | "SOC2_TYPE2" | "GDPR" | "ISO27001";

export interface AIEmployeeListing {
    employeeId: string;
    name: string;
    roleTitle: string;
    industry: IndustryVertical;
    certificationLevel: CertificationLevel;
    complianceBadges: ComplianceBadge[];
    performanceMetrics: {
        installCount: number;
        satisfactionScorePct: number;
        avgROIPct: number;
        tasksCompleted: number;
    };
    publisherName: string;
    monthlyPriceUSD: number;
    description: string;
}

export class AIEmployeeMarketplace {
    private static instance: AIEmployeeMarketplace;
    private listings: Map<string, AIEmployeeListing> = new Map();
    private installedEmployees: Map<string, string[]> = new Map(); // workspaceId -> employeeId[]

    constructor() {
        this.initializeDefaultListings();
    }

    public static getInstance(): AIEmployeeMarketplace {
        if (!AIEmployeeMarketplace.instance) {
            AIEmployeeMarketplace.instance = new AIEmployeeMarketplace();
        }
        return AIEmployeeMarketplace.instance;
    }

    private initializeDefaultListings(): void {
        const defaultListings: AIEmployeeListing[] = [
            {
                employeeId: "emp_hc_001",
                name: "Healthcare Compliance Officer AI",
                roleTitle: "Medical Regulatory & HIPAA Analyst",
                industry: "healthcare",
                certificationLevel: "enterprise_certified",
                complianceBadges: ["HIPAA", "SOC2_TYPE2", "GDPR"],
                performanceMetrics: {
                    installCount: 142,
                    satisfactionScorePct: 99.1,
                    avgROIPct: 320,
                    tasksCompleted: 45200
                },
                publisherName: "HealthTech AI Labs",
                monthlyPriceUSD: 499,
                description: "Monitors patient record access, audits EHR workflows, and ensures strict HIPAA compliance."
            },
            {
                employeeId: "emp_fin_001",
                name: "Insurance Revenue Analyst AI",
                roleTitle: "Claims & Revenue Cycle Optimizer",
                industry: "finance",
                certificationLevel: "enterprise_certified",
                complianceBadges: ["SOC2_TYPE2", "ISO27001"],
                performanceMetrics: {
                    installCount: 210,
                    satisfactionScorePct: 98.4,
                    avgROIPct: 410,
                    tasksCompleted: 89100
                },
                publisherName: "FinPulse Global",
                monthlyPriceUSD: 799,
                description: "Automates claim denial reviews, optimizes reimbursement coding, and forecasts monthly cash flow."
            },
            {
                employeeId: "emp_saas_001",
                name: "Patient Growth Strategist AI",
                roleTitle: "Healthcare Acquisition Specialist",
                industry: "healthcare",
                certificationLevel: "partner",
                complianceBadges: ["HIPAA", "GDPR"],
                performanceMetrics: {
                    installCount: 95,
                    satisfactionScorePct: 97.8,
                    avgROIPct: 280,
                    tasksCompleted: 18400
                },
                publisherName: "OmniGrowth Partners",
                monthlyPriceUSD: 299,
                description: "Drives compliant patient acquisition funnels across multi-location clinic networks."
            }
        ];

        for (const l of defaultListings) {
            this.listings.set(l.employeeId, l);
        }
    }

    public getListings(filter?: {
        industry?: IndustryVertical;
        certificationLevel?: CertificationLevel;
        complianceBadge?: ComplianceBadge;
    }): AIEmployeeListing[] {
        let result = Array.from(this.listings.values());

        if (filter?.industry) {
            result = result.filter(l => l.industry === filter.industry);
        }
        if (filter?.certificationLevel) {
            result = result.filter(l => l.certificationLevel === filter.certificationLevel);
        }
        if (filter?.complianceBadge) {
            result = result.filter(l => l.complianceBadges.includes(filter.complianceBadge!));
        }

        return result;
    }

    public installAIEmployee(workspaceId: string, employeeId: string): { success: boolean; installedCount: number } {
        const listing = this.listings.get(employeeId);
        if (!listing) return { success: false, installedCount: 0 };

        const current = this.installedEmployees.get(workspaceId) || [];
        if (!current.includes(employeeId)) {
            current.push(employeeId);
            this.installedEmployees.set(workspaceId, current);
            listing.performanceMetrics.installCount += 1;
        }

        return {
            success: true,
            installedCount: current.length
        };
    }

    public publishPartnerAIEmployee(listing: Omit<AIEmployeeListing, "employeeId">): AIEmployeeListing {
        const employeeId = `emp_${listing.industry.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newListing: AIEmployeeListing = {
            ...listing,
            employeeId
        };
        this.listings.set(employeeId, newListing);
        return newListing;
    }
}
