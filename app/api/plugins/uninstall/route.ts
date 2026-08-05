import { NextResponse } from "next/server";
import { pluginManager } from "@/lib/plugins/pluginManager";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pluginId, userId = "user_default" } = body;

        if (!pluginId) {
            return NextResponse.json(
                { success: false, error: "pluginId is required" },
                { status: 400 }
            );
        }

        await pluginManager.uninstallPlugin(userId, pluginId);

        return NextResponse.json({
            success: true,
            message: `Plugin '${pluginId}' uninstalled successfully`,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to uninstall plugin" },
            { status: 500 }
        );
    }
}
