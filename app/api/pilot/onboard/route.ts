import { NextResponse } from "next/server";
import { CompanyPilotEngine } from "@/lib/pilot/companyPilotEngine.ts";

export async function GET() {
    try {
        const pilots = CompanyPilotEngine.getInstance().getPilots();
        return NextResponse.json({ success: true, count: pilots.length, pilots });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to fetch pilots", message: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        if (!body.companyName || !body.industry) {
            return NextResponse.json({ error: "Missing companyName or industry" }, { status: 400 });
        }

        const engine = CompanyPilotEngine.getInstance();
        const profile = engine.registerPilot({
            workspaceId: body.workspaceId || `ws_${Date.now()}`,
            companyName: body.companyName,
            industry: body.industry,
            teamSize: body.teamSize || 10,
            monthlyRevenueUSD: body.monthlyRevenueUSD || 50000,
            targetRevenueGoalUSD: body.targetRevenueGoalUSD || 100000,
            targetTimeframeMonths: body.targetTimeframeMonths || 6,
            connectedTools: body.connectedTools || ["stripe", "hubspot"],
            primaryKPIs: body.primaryKPIs || ["ARR Growth", "Churn Rate"]
        });

        return NextResponse.json({ success: true, profile });
    } catch (err: any) {
        return NextResponse.json({ error: "Pilot onboarding failed", message: err.message }, { status: 500 });
    }
}
