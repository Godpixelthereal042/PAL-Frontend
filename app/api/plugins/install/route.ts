import { NextResponse } from "next/server";
import { pluginManager } from "@/lib/plugins/pluginManager";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { manifest, userId = "user_default" } = body;

        if (!manifest || !manifest.id || !manifest.name) {
            return NextResponse.json(
                { success: false, error: "Valid plugin manifest (id, name, version) is required" },
                { status: 400 }
            );
        }

        const installed = await pluginManager.installPlugin(userId, manifest);

        return NextResponse.json({
            success: true,
            message: `Plugin '${manifest.name}' installed successfully`,
            installed,
        });
    } catch (err: any) {
        console.error("Plugin install error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to install plugin" },
            { status: 500 }
        );
    }
}
