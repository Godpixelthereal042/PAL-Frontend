import { NextResponse } from "next/server";
import { SubscriptionEngine, type SubscriptionTier } from "@/lib/billing/subscriptionEngine.ts";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = request.headers.get("x-workspace-id") || searchParams.get("workspaceId") || "default_workspace";

        const engine = SubscriptionEngine.getInstance();
        const sub = engine.getSubscription(workspaceId);
        const quota = engine.checkQuota(workspaceId);
        const limits = engine.getTierLimits(sub.tier);

        return NextResponse.json({
            success: true,
            subscription: sub,
            quota,
            limits
        });
    } catch (err: any) {
        return NextResponse.json({ error: "Failed to fetch subscription", message: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const workspaceId = request.headers.get("x-workspace-id") || body.workspaceId || "default_workspace";
        const tier = body.tier as SubscriptionTier;

        if (!tier || !["free", "pro", "business"].includes(tier)) {
            return NextResponse.json({ error: "Invalid tier. Must be 'free', 'pro', or 'business'." }, { status: 400 });
        }

        const engine = SubscriptionEngine.getInstance();
        const updated = engine.upgradeTier(workspaceId, tier);

        return NextResponse.json({
            success: true,
            message: `Workspace successfully upgraded to ${tier.toUpperCase()} tier`,
            subscription: updated
        });
    } catch (err: any) {
        return NextResponse.json({ error: "Upgrade failed", message: err.message }, { status: 500 });
    }
}
