import { NextResponse } from "next/server";
import { confidenceModel } from "@/lib/intelligence/confidenceModel";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const evidenceCount = parseInt(searchParams.get("evidenceCount") || "3", 10);
        const hasGaps = searchParams.get("hasGaps") === "true";

        const evaluation = confidenceModel.evaluateConfidence(evidenceCount, hasGaps);

        return NextResponse.json({
            success: true,
            evaluation,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to evaluate confidence" },
            { status: 500 }
        );
    }
}
