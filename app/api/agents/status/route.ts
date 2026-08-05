import { NextResponse } from "next/server";
import { cooOrchestrator } from "@/lib/agents/cooOrchestrator";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "user_default";

        const orchestration = await cooOrchestrator.orchestrate(userId);

        const statusSummary = {
            totalAgents: orchestration.participatingAgents.length,
            unifiedConfidence: orchestration.unifiedConfidence,
            primaryRecommendation: orchestration.primaryRecommendation,
            synthesizedSummary: orchestration.synthesizedSummary,
            agents: orchestration.agentResponses.map((r) => ({
                role: r.agentRole,
                name: r.agentName,
                focus: r.focus,
                findingCount: r.findings.length,
                topFinding: r.findings[0]?.title || "Status Healthy",
                confidence: r.confidence,
            })),
        };

        return NextResponse.json({
            success: true,
            status: statusSummary,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch executive status" },
            { status: 500 }
        );
    }
}
