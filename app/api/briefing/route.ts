import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDailyBrief } from "@/lib/briefing/dailyBriefingEngine";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }
        const userId = user.id;
        const { searchParams } = new URL(req.url);
        const forceRefresh = searchParams.get("refresh") === "true";

        const briefing = await getDailyBrief(userId, forceRefresh);

        return NextResponse.json({
            success: true,
            briefing,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to generate daily briefing" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }
        const userId = user.id;
        const body = await req.json().catch(() => ({}));
        const { forceRefresh = true } = body;

        const briefing = await getDailyBrief(userId, forceRefresh);

        return NextResponse.json({
            success: true,
            briefing,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to refresh daily briefing" },
            { status: 500 }
        );
    }
}
