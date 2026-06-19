import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const invoices = await db.all("SELECT * FROM invoices WHERE user_id = ? ORDER BY id DESC", [user.id]);
        return NextResponse.json(invoices);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const body = await request.json();
        const { client, amount, service, date, status, timestamp } = body;

        if (!client || !amount || !service) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const id = String(Date.now());
        const formattedDate = date || new Date().toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
        const finalStatus = status || "pending";
        const finalTimestamp = timestamp || "Just now";

        await db.run(
            `INSERT INTO invoices (id, user_id, client, amount, service, date, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, user.id, client, amount, service, formattedDate, finalStatus, finalTimestamp]
        );

        const newInvoice = await db.get("SELECT * FROM invoices WHERE id = ?", [id]);
        return NextResponse.json(newInvoice, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
