import { NextResponse } from "next/server";
import { connectorAuthManager } from "@/lib/connectors/framework/authManager";
import { globalConnectorRegistry } from "@/lib/connectors/framework/registry";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { connectorId, credentials = {}, userId = "user_default" } = body;

        if (!connectorId) {
            return NextResponse.json(
                { success: false, error: "connectorId is required" },
                { status: 400 }
            );
        }

        const connector = globalConnectorRegistry.get(connectorId);
        if (!connector) {
            return NextResponse.json(
                { success: false, error: `Connector '${connectorId}' not found` },
                { status: 404 }
            );
        }

        const creds = {
            accessToken: credentials.accessToken || `tok_mock_${Date.now()}`,
            refreshToken: credentials.refreshToken || `ref_mock_${Date.now()}`,
            expiresAt: Date.now() + 3600000,
            scopes: connector.metadata.scopes,
        };

        await connectorAuthManager.saveCredentials(userId, connectorId, creds);
        connector.setCredentials(creds);

        return NextResponse.json({
            success: true,
            message: `Successfully connected ${connector.metadata.name}`,
            status: "connected",
        });
    } catch (err: any) {
        console.error("Connect API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to connect connector" },
            { status: 500 }
        );
    }
}
