import { NextRequest, NextResponse } from "next/server";
import {
    getWorkflowById,
    toggleWorkflow,
    deleteWorkflow,
    getWorkflowExecutions,
    createWorkflow,
} from "@/lib/workflows/workflowEngine";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";

        const workflow = await getWorkflowById(id, userId);
        if (!workflow) {
            return NextResponse.json({ success: false, error: `Workflow '${id}' not found` }, { status: 404 });
        }

        const executions = await getWorkflowExecutions(id, userId);

        return NextResponse.json({
            success: true,
            workflow,
            executions,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch workflow details" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { userId = "current_user", enabled, workflow } = body;

        if (workflow) {
            const updated = await createWorkflow({ ...workflow, id }, userId);
            return NextResponse.json({ success: true, workflow: updated });
        }

        const toggled = await toggleWorkflow(id, userId, enabled);
        return NextResponse.json({ success: true, workflow: toggled });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update workflow" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";

        const deleted = await deleteWorkflow(id, userId);
        return NextResponse.json({ success: true, deleted });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to delete workflow" },
            { status: 500 }
        );
    }
}
