import { NextResponse } from "next/server";
import { globalConnectorRegistry } from "@/lib/connectors/framework/registry";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ connector: string }> }
) {
    try {
        const { connector } = await params;
        const target = globalConnectorRegistry.get(connector);

        if (!target) {
            return NextResponse.json(
                { success: false, error: `Connector '${connector}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            connector: {
                ...target.metadata,
                health: target.getHealth(),
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch connector details" },
            { status: 500 }
        );
    }
}
