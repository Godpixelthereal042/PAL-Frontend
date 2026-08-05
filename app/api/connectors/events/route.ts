import { NextResponse } from "next/server";
import { globalConnectorRegistry } from "@/lib/connectors/framework/registry";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { connectorId, eventType, payload = {}, relatedEntities } = body;

        if (!connectorId || !eventType) {
            return NextResponse.json(
                { success: false, error: "connectorId and eventType are required" },
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

        const published = await connector.publishEvent({
            eventType,
            source: connectorId,
            payload,
            timestamp: Date.now(),
            relatedEntities,
        });

        return NextResponse.json({
            success: true,
            published,
            message: `Event '${eventType}' ingested from ${connector.metadata.name} into Executive Event Bus`,
        });
    } catch (err: any) {
        console.error("Connector Event API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to ingest connector event" },
            { status: 500 }
        );
    }
}
