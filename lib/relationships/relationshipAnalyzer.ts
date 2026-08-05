import { getPeople } from "./peopleRegistry.ts";
import { getOrganizations } from "./organizationRegistry.ts";
import { getInteractionsForPerson } from "./interactionHistory.ts";
import { calculateRelationshipScore } from "./relationshipScoring.ts";
import type { Person, RelationshipInsight } from "./types.ts";

export async function analyzeRelationships(userId: string): Promise<RelationshipInsight[]> {
    const people = await getPeople(userId);
    const orgs = await getOrganizations(userId);
    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

    const insights: RelationshipInsight[] = [];
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (const person of people) {
        const interactions = await getInteractionsForPerson(person.id, 20);
        const score = calculateRelationshipScore(person, interactions);
        const orgName = person.organizationId ? orgMap.get(person.organizationId) : undefined;
        const daysSinceLast = person.lastInteraction
            ? Math.floor((now - person.lastInteraction) / DAY_MS)
            : Math.floor((now - person.createdAt) / DAY_MS);

        // 1. Check for Investor follow-up
        if (person.relationshipType === "Investor") {
            const overdueFollowUp = interactions.find(
                (i) => i.followUpDate && new Date(i.followUpDate).getTime() < now
            );
            if (overdueFollowUp || daysSinceLast > 30) {
                insights.push({
                    id: `insight_inv_${person.id}_${now}`,
                    personId: person.id,
                    personName: person.name,
                    organizationName: orgName,
                    relationshipType: person.relationshipType,
                    category: "investor_attention",
                    title: `Investor update or follow-up required for ${person.name}`,
                    description: overdueFollowUp
                        ? `Overdue commitment from interaction on ${new Date(overdueFollowUp.timestamp).toLocaleDateString()}: "${overdueFollowUp.summary}"`
                        : `No interaction with investor ${person.name} for ${daysSinceLast} days.`,
                    supportingData: [
                        `Last interaction: ${daysSinceLast} day(s) ago`,
                        `Relationship score: ${score.score}/100 (${score.status})`,
                        overdueFollowUp ? `Follow-up target: ${overdueFollowUp.followUpDate}` : "Recommended: Send monthly investor update",
                    ],
                    severity: "high",
                });
            }
        }

        // 2. Check for Inactive Client
        if (person.relationshipType === "Client" && daysSinceLast >= 30) {
            insights.push({
                id: `insight_cli_${person.id}_${now}`,
                personId: person.id,
                personName: person.name,
                organizationName: orgName,
                relationshipType: person.relationshipType,
                category: "inactive_client",
                title: `Client ${person.name}${orgName ? ` (${orgName})` : ""} inactive for ${daysSinceLast} days`,
                description: `Key client has had zero logged interactions in the last ${daysSinceLast} days. Engagement risk detected.`,
                supportingData: [
                    `Last contact: ${daysSinceLast} days ago`,
                    `Current relationship score: ${score.score}/100 (${score.status})`,
                    `Total past interactions: ${interactions.length}`,
                ],
                severity: daysSinceLast >= 45 ? "high" : "medium",
            });
        }

        // 3. Check for Overdue Follow-ups
        const overdue = interactions.filter((i) => i.followUpDate && new Date(i.followUpDate).getTime() < now);
        if (overdue.length > 0 && person.relationshipType !== "Investor") {
            insights.push({
                id: `insight_fol_${person.id}_${now}`,
                personId: person.id,
                personName: person.name,
                organizationName: orgName,
                relationshipType: person.relationshipType,
                category: "overdue_follow_up",
                title: `Overdue follow-up for ${person.name}`,
                description: `You have ${overdue.length} pending follow-up commitment(s) with ${person.name}.`,
                supportingData: overdue.map(
                    (o) => `[Due ${o.followUpDate}] ${o.summary} (${o.source})`
                ),
                severity: "medium",
            });
        }

        // 4. Check for At-Risk Relationship
        if (score.status === "at_risk" || score.status === "inactive") {
            insights.push({
                id: `insight_risk_${person.id}_${now}`,
                personId: person.id,
                personName: person.name,
                organizationName: orgName,
                relationshipType: person.relationshipType,
                category: "at_risk",
                title: `Important relationship with ${person.name} is at risk`,
                description: score.explanation,
                supportingData: [
                    `Score: ${score.score}/100`,
                    `Trend: ${score.trend}`,
                    `Last interaction: ${daysSinceLast} day(s) ago`,
                ],
                severity: "high",
            });
        }

        // 5. Check for Strong Momentum
        if (score.status === "strong" && score.trend === "improving") {
            insights.push({
                id: `insight_mom_${person.id}_${now}`,
                personId: person.id,
                personName: person.name,
                organizationName: orgName,
                relationshipType: person.relationshipType,
                category: "strong_momentum",
                title: `Strong collaboration trend with ${person.name}`,
                description: `Frequent recent interactions and positive momentum recorded with ${person.name}.`,
                supportingData: [
                    `Score: ${score.score}/100 (${score.status})`,
                    `Recent interactions (30d): ${interactions.filter((i) => i.timestamp >= now - 30 * DAY_MS).length}`,
                ],
                severity: "low",
            });
        }
    }

    return insights;
}
