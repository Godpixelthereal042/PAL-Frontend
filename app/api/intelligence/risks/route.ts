import { NextResponse } from "next/server";
import { executiveIntelligenceEngine } from "@/lib/intelligence/intelligenceEngine";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "user_default";
        const intelligence = await executiveIntelligenceEngine.getExecutiveIntelligence(userId);

        return NextResponse.json({
            success: true,
            topRisk: intelligence.topRisk,
            risks: intelligence.risks,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch risks" },
            { status: 500 }
        );
    }
}
