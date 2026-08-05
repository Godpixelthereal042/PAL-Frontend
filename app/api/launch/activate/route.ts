import { NextResponse } from "next/server";
import { GrowthAnalytics } from "@/lib/analytics/growthAnalytics.ts";
import { ProactiveLoopEngine } from "@/lib/proactive/proactiveLoopEngine.ts";

export async function GET(request: Request) {
    try {
        const growthSummary = GrowthAnalytics.getInstance().getGrowthSummary();
        return NextResponse.json({ success: true, growth: growthSummary });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to fetch growth metrics", message: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const workspaceId = body.workspaceId || "ws_demo_company";

        const alerts = ProactiveLoopEngine.getInstance().triggerProactiveCheck(workspaceId);

        return NextResponse.json({
            success: true,
            message: "Self-serve activation sequence complete. Proactive loop active.",
            workspaceId,
            activeProactiveAlerts: alerts.length
        });
    } catch (err: any) {
        return NextResponse.json({ error: "Activation failed", message: err.message }, { status: 500 });
    }
}
