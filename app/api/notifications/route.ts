import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
    getNotifications,
    processNotifications,
} from "@/lib/notifications/notificationEngine";
import {
    getNotificationPreferences,
    saveNotificationPreferences,
} from "@/lib/notifications/notificationPreferences";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }
        const userId = user.id;

        const grouped = await getNotifications(userId);

        return NextResponse.json({
            success: true,
            ...grouped,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch notifications" },
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
        const body = await req.json();
        const { action, preferences } = body;

        if (action === "preferences" && preferences) {
            const updatedPrefs = await saveNotificationPreferences(userId, preferences);
            return NextResponse.json({ success: true, preferences: updatedPrefs });
        }

        if (action === "get_preferences") {
            const currentPrefs = await getNotificationPreferences(userId);
            return NextResponse.json({ success: true, preferences: currentPrefs });
        }

        const processed = await processNotifications(userId);
        return NextResponse.json({
            success: true,
            count: processed.length,
            notifications: processed,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to process notifications" },
            { status: 500 }
        );
    }
}
