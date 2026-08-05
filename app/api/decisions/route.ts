import { NextRequest, NextResponse } from "next/server";
import {
    createDecision,
    getDecisions,
    confirmDecision,
    supersedeDecision,
    type DecisionStatus,
} from "@/lib/decisionMemory";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";
        const status = searchParams.get("status") as DecisionStatus | null;
        const projectId = searchParams.get("projectId");

        const options: any = {};
        if (status) options.status = status;
        if (projectId !== null) options.projectId = projectId;

        const decisions = await getDecisions(userId, options);

        return NextResponse.json({
            success: true,
            count: decisions.length,
            decisions,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch decisions" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId = "current_user", action, decisionId, ...params } = body;

        // Action-based dispatch for confirmation or supersession
        if (action === "confirm") {
            if (!decisionId) {
                return NextResponse.json({ success: false, error: "decisionId is required to confirm" }, { status: 400 });
            }
            const confirmed = await confirmDecision(decisionId, userId);
            return NextResponse.json({ success: true, decision: confirmed });
        }

        if (action === "supersede") {
            if (!decisionId) {
                return NextResponse.json({ success: false, error: "decisionId is required to supersede" }, { status: 400 });
            }
            if (!params.title) {
                return NextResponse.json({ success: false, error: "New decision title is required for supersession" }, { status: 400 });
            }
            const result = await supersedeDecision(decisionId, params, userId);
            return NextResponse.json({ success: true, ...result });
        }

        // Default: Create new decision
        if (!params.title || typeof params.title !== "string" || !params.title.trim()) {
            return NextResponse.json({ success: false, error: "Decision title is required" }, { status: 400 });
        }

        const newDecision = await createDecision(userId, params);
        return NextResponse.json({ success: true, decision: newDecision }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to process decision request" },
            { status: 500 }
        );
    }
}
