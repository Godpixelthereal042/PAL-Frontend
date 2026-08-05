/**
 * AI Workforce ROI & Economics Calculator (PAL-TDD-006, Sprint 17)
 *
 * Calculates productivity equivalence, analyst salary comparison, and ROI leverage
 * delivered by PAL agent teammates to executive leadership.
 */

export interface AIWorkforceROISummary {
    workspaceId: string;
    humanAnalystEquivalenceUSD: number; // e.g. $255,000/year
    equivalentFteLeverageCount: number; // e.g. 3-5 FTEs
    palAnnualSubscriptionUSD: number;  // e.g. $2,388/year ($199/mo)
    netAnnualSavingsUSD: number;        // e.g. $252,612/year
    roiPercentagePct: number;          // e.g. 10,578% ROI
}

export class AIWorkforceRoiCalculator {
    private static instance: AIWorkforceRoiCalculator;

    public static getInstance(): AIWorkforceRoiCalculator {
        if (!AIWorkforceRoiCalculator.instance) {
            AIWorkforceRoiCalculator.instance = new AIWorkforceRoiCalculator();
        }
        return AIWorkforceRoiCalculator.instance;
    }

    public calculateROI(workspaceId: string, monthlySubscriptionUSD = 199): AIWorkforceROISummary {
        const humanAnalystValue = 255000; // Marketing ($80k) + Ops ($90k) + Finance ($85k)
        const annualPalCost = monthlySubscriptionUSD * 12;
        const netSavings = humanAnalystValue - annualPalCost;
        const roiPct = Math.round((netSavings / annualPalCost) * 100);

        return {
            workspaceId,
            humanAnalystEquivalenceUSD: humanAnalystValue,
            equivalentFteLeverageCount: 4, // 4 FTE equivalent productivity
            palAnnualSubscriptionUSD: annualPalCost,
            netAnnualSavingsUSD: netSavings,
            roiPercentagePct: roiPct
        };
    }
}
