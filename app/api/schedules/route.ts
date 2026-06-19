import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        const userId = user ? user.id : null;

        const db = await getDB();
        let schedules;
        if (userId) {
            schedules = await db.all("SELECT * FROM schedules WHERE user_id = ? ORDER BY date ASC, time ASC", [userId]);
        } else {
            schedules = await db.all("SELECT * FROM schedules ORDER BY date ASC, time ASC");
        }
        
        // Fetch synced calendar events
        let calendarEvents = [];
        try {
            if (userId) {
                calendarEvents = await db.all(
                    "SELECT * FROM calendar_events WHERE user_id = ? ORDER BY starts_at ASC",
                    [userId]
                );
            } else {
                calendarEvents = await db.all("SELECT * FROM calendar_events ORDER BY starts_at ASC");
            }
        } catch (e) {
            console.warn("Could not fetch calendar_events (table might not exist yet):", e);
        }

        const mappedCalEvents = calendarEvents.map((e: any) => {
            // e.starts_at format is usually "YYYY-MM-DD HH:MM"
            const parts = (e.starts_at || "").split(" ");
            return {
                id: e.id,
                title: `${e.title} 📅`, // Visual calendar icon indicator
                date: parts[0] || "",
                time: parts[1] || "00:00"
            };
        }).filter((e: any) => e.date !== "");

        // Merge and sort
        const combined = [...schedules, ...mappedCalEvents];
        combined.sort((a, b) => {
            const dateComp = a.date.localeCompare(b.date);
            if (dateComp !== 0) return dateComp;
            return a.time.localeCompare(b.time);
        });

        return NextResponse.json(combined);
    } catch (error) {
        console.error("Database fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, date, time } = body;

        if (!title || !date || !time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = await getDB();
        const id = String(Date.now());
        
        await db.run(
            "INSERT INTO schedules (id, title, date, time, user_id) VALUES (?, ?, ?, ?, ?)",
            [id, title, date, time, user.id]
        );

        return NextResponse.json({ id, title, date, time, user_id: user.id }, { status: 201 });
    } catch (error) {
        console.error("Database insert error:", error);
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }
}
