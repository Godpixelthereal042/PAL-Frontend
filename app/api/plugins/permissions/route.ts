import { NextResponse } from "next/server";
import { pluginPermissionManager } from "@/lib/plugins/permissionManager";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pluginId, permissionKey, granted, userId = "user_default" } = body;

        if (!pluginId || !permissionKey) {
            return NextResponse.json(
                { success: false, error: "pluginId and permissionKey are required" },
                { status: 400 }
            );
        }

        if (granted) {
            await pluginPermissionManager.grantPermission(userId, pluginId, permissionKey);
        } else {
            await pluginPermissionManager.revokePermission(userId, pluginId, permissionKey);
        }

        return NextResponse.json({
            success: true,
            message: `Permission '${permissionKey}' for plugin '${pluginId}' updated to ${granted ? "granted" : "revoked"}`,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to update plugin permission" },
            { status: 500 }
        );
    }
}
