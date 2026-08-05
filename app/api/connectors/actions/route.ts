import { NextResponse } from "next/server";
import { globalConnectorRegistry } from "@/lib/connectors/framework/registry";
import { executiveApprovalQueue } from "@/lib/approvals/approvalQueue";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { connectorId, actionType, params = {}, requireApproval = true, userId = "user_default" } = body;

        if (!connectorId || !actionType) {
            return NextResponse.json(
                { success: false, error: "connectorId and actionType are required" },
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

        if (requireApproval) {
            const staged = await executiveApprovalQueue.stageAction(
                userId,
                connector.metadata.id,
                actionType,
                `External Action (${connector.metadata.name}): ${actionType}`,
                params
            );

            return NextResponse.json({
                success: true,
                staged: true,
                approvalItem: staged,
                message: `Action '${actionType}' staged in Executive Approval Queue for founder sign-off`,
            });
        }

        const result = await connector.executeAction(actionType, params);

        return NextResponse.json({
            success: true,
            staged: false,
            result,
        });
    } catch (err: any) {
        console.error("Connector Action API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to execute connector action" },
            { status: 500 }
        );
    }
}
