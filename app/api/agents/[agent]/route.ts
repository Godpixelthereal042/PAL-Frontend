import { NextResponse } from "next/server";
import { globalAgentRegistry } from "@/lib/agents/agentRegistry";
import { cooOrchestrator } from "@/lib/agents/cooOrchestrator";
import type { AgentRole } from "@/lib/agents/types";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ agent: string }> }
) {
    try {
        const { agent } = await params;
        const role = agent as AgentRole;
        const targetAgent = globalAgentRegistry.get(role);

        if (!targetAgent) {
            return NextResponse.json(
                { success: false, error: `Agent '${agent}' not found in registry` },
                { status: 404 }
            );
        }

        const orchestration = await cooOrchestrator.orchestrate("user_default", undefined, { roles: [role] });
        const agentResponse = orchestration.agentResponses[0];

        return NextResponse.json({
            success: true,
            agent: {
                role: targetAgent.role,
                name: targetAgent.name,
                description: targetAgent.description,
                capabilities: targetAgent.capabilities,
            },
            analysis: agentResponse,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch agent details" },
            { status: 500 }
        );
    }
}
