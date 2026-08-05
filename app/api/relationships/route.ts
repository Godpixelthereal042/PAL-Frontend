import { NextResponse } from "next/server";
import { relationshipEngine } from "../../../lib/relationships/relationshipEngine.ts";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "current_user";
        const type = searchParams.get("type"); // "people" | "organizations" | "insights" | "context"

        if (type === "organizations") {
            const orgs = await relationshipEngine.getOrganizations(userId);
            return NextResponse.json({ success: true, organizations: orgs });
        }

        if (type === "insights") {
            const insights = await relationshipEngine.getInsights(userId);
            return NextResponse.json({ success: true, insights });
        }

        if (type === "context") {
            const context = await relationshipEngine.getRelationshipContext(userId);
            return NextResponse.json({ success: true, context });
        }

        const people = await relationshipEngine.getPeople(userId);
        return NextResponse.json({ success: true, people });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch relationship data" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const userId = body.userId || "current_user";
        const entityType = body.entityType || "person"; // "person" | "organization" | "interaction"

        if (entityType === "organization") {
            if (!body.name) {
                return NextResponse.json({ success: false, error: "Organization name is required" }, { status: 400 });
            }
            const org = await relationshipEngine.createOrganization({
                userId,
                name: body.name,
                industry: body.industry,
                website: body.website,
                description: body.description,
                relationshipStrength: body.relationshipStrength || "healthy",
                notes: body.notes,
            });
            return NextResponse.json({ success: true, organization: org }, { status: 201 });
        }

        if (entityType === "interaction") {
            if (!body.personId || !body.summary) {
                return NextResponse.json(
                    { success: false, error: "personId and summary are required for interaction" },
                    { status: 400 }
                );
            }
            const interaction = await relationshipEngine.logInteraction({
                userId,
                personId: body.personId,
                type: body.type || "note",
                summary: body.summary,
                source: body.source || "manual",
                timestamp: body.timestamp || Date.now(),
                followUpDate: body.followUpDate,
                metadata: body.metadata,
            });
            return NextResponse.json({ success: true, interaction }, { status: 201 });
        }

        // Default: Person
        if (!body.name || !body.relationshipType) {
            return NextResponse.json(
                { success: false, error: "name and relationshipType are required for person" },
                { status: 400 }
            );
        }

        const person = await relationshipEngine.createPerson({
            userId,
            name: body.name,
            role: body.role,
            organizationId: body.organizationId,
            email: body.email,
            phone: body.phone,
            relationshipType: body.relationshipType,
            tags: body.tags || [],
            notes: body.notes,
            metadata: body.metadata,
        });

        return NextResponse.json({ success: true, person }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create relationship entity" },
            { status: 500 }
        );
    }
}
