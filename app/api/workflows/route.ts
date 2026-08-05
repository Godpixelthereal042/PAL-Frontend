import { NextRequest, NextResponse } from "next/server";
import {
    getWorkflows,
    createWorkflow,
    triggerWorkflowEvent,
    STARTER_TEMPLATES,
} from "@/lib/workflows/workflowEngine";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";

        const workflows = await getWorkflows(userId);

        return NextResponse.json({
            success: true,
            workflows,
            templates: STARTER_TEMPLATES,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch workflows" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId = "current_user", action, workflow, trigger, payload } = body;

        if (action === "trigger" && trigger) {
            const executions = await triggerWorkflowEvent(trigger, payload || {}, userId);
            return NextResponse.json({ success: true, count: executions.length, executions });
        }

        if (!workflow || !workflow.name || !workflow.trigger || !workflow.actions) {
            return NextResponse.json(
                { success: false, error: "Missing required workflow properties (name, trigger, actions)" },
                { status: 400 }
            );
        }

        const created = await createWorkflow(workflow, userId);
        return NextResponse.json({ success: true, workflow: created });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to process workflow request" },
            { status: 500 }
        );
    }
}
