import { NextResponse } from "next/server";
import { learningEngine } from "@/lib/intelligence/learningEngine";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { recommendationId, feedback, category, userId = "user_default" } = body;

        if (!recommendationId || !feedback) {
            return NextResponse.json(
                { success: false, error: "recommendationId and feedback are required" },
                { status: 400 }
            );
        }

        const record = await learningEngine.recordFeedback(userId, recommendationId, feedback, category);

        return NextResponse.json({
            success: true,
            record,
        });
    } catch (err: any) {
        console.error("Feedback API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to record feedback" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "user_default";

        const stats = await learningEngine.getFeedbackStats(userId);
        const preferences = await learningEngine.getExecutivePreferences(userId);

        return NextResponse.json({
            success: true,
            stats,
            preferences,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch feedback stats" },
            { status: 500 }
        );
    }
}
