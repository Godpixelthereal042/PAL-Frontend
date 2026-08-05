import { analyzeRelationships } from "./relationshipAnalyzer.ts";
import type { RelationshipInsight } from "./types.ts";

export async function getRelationshipInsights(userId: string): Promise<RelationshipInsight[]> {
    return analyzeRelationships(userId);
}

export async function getInsightsForPerson(
    userId: string,
    personId: string
): Promise<RelationshipInsight[]> {
    const allInsights = await analyzeRelationships(userId);
    return allInsights.filter((i) => i.personId === personId);
}
