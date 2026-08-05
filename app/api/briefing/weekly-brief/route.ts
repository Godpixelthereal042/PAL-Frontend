import { NextResponse } from "next/server";
import { WeeklyExecutiveBriefEngine } from "@/lib/briefing/weeklyExecutiveBriefEngine.ts";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = request.headers.get("x-workspace-id") || searchParams.get("workspaceId") || "ws_demo_company";

        const engine = WeeklyExecutiveBriefEngine.getInstance();
        const briefing = engine.generateWeeklyBriefing(workspaceId);

        return NextResponse.json({ success: true, briefing });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to generate weekly brief", message: err.message }, { status: 500 });
    }
}
