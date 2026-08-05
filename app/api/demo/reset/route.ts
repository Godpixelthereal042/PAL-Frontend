import { NextResponse } from "next/server";
import { ProductAnalytics } from "@/lib/analytics/productAnalytics.ts";
import { TenantRateLimiter } from "@/lib/security/tenantRateLimiter.ts";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const workspaceId = body.workspaceId || "ws_demo_company";

        // Reset product analytics & rate limit logs for workspace
        ProductAnalytics.getInstance().resetDemoWorkspace(workspaceId);
        TenantRateLimiter.getInstance().clearLogs(workspaceId);

        return NextResponse.json({
            success: true,
            message: `Demo workspace '${workspaceId}' successfully reset for investor presentation.`,
            resetAt: Date.now()
        });
    } catch (err: any) {
        return NextResponse.json({ error: "Reset failed", message: err.message }, { status: 500 });
    }
}
