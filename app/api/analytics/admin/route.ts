import { NextResponse } from "next/server";
import { ProductAnalytics } from "@/lib/analytics/productAnalytics.ts";

export async function GET() {
    try {
        const metrics = ProductAnalytics.getInstance().getAdminMetricsSummary();
        return NextResponse.json({ success: true, metrics });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to fetch admin metrics", message: err.message }, { status: 500 });
    }
}
