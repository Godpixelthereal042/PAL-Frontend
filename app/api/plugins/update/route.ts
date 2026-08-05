import { NextResponse } from "next/server";
import { pluginManager } from "@/lib/plugins/pluginManager";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pluginId, status, userId = "user_default" } = body;

        if (!pluginId || !status) {
            return NextResponse.json(
                { success: false, error: "pluginId and status ('enabled' | 'disabled') are required" },
                { status: 400 }
            );
        }

        await pluginManager.setPluginStatus(userId, pluginId, status);

        return NextResponse.json({
            success: true,
            message: `Plugin '${pluginId}' status updated to '${status}'`,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to update plugin status" },
            { status: 500 }
        );
    }
}
