import { NextResponse } from "next/server";
import { strategicSimulationEngine } from "@/lib/intelligence/simulationEngine";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { scenarioType, params = {}, compareWith, userId = "user_default" } = body;

        if (compareWith && Array.isArray(compareWith) && compareWith.length === 2) {
            const resultA = await strategicSimulationEngine.simulateScenario(userId, compareWith[0].scenarioType, compareWith[0].params);
            const resultB = await strategicSimulationEngine.simulateScenario(userId, compareWith[1].scenarioType, compareWith[1].params);
            const comparison = strategicSimulationEngine.compareScenarios(resultA, resultB);

            return NextResponse.json({
                success: true,
                comparison,
            });
        }

        if (!scenarioType) {
            return NextResponse.json(
                { success: false, error: "scenarioType is required" },
                { status: 400 }
            );
        }

        const simulation = await strategicSimulationEngine.simulateScenario(userId, scenarioType, params);

        return NextResponse.json({
            success: true,
            simulation,
        });
    } catch (err: any) {
        console.error("Simulation API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to execute simulation" },
            { status: 500 }
        );
    }
}
