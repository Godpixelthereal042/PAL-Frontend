import { NextResponse } from "next/server";
import { EnterpriseCommandCenter } from "@/lib/admin/enterpriseCommandCenter.ts";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = request.headers.get("x-workspace-id") || searchParams.get("workspaceId") || "ws_demo_company";

        const summary = EnterpriseCommandCenter.getInstance().getCommandCenterSummary(workspaceId);
        return NextResponse.json({ success: true, summary });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to fetch command center summary", message: err.message }, { status: 500 });
    }
}
