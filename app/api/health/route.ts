import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { ProductionTelemetry } from "@/lib/telemetry/productionTelemetry";

export async function GET() {
    let dbStatus = "ok";
    try {
        const db = await getDB();
        await db.get("SELECT 1");
    } catch (err) {
        dbStatus = "error";
    }

    const telemetry = ProductionTelemetry.getInstance();
    const health = telemetry.getHealthStatus();
    const isHealthy = dbStatus === "ok";

    return NextResponse.json(
        {
            status: isHealthy ? "healthy" : "degraded",
            version: "3.2.0",
            timestamp: Date.now(),
            database: dbStatus,
            telemetry: health,
        },
        { status: isHealthy ? 200 : 503 }
    );
}
