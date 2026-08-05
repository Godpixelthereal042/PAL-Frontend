/**
 * PAL ROI Proof Engine (PAL-TDD-008, Sprint 21 Milestone 6)
 *
 * Quantifies revenue lift, cost reduction, labor hours automated, total business value,
 * and ROI multiple for enterprise buyers, investors, and case study reports.
 *
 * Architecture: PAL-ARCH-DOC-049
 */

export interface ROIReportParams {
    workspaceId: string;
    companyName: string;
    timeframeDays: number;
    beforePALMonthlyRevenueUSD: number;
    beforePALMonthlyExpensesUSD: number;
    afterPALMonthlyRevenueUSD: number;
    afterPALMonthlyExpensesUSD: number;
    hoursAutomatedPerMonth: number;
    monthlyPALSubscriptionCostUSD: number;
}

export interface ROIReport {
    reportId: string;
    workspaceId: string;
    companyName: string;
    timeframeDays: number;
    revenueImpactUSD: number;
    costReductionUSD: number;
    hoursSaved: number;
    laborSavingsUSD: number;       // hoursSaved * $50/hr
    totalBusinessValueUSD: number; // revenueImpact + costReduction + laborSavings
    palSubscriptionCostUSD: number;
    roiMultiple: number;          // totalBusinessValue / palSubscriptionCost
    caseStudyHeadline: string;
    generatedAt: number;
}

export class ROIProofEngine {
    private static instance: ROIProofEngine;
    private reports: Map<string, ROIReport> = new Map(); // workspaceId -> report

    public static getInstance(): ROIProofEngine {
        if (!ROIProofEngine.instance) {
            ROIProofEngine.instance = new ROIProofEngine();
        }
        return ROIProofEngine.instance;
    }

    public generateROIReport(params: ROIReportParams): ROIReport {
        const timestamp = Date.now();
        const reportId = `roi_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

        const months = params.timeframeDays / 30;

        const monthlyRevDiff = params.afterPALMonthlyRevenueUSD - params.beforePALMonthlyRevenueUSD;
        const revenueImpactUSD = Math.max(0, Math.round(monthlyRevDiff * months));

        const monthlyExpDiff = params.beforePALMonthlyExpensesUSD - params.afterPALMonthlyExpensesUSD;
        const costReductionUSD = Math.max(0, Math.round(monthlyExpDiff * months));

        const totalHours = Math.round(params.hoursAutomatedPerMonth * months);
        const laborSavingsUSD = Math.round(totalHours * 50); // $50/hr loaded labor cost

        const totalBusinessValueUSD = revenueImpactUSD + costReductionUSD + laborSavingsUSD;
        const totalPalCost = Math.max(1, Math.round(params.monthlyPALSubscriptionCostUSD * months));

        const roiMultiple = Math.round((totalBusinessValueUSD / totalPalCost) * 10) / 10;

        const caseStudyHeadline = `PAL generated $${totalBusinessValueUSD.toLocaleString()} total business value (${roiMultiple}x ROI) over ${params.timeframeDays} days for ${params.companyName}.`;

        const report: ROIReport = {
            reportId,
            workspaceId: params.workspaceId,
            companyName: params.companyName,
            timeframeDays: params.timeframeDays,
            revenueImpactUSD,
            costReductionUSD,
            hoursSaved: totalHours,
            laborSavingsUSD,
            totalBusinessValueUSD,
            palSubscriptionCostUSD: totalPalCost,
            roiMultiple,
            caseStudyHeadline,
            generatedAt: timestamp
        };

        this.reports.set(params.workspaceId, report);
        return report;
    }

    public getReport(workspaceId: string): ROIReport | undefined {
        return this.reports.get(workspaceId);
    }
}
