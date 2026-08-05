import { NextResponse } from "next/server";
import { eventHistory } from "@/lib/events/eventHistory";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const events = eventHistory.getRecentEvents(limit);

        return NextResponse.json({
            success: true,
            count: events.length,
            events,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch event history" },
            { status: 500 }
        );
    }
}
