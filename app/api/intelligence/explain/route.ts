import { NextResponse } from "next/server";
import { explainabilityEngine } from "@/lib/intelligence/explainabilityEngine";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id") || "rec_default";
        const userId = searchParams.get("userId") || "user_default";

        const explanation = await explainabilityEngine.explainRecommendation(id, userId);

        return NextResponse.json({
            success: true,
            explanation,
        });
    } catch (err: any) {
        console.error("Explainability API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to generate explanation" },
            { status: 500 }
        );
    }
}
