import { NextResponse } from "next/server";
import { cooOrchestrator } from "@/lib/agents/cooOrchestrator";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, roles, forceRefresh, userId = "user_default" } = body;

        const result = await cooOrchestrator.orchestrate(userId, prompt, { roles, forceRefresh });

        return NextResponse.json({
            success: true,
            orchestration: result,
        });
    } catch (err: any) {
        console.error("Orchestration API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to execute orchestration" },
            { status: 500 }
        );
    }
}
