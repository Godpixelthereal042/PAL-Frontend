import { NextResponse } from "next/server";
import { executiveApprovalQueue } from "@/lib/approvals/approvalQueue";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "user_default";

        const items = await executiveApprovalQueue.listPending(userId);

        return NextResponse.json({
            success: true,
            count: items.length,
            items,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch pending approvals" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { approvalId, action, userId = "user_default" } = body;

        if (!approvalId || !action) {
            return NextResponse.json(
                { success: false, error: "approvalId and action ('approve' | 'reject') are required" },
                { status: 400 }
            );
        }

        if (action === "approve") {
            const result = await executiveApprovalQueue.approveAction(approvalId, userId);
            return NextResponse.json({
                success: true,
                message: "Action approved and executed via Action Engine",
                result,
            });
        } else if (action === "reject") {
            await executiveApprovalQueue.rejectAction(approvalId);
            return NextResponse.json({
                success: true,
                message: "Action rejected",
            });
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid action. Expected 'approve' or 'reject'" },
                { status: 400 }
            );
        }
    } catch (err: any) {
        console.error("Approval action API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to process approval action" },
            { status: 500 }
        );
    }
}
