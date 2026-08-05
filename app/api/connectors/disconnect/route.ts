import { NextResponse } from "next/server";
import { connectorAuthManager } from "@/lib/connectors/framework/authManager";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { connectorId, userId = "user_default" } = body;

        if (!connectorId) {
            return NextResponse.json(
                { success: false, error: "connectorId is required" },
                { status: 400 }
            );
        }

        await connectorAuthManager.revokeCredentials(userId, connectorId);

        return NextResponse.json({
            success: true,
            message: `Successfully disconnected connector ${connectorId}`,
            status: "disconnected",
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to disconnect connector" },
            { status: 500 }
        );
    }
}
