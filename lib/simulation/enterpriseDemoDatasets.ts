/**
 * Enterprise Demo Datasets (PAL-TDD-008, Sprint 21 Milestone 7)
 *
 * Real-world enterprise datasets for investor live demonstrations, commercial sales calls,
 * and pilot onboarding. Includes 2,000-customer SaaS, Healthcare compliance, and Commerce inventory models.
 *
 * Architecture: PAL-ARCH-DOC-050
 */

import { PalCommandOsEngine } from "../commandOs/commandOsEngine.ts";
import { ExecutiveAgentMesh } from "../agents/mesh/agentMesh.ts";
import { AutonomousActionEngine } from "../autonomy/autonomousActionEngine.ts";
import { ROIProofEngine } from "../outcomes/roiProofEngine.ts";

export interface EnterpriseDemoEnvironment {
    demoId: string;
    companyName: string;
    industry: "saas" | "healthcare" | "ecommerce";
    customerRecordCount: number;
    healthReport: any;
    agentMeshReport: any;
    sampleAutonomousAction: any;
    roiProofReport: any;
    datasetDetails: Record<string, any>;
}

export class EnterpriseDemoDatasets {
    private static commandOs = PalCommandOsEngine.getInstance();
    private static agentMesh = ExecutiveAgentMesh.getInstance();
    private static actionEngine = AutonomousActionEngine.getInstance();
    private static roiEngine = ROIProofEngine.getInstance();

    public static getSaaSEnterpriseDemo(): EnterpriseDemoEnvironment {
        const workspaceId = "ws_demo_saas_2000";
        const healthReport = this.commandOs.generateCompanyHealthReport(workspaceId);
        const agentMeshReport = this.agentMesh.runMeshCycle(workspaceId);

        const sampleAutonomousAction = this.actionEngine.executeAction({
            actionId: "act_demo_saas_01",
            agentRole: "cfo",
            domain: "finance",
            actionLevel: 4,
            title: "Automated AWS Unutilized Instance Deprovisioning",
            description: "Deprovisioned 14 idle EC2 staging nodes",
            estimatedCostUSD: 0,
            riskClassification: "reversible",
            rollbackPlan: "Re-spin instances via Terraform",
            agentTrustScorePct: 98
        }, workspaceId);

        const roiProofReport = this.roiEngine.generateROIReport({
            workspaceId,
            companyName: "Acme Cloud Enterprise",
            timeframeDays: 90,
            beforePALMonthlyRevenueUSD: 180000,
            beforePALMonthlyExpensesUSD: 120000,
            afterPALMonthlyRevenueUSD: 222000,
            afterPALMonthlyExpensesUSD: 108000,
            hoursAutomatedPerMonth: 240,
            monthlyPALSubscriptionCostUSD: 2500
        });

        return {
            demoId: "demo_saas_2000_cust",
            companyName: "Acme Cloud Enterprise",
            industry: "saas",
            customerRecordCount: 2000,
            healthReport,
            agentMeshReport,
            sampleAutonomousAction,
            roiProofReport,
            datasetDetails: {
                mrrUSD: 222000,
                arrUSD: 2664000,
                monthlyChurnPct: 3.2,
                cacUSD: 1250,
                cloudHostingSpendUSD: 24000,
                salesPipelineDealsCount: 48
            }
        };
    }

    public static getHealthcareEnterpriseDemo(): EnterpriseDemoEnvironment {
        const workspaceId = "ws_demo_healthcare_1200";
        const healthReport = this.commandOs.generateCompanyHealthReport(workspaceId);
        const agentMeshReport = this.agentMesh.runMeshCycle(workspaceId);

        const sampleAutonomousAction = this.actionEngine.executeAction({
            actionId: "act_demo_hc_01",
            agentRole: "coo",
            domain: "operations",
            actionLevel: 4,
            title: "Automated HIPAA Audit Log Access Review",
            description: "Audited 1,200 EHR access logs and verified role-based permissions",
            estimatedCostUSD: 0,
            riskClassification: "reversible",
            rollbackPlan: "N/A",
            agentTrustScorePct: 99
        }, workspaceId);

        const roiProofReport = this.roiEngine.generateROIReport({
            workspaceId,
            companyName: "MediCore Health System",
            timeframeDays: 90,
            beforePALMonthlyRevenueUSD: 450000,
            beforePALMonthlyExpensesUSD: 320000,
            afterPALMonthlyRevenueUSD: 495000,
            afterPALMonthlyExpensesUSD: 290000,
            hoursAutomatedPerMonth: 380,
            monthlyPALSubscriptionCostUSD: 4999
        });

        return {
            demoId: "demo_hc_1200_patients",
            companyName: "MediCore Health System",
            industry: "healthcare",
            customerRecordCount: 1200,
            healthReport,
            agentMeshReport,
            sampleAutonomousAction,
            roiProofReport,
            datasetDetails: {
                hipaaAuditPassRatePct: 99.8,
                monthlyPatientVisitsCount: 1200,
                complianceFrameworks: ["HIPAA", "SOC2_TYPE2", "GDPR"]
            }
        };
    }

    public static getCommerceEnterpriseDemo(): EnterpriseDemoEnvironment {
        const workspaceId = "ws_demo_commerce_50k";
        const healthReport = this.commandOs.generateCompanyHealthReport(workspaceId);
        const agentMeshReport = this.agentMesh.runMeshCycle(workspaceId);

        const sampleAutonomousAction = this.actionEngine.executeAction({
            actionId: "act_demo_ecom_01",
            agentRole: "cro",
            domain: "sales",
            actionLevel: 4,
            title: "Automated Abandoned Cart Re-engagement SMS",
            description: "Dispatched personalized 10% promo SMS to 420 abandoned cart users",
            estimatedCostUSD: 250,
            riskClassification: "reversible",
            rollbackPlan: "Expire promo code after 24h",
            agentTrustScorePct: 97
        }, workspaceId);

        const roiProofReport = this.roiEngine.generateROIReport({
            workspaceId,
            companyName: "OmniStyle Direct Commerce",
            timeframeDays: 90,
            beforePALMonthlyRevenueUSD: 280000,
            beforePALMonthlyExpensesUSD: 190000,
            afterPALMonthlyRevenueUSD: 335000,
            afterPALMonthlyExpensesUSD: 175000,
            hoursAutomatedPerMonth: 190,
            monthlyPALSubscriptionCostUSD: 2999
        });

        return {
            demoId: "demo_ecom_50k_orders",
            companyName: "OmniStyle Direct Commerce",
            industry: "ecommerce",
            customerRecordCount: 50000,
            healthReport,
            agentMeshReport,
            sampleAutonomousAction,
            roiProofReport,
            datasetDetails: {
                monthlyGmvUSD: 335000,
                repeatCustomerRatePct: 34.2,
                inventoryTurnoverDays: 28
            }
        };
    }
}
