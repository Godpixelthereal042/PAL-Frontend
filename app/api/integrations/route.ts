import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function resolveIntegrationId(id: string): string {
    const cleanId = id.toLowerCase().trim();
    if (cleanId === "google-calendar" || cleanId === "google_calendar" || cleanId === "gmail" || cleanId === "google-workspace") {
        return "google";
    }
    if (cleanId === "twitter" || cleanId === "twitter-x" || cleanId === "twitter_x") {
        return "x";
    }
    return cleanId;
}

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const url = new URL(request.url);
        const source = url.searchParams.get("source");

        if (source) {
            const resolvedId = resolveIntegrationId(source);
            const integration = await db.get(
                "SELECT * FROM integrations WHERE id = ? AND user_id = ?", 
                [resolvedId, user.id]
            );
            if (!integration) {
                return NextResponse.json({ error: "Integration not found" }, { status: 404 });
            }
            return NextResponse.json(integration);
        }

        const integrations = await db.all("SELECT * FROM integrations WHERE user_id = ?", [user.id]);
        return NextResponse.json(integrations);
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
        const { id, isSynced, isAutoSync, syncedMessages } = body;

        if (!id) {
            return NextResponse.json({ error: "Integration ID is required" }, { status: 400 });
        }

        const resolvedId = resolveIntegrationId(id);

        // Check if exists
        const existing = await db.get(
            "SELECT * FROM integrations WHERE id = ? AND user_id = ?", 
            [resolvedId, user.id]
        );

        if (existing) {
            // Update
            const finalIsSynced = isSynced !== undefined ? (isSynced ? 1 : 0) : existing.isSynced;
            const finalIsAutoSync = isAutoSync !== undefined ? (isAutoSync ? 1 : 0) : existing.isAutoSync;
            const finalSyncedMessages = syncedMessages !== undefined ? syncedMessages : existing.syncedMessages;

            await db.run(
                "UPDATE integrations SET isSynced = ?, isAutoSync = ?, syncedMessages = ? WHERE id = ? AND user_id = ?",
                [finalIsSynced, finalIsAutoSync, finalSyncedMessages, resolvedId, user.id]
            );
        } else {
            // Insert
            await db.run(
                "INSERT INTO integrations (id, user_id, isSynced, isAutoSync, syncedMessages) VALUES (?, ?, ?, ?, ?)",
                [resolvedId, user.id, isSynced ? 1 : 0, isAutoSync ? 1 : 0, syncedMessages || 0]
            );
        }

        const updated = await db.get(
            "SELECT * FROM integrations WHERE id = ? AND user_id = ?", 
            [resolvedId, user.id]
        );
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
