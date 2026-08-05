/**
 * Stripe Webhook Route — Signature Verification & Subscription Event Handler (PAL v3.1)
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDB } from "@/lib/db";
import { CommercialBillingEngine, type SubscriptionTier } from "@/lib/billing/commercialBillingEngine";

/**
 * Verify Stripe webhook signature (HMAC SHA-256).
 */
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
    if (!header || !secret) return false;

    const parts = header.split(",").reduce((acc: Record<string, string>, item) => {
        const [k, v] = item.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
    }, {});

    const timestamp = parts["t"];
    const signature = parts["v1"];

    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(signedPayload, "utf8")
        .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signatureHeader = req.headers.get("stripe-signature") || "";
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

        // Verify signature if secret is configured
        if (webhookSecret) {
            const isValid = verifyStripeSignature(bodyText, signatureHeader, webhookSecret);
            if (!isValid) {
                return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
            }
        }

        const event = JSON.parse(bodyText);
        const db = await getDB();
        const now = Date.now();

        // Process Stripe Event
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data?.object;
                const workspaceId = session?.metadata?.workspaceId || session?.client_reference_id;
                const tier = (session?.metadata?.tier || "Growth") as SubscriptionTier;

                if (workspaceId) {
                    const engine = CommercialBillingEngine.getInstance();
                    engine.upgradeTier(workspaceId, tier);

                    await db.run(
                        `INSERT INTO subscriptions (id, workspace_id, stripe_customer_id, stripe_subscription_id, tier, status, current_period_start, current_period_end, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(id) DO UPDATE SET status = 'active', tier = excluded.tier, updated_at = excluded.updated_at`,
                        [
                            `sub_${workspaceId}_${now}`,
                            workspaceId,
                            session.customer || "",
                            session.subscription || "",
                            tier,
                            "active",
                            now,
                            now + 30 * 86400 * 1000,
                            now,
                            now,
                        ]
                    );
                }
                break;
            }

            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subObj = event.data?.object;
                const stripeSubId = subObj?.id;
                const status = event.type === "customer.subscription.deleted" ? "canceled" : subObj?.status || "active";

                if (stripeSubId) {
                    await db.run(
                        "UPDATE subscriptions SET status = ?, updated_at = ? WHERE stripe_subscription_id = ?",
                        [status, now, stripeSubId]
                    );
                }
                break;
            }
        }

        return NextResponse.json({ received: true, eventType: event.type });
    } catch (err: any) {
        console.error("Stripe webhook processing error:", err);
        return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
    }
}
