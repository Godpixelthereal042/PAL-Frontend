import { getDB } from "../db.ts";
import { getPersonById } from "./peopleRegistry.ts";
import { getInteractionsForPerson } from "./interactionHistory.ts";
import type { TimelineEvent } from "./types.ts";

export async function getRelationshipTimeline(
    personId: string,
    limit: number = 100
): Promise<TimelineEvent[]> {
    const db = await getDB();
    const person = await getPersonById(personId);
    if (!person) return [];

    const events: TimelineEvent[] = [];

    // 1. Relationship Created Event
    events.push({
        id: `timeline_created_${person.id}`,
        personId: person.id,
        eventType: "relationship_created",
        summary: `Relationship profile created for ${person.name} (${person.relationshipType})`,
        timestamp: person.createdAt,
        details: { role: person.role, email: person.email, phone: person.phone },
    });

    // 2. Interaction Events
    const interactions = await getInteractionsForPerson(person.id, limit);
    for (const item of interactions) {
        events.push({
            id: `timeline_integ_${item.id}`,
            personId: person.id,
            eventType: item.type === "meeting" ? "meeting" : "interaction",
            summary: item.summary,
            timestamp: item.timestamp,
            details: {
                type: item.type,
                source: item.source,
                followUpDate: item.followUpDate,
                metadata: item.metadata,
            },
        });
    }

    // 3. Decisions linked to Person/Org
    try {
        const decisions = (await db.all(
            "SELECT * FROM decisions WHERE description LIKE ? OR title LIKE ? ORDER BY created_at DESC LIMIT 20",
            [`%${person.name}%`, `%${person.name}%`]
        )) || [];

        for (const dec of decisions) {
            events.push({
                id: `timeline_dec_${dec.id}`,
                personId: person.id,
                eventType: "decision",
                summary: `Decision: ${dec.title}`,
                timestamp: Number(dec.created_at),
                details: { status: dec.status, description: dec.description },
            });
        }
    } catch {}

    // 4. Invoices linked to Person/Org
    try {
        const invoices = (await db.all(
            "SELECT * FROM invoices WHERE client_name LIKE ? OR client_email LIKE ? ORDER BY date DESC LIMIT 20",
            [`%${person.name}%`, `%${person.email || "___"}%`]
        )) || [];

        for (const inv of invoices) {
            events.push({
                id: `timeline_inv_${inv.id}`,
                personId: person.id,
                eventType: "invoice",
                summary: `Invoice #${inv.invoice_number || inv.id}: ${inv.amount} (${inv.status})`,
                timestamp: new Date(inv.date || inv.created_at || Date.now()).getTime(),
                details: { amount: inv.amount, status: inv.status },
            });
        }
    } catch {}

    // Sort chronologically descending (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    return events.slice(0, limit);
}
