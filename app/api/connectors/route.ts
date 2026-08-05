import { NextResponse } from "next/server";
import { globalConnectorRegistry } from "@/lib/connectors/framework/registry";
import { connectorAuthManager } from "@/lib/connectors/framework/authManager";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "user_default";

        const connectors = await Promise.all(
            globalConnectorRegistry.listConnectors().map(async (c) => {
                const creds = await connectorAuthManager.getCredentials(userId, c.metadata.id);
                return {
                    id: c.metadata.id,
                    name: c.metadata.name,
                    version: c.metadata.version,
                    category: c.metadata.category,
                    authType: c.metadata.authType,
                    description: c.metadata.description,
                    scopes: c.metadata.scopes,
                    supportedEvents: c.metadata.supportedEvents,
                    supportedActions: c.metadata.supportedActions,
                    status: creds ? "connected" : "disconnected",
                    health: c.getHealth(),
                };
            })
        );

        return NextResponse.json({
            success: true,
            count: connectors.length,
            connectors,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch connectors" },
            { status: 500 }
        );
    }
}
