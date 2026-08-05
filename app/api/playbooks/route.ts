import { NextResponse } from "next/server";
import { playbookEngine } from "@/lib/playbooks/playbookEngine";

export async function GET() {
    try {
        const catalog = playbookEngine.getCatalog();

        return NextResponse.json({
            success: true,
            catalog,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch playbook catalog" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { playbookType, params = {}, userId = "user_default" } = body;

        if (!playbookType) {
            return NextResponse.json(
                { success: false, error: "playbookType is required" },
                { status: 400 }
            );
        }

        const result = await playbookEngine.executePlaybook(playbookType, userId, params);

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (err: any) {
        console.error("Playbook execution error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to execute playbook" },
            { status: 500 }
        );
    }
}
