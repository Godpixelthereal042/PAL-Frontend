import { NextResponse } from "next/server";
import { pluginManager } from "@/lib/plugins/pluginManager";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "user_default";

        const installed = await pluginManager.listInstalledPlugins(userId);
        const catalog = pluginManager.getMarketplaceCatalog();

        return NextResponse.json({
            success: true,
            installedCount: installed.length,
            installed,
            marketplaceCatalog: catalog,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch plugins" },
            { status: 500 }
        );
    }
}
