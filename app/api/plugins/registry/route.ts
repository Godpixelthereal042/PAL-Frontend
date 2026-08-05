import { NextResponse } from "next/server";
import { globalCapabilityRegistry } from "@/lib/plugins/sdk/capabilityRegistry";
import { globalSkillsFramework } from "@/lib/plugins/sdk/skillsFramework";

export async function GET() {
    try {
        const capabilities = globalCapabilityRegistry.listCapabilities();
        const skills = globalSkillsFramework.listSkills();

        return NextResponse.json({
            success: true,
            capabilities,
            skills,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "Failed to fetch plugin registry" },
            { status: 500 }
        );
    }
}
