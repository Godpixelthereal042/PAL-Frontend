import { NextResponse } from "next/server";
import { globalConnectorRegistry } from "@/lib/connectors/framework/registry";

export async function GET() {
    try {
        const connectors = globalConnectorRegistry.listConnectors();
        const healthList = connectors.map((c) => ({
            id: c.metadata.id,
            name: c.metadata.name,
            health: c.getHealth(),
        }));

        return NextResponse.json({
            success: true,
            health: healthList,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch connector health" },
            { status: 500 }
        );
    }
}
