import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "@/lib/workflows/workflowEngine";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { userId = "current_user", payload = {} } = body;

        const execution = await runWorkflow(id, userId, payload);

        return NextResponse.json({
            success: execution.status === "completed",
            execution,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to run workflow" },
            { status: 500 }
        );
    }
}
