import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function refreshGoogleToken(db: any, userId: string, refreshToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !refreshToken) {
        return null;
    }

    try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token"
            })
        });

        if (!res.ok) {
            console.error("[OAUTH] Failed to refresh Google token:", await res.text());
            return null;
        }

        const data = await res.json();
        const nextExpires = Date.now() + (data.expires_in || 3600) * 1000;

        await db.run(
            "UPDATE integrations SET access_token = ?, token_expires_at = ? WHERE id = 'google' AND user_id = ?",
            [data.access_token, nextExpires, userId]
        );

        return data.access_token;
    } catch (e) {
        console.error("[OAUTH] Token refresh exception:", e);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        const userId = user ? user.id : "current_user";

        const db = await getDB();
        const events = await db.all(
            "SELECT * FROM calendar_events WHERE user_id = ? OR user_id = 'current_user' ORDER BY starts_at ASC", 
            [userId]
        );
        return NextResponse.json(events);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        const userId = user ? user.id : "current_user";
        
        const db = await getDB();
        const nowMs = Date.now();
        
        // 1. Check for active integration tokens
        const integration = await db.get(
            "SELECT * FROM integrations WHERE id = 'google' AND user_id = ?",
            [userId]
        );

        let accessToken = integration?.access_token;
        const refreshToken = integration?.refresh_token;
        const expiresAt = Number(integration?.token_expires_at || 0);

        const isRealSync = accessToken && accessToken !== "mock_access_token";

        if (isRealSync) {
            // Check if expired
            if (expiresAt < nowMs && refreshToken) {
                console.log("[OAUTH] Access token expired. Refreshing token...");
                const refreshed = await refreshGoogleToken(db, userId, refreshToken);
                if (refreshed) {
                    accessToken = refreshed;
                }
            }

            // Fetch real calendar events from Google API
            console.log("[OAUTH] Fetching calendar events from Google Calendar API");
            const timeMin = new Date().toISOString();
            const calRes = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=15`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            if (calRes.ok) {
                const data = await calRes.json();
                const items = data.items || [];

                // Clear existing events for user
                await db.run("DELETE FROM calendar_events WHERE user_id = ?", [userId]);

                for (const item of items) {
                    const id = item.id;
                    const title = item.summary || "Untitled Event";
                    const startsAt = item.start?.dateTime || item.start?.date || "";
                    const endsAt = item.end?.dateTime || item.end?.date || "";
                    const status = item.status || "confirmed";

                    const formatGoogleDate = (dt: string) => {
                        if (!dt) return "";
                        const cleaned = dt.replace("T", " ");
                        return cleaned.substring(0, 16);
                    };

                    await db.run(
                        `INSERT INTO calendar_events (id, user_id, title, starts_at, ends_at, status, synced_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [id, userId, title, formatGoogleDate(startsAt), formatGoogleDate(endsAt), status, nowMs]
                    );
                }

                const events = await db.all("SELECT * FROM calendar_events WHERE user_id = ? ORDER BY starts_at ASC", [userId]);
                return NextResponse.json({ success: true, count: events.length, events });
            } else {
                console.error("[OAUTH] Google Calendar API request failed, falling back to mock events");
            }
        }

        // Fallback to simulated calendar events
        console.log("[OAUTH] Seeding mock calendar events for user:", userId);
        
        // Clear old calendar events first to simulate a fresh sync
        await db.run("DELETE FROM calendar_events WHERE user_id = ?", [userId]);

        // Create 30 days of simulated calendar events: deadlines, meetings, work hours
        const mockEvents = [
            { id: "cal_1", title: "Acme Corp Design Review", offsetDays: 1, hour: 10, durationHours: 1 },
            { id: "cal_2", title: "Launch Bakery Operational Permits Deadline", offsetDays: 3, hour: 9, durationHours: 0.5 },
            { id: "cal_3", title: "Acme Retainer Retainer Check-in Meeting", offsetDays: 5, hour: 14, durationHours: 1 },
            { id: "cal_4", title: "Weekly Sync with AI Team", offsetDays: 7, hour: 11, durationHours: 1.5 },
            { id: "cal_5", title: "Launch Bakery Inventory Order Deadline", offsetDays: 10, hour: 17, durationHours: 0.5 },
            { id: "cal_6", title: "ACME Corp Retainer Spec Docs Finalized", offsetDays: 12, hour: 16, durationHours: 1 },
            { id: "cal_7", title: "Product Launch Strategy Sync", offsetDays: 15, hour: 13, durationHours: 2 },
            { id: "cal_8", title: "Review Q2 Cloud Infrastructure Costs", offsetDays: 18, hour: 10, durationHours: 1 },
            { id: "cal_9", title: "Meeting with Delta VC Investors", offsetDays: 22, hour: 15, durationHours: 1.5 },
            { id: "cal_10", title: "Bakery Opening Day Event Preparations", offsetDays: 28, hour: 8, durationHours: 4 }
        ];

        for (const e of mockEvents) {
            const date = new Date(nowMs + e.offsetDays * 24 * 60 * 60 * 1000);
            
            const startHour = e.hour;
            const startStr = `${date.toISOString().split('T')[0]} ${String(startHour).padStart(2, '0')}:00`;
            
            const endHour = e.hour + e.durationHours;
            const endStr = `${date.toISOString().split('T')[0]} ${String(Math.floor(endHour)).padStart(2, '0')}:${endHour % 1 === 0 ? '00' : '30'}`;

            await db.run(
                `INSERT INTO calendar_events (id, user_id, title, starts_at, ends_at, status, synced_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [e.id, userId, e.title, startStr, endStr, "confirmed", nowMs]
            );
        }

        const events = await db.all("SELECT * FROM calendar_events WHERE user_id = ? ORDER BY starts_at ASC", [userId]);
        return NextResponse.json({ success: true, count: events.length, events });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
