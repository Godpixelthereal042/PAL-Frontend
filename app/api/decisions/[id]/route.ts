import { NextRequest, NextResponse } from "next/server";
import {
    getDecision,
    updateDecision,
    archiveDecision,
    confirmDecision,
} from "@/lib/decisionMemory";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";

        const decision = await getDecision(id, userId);
        if (!decision) {
            return NextResponse.json({ success: false, error: "Decision not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, decision });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch decision" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { userId = "current_user", action, ...updates } = body;

        if (action === "confirm") {
            const confirmed = await confirmDecision(id, userId);
            return NextResponse.json({ success: true, decision: confirmed });
        }

        if (action === "archive") {
            const archived = await archiveDecision(id, userId);
            return NextResponse.json({ success: true, decision: archived });
        }

        const updated = await updateDecision(id, userId, updates);
        return NextResponse.json({ success: true, decision: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Failed to update decision" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || "current_user";

        const archived = await archiveDecision(id, userId);
        return NextResponse.json({ success: true, message: "Decision archived", decision: archived });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Failed to archive decision" }, { status: 500 });
    }
}
