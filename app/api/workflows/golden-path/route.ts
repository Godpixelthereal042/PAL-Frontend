import { NextResponse } from "next/server";
import { GoldenPathWorkflow } from "@/lib/workflows/goldenPathWorkflow.ts";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const userPrompt = body.userPrompt || "PAL, analyze my business performance and help me increase revenue.";
        const workspaceId = request.headers.get("x-workspace-id") || body.workspaceId || "default_workspace";
        const userId = body.userId || "usr_founder";
        const budgetLimitUSD = typeof body.budgetLimitUSD === "number" ? body.budgetLimitUSD : 1000;
        const dryRun = body.dryRun !== false; // Default dryRun = true

        const workflow = new GoldenPathWorkflow();
        const result = await workflow.executeGoldenPath({
            workspaceId,
            userId,
            userPrompt,
            budgetLimitUSD,
            dryRun,
            correlationId: request.headers.get("x-request-correlation-id") || undefined
        });

        return NextResponse.json({ success: true, result });
    } catch (err: any) {
        console.error("Golden Path API Error:", err);
        return NextResponse.json({ error: "Golden Path execution failed", message: err.message }, { status: 500 });
    }
}
