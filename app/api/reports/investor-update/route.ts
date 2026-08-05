import { NextResponse } from "next/server";
import { InvestorBoardIntelligenceEngine } from "@/lib/reports/investorBoardIntelligenceEngine.ts";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = request.headers.get("x-workspace-id") || searchParams.get("workspaceId") || "ws_demo_company";

        const engine = InvestorBoardIntelligenceEngine.getInstance();
        const update = engine.generateInvestorUpdate(workspaceId);
        const agenda = engine.generateBoardDecisionAgenda(workspaceId);

        return NextResponse.json({ success: true, investorUpdate: update, boardAgenda: agenda });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to generate investor update", message: err.message }, { status: 500 });
    }
}
