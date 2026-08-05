import { NextResponse } from "next/server";
import { agentWatcherManager } from "@/lib/events/agentWatchers";

export async function GET() {
    try {
        const watchers = agentWatcherManager.listWatchers();

        return NextResponse.json({
            success: true,
            count: watchers.length,
            watchers,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch watchers" },
            { status: 500 }
        );
    }
}
