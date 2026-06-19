import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkReminderTriggers } from "@/lib/reminders";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        
        // Run reminder checks to update alerts
        await checkReminderTriggers(db);

        const notifications = await db.all("SELECT * FROM notifications ORDER BY id DESC");
        // Convert isUnread to boolean for frontend consumption
        const mapped = notifications.map((n: any) => ({
            ...n,
            isUnread: n.isUnread === 1
        }));
        return NextResponse.json(mapped);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const body = await request.json();
        const { title, text, time, section, iconType, actionLabel, actionRoute } = body;

        if (!title || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const id = String(Date.now());
        const finalTime = time || "Just now";
        const finalSection = section || "Today";
        const finalIconType = iconType || "verified";

        await db.run(
            `INSERT INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)`,
            [id, title, text, finalTime, finalSection, finalIconType, actionLabel || null, actionRoute || null]
        );

        const newNotif = await db.get("SELECT * FROM notifications WHERE id = ?", [id]);
        return NextResponse.json({
            ...newNotif,
            isUnread: newNotif.isUnread === 1
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const body = await request.json();
        const { id, all } = body;

        if (all) {
            await db.run("UPDATE notifications SET isUnread = 0");
            return NextResponse.json({ success: true, message: "All notifications marked as read" });
        }

        if (!id) {
            return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
        }

        await db.run("UPDATE notifications SET isUnread = 0 WHERE id = ?", [id]);
        const updated = await db.get("SELECT * FROM notifications WHERE id = ?", [id]);
        return NextResponse.json({
            ...updated,
            isUnread: updated.isUnread === 1
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (id) {
            await db.run("DELETE FROM notifications WHERE id = ?", [id]);
            return NextResponse.json({ success: true, deletedId: id });
        } else {
            await db.run("DELETE FROM notifications");
            return NextResponse.json({ success: true, message: "All notifications deleted" });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
