import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });
        }

        const db = await getDB();
        const result = await db.run("DELETE FROM schedules WHERE id = ?", [id]);

        if (result.changes === 0) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `Schedule ${id} deleted` });
    } catch (error) {
        console.error("Database delete error:", error);
        return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
    }
}
