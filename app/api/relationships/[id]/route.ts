import { NextResponse } from "next/server";
import { relationshipEngine } from "../../../../lib/relationships/relationshipEngine.ts";

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const person = await relationshipEngine.getPerson(id);

        if (person) {
            const timeline = await relationshipEngine.getTimeline(id);
            const interactions = await relationshipEngine.getInteractions(id);
            return NextResponse.json({ success: true, type: "person", person, timeline, interactions });
        }

        const org = await relationshipEngine.getOrganization(id);
        if (org) {
            return NextResponse.json({ success: true, type: "organization", organization: org });
        }

        return NextResponse.json({ success: false, error: `Entity '${id}' not found` }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const person = await relationshipEngine.getPerson(id);
        if (person) {
            const updated = await relationshipEngine.updatePerson(id, body);
            return NextResponse.json({ success: true, person: updated });
        }

        const org = await relationshipEngine.getOrganization(id);
        if (org) {
            const updated = await relationshipEngine.updateOrganization(id, body);
            return NextResponse.json({ success: true, organization: updated });
        }

        return NextResponse.json({ success: false, error: `Entity '${id}' not found` }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const personDeleted = await relationshipEngine.deletePerson(id);
        if (personDeleted) {
            return NextResponse.json({ success: true, message: `Person '${id}' deleted` });
        }

        const orgDeleted = await relationshipEngine.deleteOrganization(id);
        if (orgDeleted) {
            return NextResponse.json({ success: true, message: `Organization '${id}' deleted` });
        }

        return NextResponse.json({ success: false, error: `Entity '${id}' not found` }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
