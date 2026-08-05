import { NextResponse } from "next/server";
import { relationshipEngine } from "../../../../lib/relationships/relationshipEngine.ts";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "current_user";
        const query = searchParams.get("q") || searchParams.get("query") || undefined;
        const name = searchParams.get("name") || undefined;
        const relationshipType = searchParams.get("relationshipType") || undefined;
        const organizationId = searchParams.get("organizationId") || undefined;
        const tag = searchParams.get("tag") || undefined;

        const results = await relationshipEngine.search(userId, {
            query,
            name,
            relationshipType,
            organizationId,
            tag,
        });

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
