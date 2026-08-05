import { NextResponse } from "next/server";
import { globalAgentRegistry } from "@/lib/agents/agentRegistry";

export async function GET() {
    try {
        const agents = globalAgentRegistry.listAgents().map((a) => ({
            role: a.role,
            name: a.name,
            description: a.description,
            capabilities: a.capabilities,
            priority: a.priority,
        }));

        return NextResponse.json({
            success: true,
            count: agents.length,
            agents,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to list agents" },
            { status: 500 }
        );
    }
}
