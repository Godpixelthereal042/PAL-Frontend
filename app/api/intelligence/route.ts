import { NextResponse } from "next/server";
import { executiveIntelligenceEngine } from "@/lib/intelligence/intelligenceEngine";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get("refresh") === "true";
        const userId = searchParams.get("userId") || "user_default";

        const intelligence = await executiveIntelligenceEngine.getExecutiveIntelligence(userId, {
            forceRefresh: refresh,
        });

        return NextResponse.json({
            success: true,
            intelligence,
        });
    } catch (err: any) {
        console.error("Executive Intelligence API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to generate executive intelligence" },
            { status: 500 }
        );
    }
}
