import { NextResponse } from "next/server";
import { executiveEventBus } from "@/lib/events/executiveEventBus";
import type { ExecutiveEvent } from "@/lib/events/eventTypes";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, severity = "medium", businessImpact = "Operational event", confidence = 0.90, urgency = "medium", source = "manual_publish", relatedEntities, payload } = body;

        if (!type) {
            return NextResponse.json(
                { success: false, error: "Event type is required" },
                { status: 400 }
            );
        }

        const event: ExecutiveEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type,
            severity,
            businessImpact,
            confidence,
            urgency,
            source,
            timestamp: Date.now(),
            relatedEntities,
            payload,
        };

        const published = await executiveEventBus.publish(event);

        return NextResponse.json({
            success: true,
            published,
            event,
        });
    } catch (err: any) {
        console.error("Event publish API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to publish event" },
            { status: 500 }
        );
    }
}
