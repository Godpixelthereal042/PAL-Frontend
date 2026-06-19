import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import {
    buildFallbackRoadmap,
    createProjectFromIdea,
    IdeaEngineError,
    normalizeRoadmap,
    validateIdeaInput
} from "@/lib/ideaEngine";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const input = validateIdeaInput(body);
        const rawRoadmap = body && typeof body === "object" && "roadmap" in body ? body.roadmap : null;
        const roadmap = normalizeRoadmap(
            rawRoadmap || buildFallbackRoadmap(input.idea, input.industry || "General"),
            input.idea,
            input.industry
        );
        const db = await getDB();
        const result = await createProjectFromIdea(db, roadmap);

        return NextResponse.json(
            {
                ...result,
                message: "PAL turned your idea into a project with starter tasks."
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof IdeaEngineError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("Idea project engine failed", error);
        return NextResponse.json(
            { error: "PAL could not create the project right now. Please try again." },
            { status: 500 }
        );
    }
}
