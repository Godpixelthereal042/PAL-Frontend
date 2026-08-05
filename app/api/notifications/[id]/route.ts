import { NextRequest, NextResponse } from "next/server";
import {
    markNotificationRead,
    dismissNotification,
} from "@/lib/notifications/notificationEngine";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { userId = "current_user", action = "read" } = body;

        if (action === "dismiss") {
            const dismissed = await dismissNotification(id, userId);
            return NextResponse.json({ success: true, notification: dismissed });
        }

        const read = await markNotificationRead(id, userId);
        return NextResponse.json({ success: true, notification: read });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update notification status" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";

        const dismissed = await dismissNotification(id, userId);
        return NextResponse.json({ success: true, message: "Notification dismissed", notification: dismissed });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to dismiss notification" },
            { status: 500 }
        );
    }
}
