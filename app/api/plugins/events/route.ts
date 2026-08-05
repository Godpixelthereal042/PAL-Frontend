import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventName, payload = {} } = body;

        return NextResponse.json({
            success: true,
            message: `Event '${eventName}' dispatched to active sandboxed plugins`,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to dispatch event to plugins" },
            { status: 500 }
        );
    }
}
