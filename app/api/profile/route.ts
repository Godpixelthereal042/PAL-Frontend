import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        const profileId = user ? user.id : "current_user";

        const db = await getDB();
        const profile = await db.get("SELECT * FROM profile WHERE id = ?", [profileId]);
        if (!profile) {
            const fallback = await db.get("SELECT * FROM profile WHERE id = 'current_user'");
            if (!fallback) {
                return NextResponse.json({ error: "Profile not found" }, { status: 404 });
            }
            return NextResponse.json(fallback);
        }
        return NextResponse.json(profile);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        const profileId = user ? user.id : "current_user";

        const db = await getDB();
        const body = await request.json();
        const { fullName, email, companyName, targetAudience, primaryKPI, selectedPersona } = body;

        const existing = await db.get("SELECT * FROM profile WHERE id = ?", [profileId]);

        const finalFullName = fullName !== undefined ? fullName : (existing?.fullName || (user ? user.name : "Emmanuel"));
        const finalEmail = email !== undefined ? email : (existing?.email || (user ? user.email : "emmanuel@thebaseapp.com"));
        const finalCompanyName = companyName !== undefined ? companyName : (existing?.companyName || "The Base App");
        const finalTargetAudience = targetAudience !== undefined ? targetAudience : (existing?.targetAudience || "Web3 Developers");
        const finalPrimaryKPI = primaryKPI !== undefined ? primaryKPI : (existing?.primaryKPI || "User Retention");
        const finalSelectedPersona = selectedPersona !== undefined ? selectedPersona : (existing?.selectedPersona || "growth");

        if (existing) {
            await db.run(
                `UPDATE profile SET fullName = ?, email = ?, companyName = ?, targetAudience = ?, primaryKPI = ?, selectedPersona = ? WHERE id = ?`,
                [finalFullName, finalEmail, finalCompanyName, finalTargetAudience, finalPrimaryKPI, finalSelectedPersona, profileId]
            );
        } else {
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [profileId, finalFullName, finalEmail, finalCompanyName, finalTargetAudience, finalPrimaryKPI, finalSelectedPersona]
            );
        }

        // Keep current_user in sync if we updated a logged-in user profile
        if (profileId !== "current_user") {
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                 VALUES ('current_user', ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET 
                 fullName = excluded.fullName,
                 email = excluded.email,
                 companyName = excluded.companyName,
                 targetAudience = excluded.targetAudience,
                 primaryKPI = excluded.primaryKPI,
                 selectedPersona = excluded.selectedPersona`,
                [finalFullName, finalEmail, finalCompanyName, finalTargetAudience, finalPrimaryKPI, finalSelectedPersona]
            );
        }

        const updated = await db.get("SELECT * FROM profile WHERE id = ?", [profileId]);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    return POST(request);
}

