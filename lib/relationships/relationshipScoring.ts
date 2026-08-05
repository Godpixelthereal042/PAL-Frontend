import { getDB } from "../db.ts";
import type { Person, Interaction, RelationshipScore } from "./types.ts";

export async function computeAndSaveRelationshipScore(
    person: Person,
    interactions: Interaction[]
): Promise<RelationshipScore> {
    const scoreObj = calculateRelationshipScore(person, interactions);

    const db = await getDB();
    await db.run(
        `INSERT INTO relationship_scores (person_id, score, status, trend, confidence, explanation, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(person_id) DO UPDATE SET
            score = excluded.score,
            status = excluded.status,
            trend = excluded.trend,
            confidence = excluded.confidence,
            explanation = excluded.explanation,
            updated_at = excluded.updated_at`,
        [
            scoreObj.personId,
            scoreObj.score,
            scoreObj.status,
            scoreObj.trend,
            scoreObj.confidence,
            scoreObj.explanation,
            scoreObj.updatedAt,
        ]
    );

    return scoreObj;
}

export function calculateRelationshipScore(
    person: Person,
    interactions: Interaction[]
): RelationshipScore {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // 1. Base Score & Weighting by Relationship Type
    let baseWeight = 70;
    const relType = person.relationshipType;
    if (relType === "Investor") baseWeight = 95;
    else if (relType === "Client") baseWeight = 90;
    else if (relType === "Partner") baseWeight = 85;
    else if (relType === "Advisor" || relType === "Mentor") baseWeight = 85;
    else if (relType === "Team Member") baseWeight = 80;
    else if (relType === "Lead" || relType === "Prospect") baseWeight = 75;

    // 2. Recency Evaluation
    const lastTime = person.lastInteraction || (interactions.length > 0 ? interactions[0].timestamp : person.createdAt);
    const daysSinceLast = Math.max(0, Math.floor((now - lastTime) / DAY_MS));
    let recencyScore = 0;
    let recencyNote = "";

    if (daysSinceLast <= 7) {
        recencyScore = 25;
        recencyNote = `Recent contact ${daysSinceLast} day(s) ago (+25)`;
    } else if (daysSinceLast <= 14) {
        recencyScore = 15;
        recencyNote = `Contact within last 2 weeks (${daysSinceLast} days ago) (+15)`;
    } else if (daysSinceLast <= 30) {
        recencyScore = 5;
        recencyNote = `Contact within last month (${daysSinceLast} days ago) (+5)`;
    } else if (daysSinceLast <= 60) {
        recencyScore = -15;
        recencyNote = `No contact for ${daysSinceLast} days (-15)`;
    } else {
        recencyScore = -30;
        recencyNote = `Inactive for ${daysSinceLast} days (-30)`;
    }

    // 3. Interaction Frequency (last 60 days)
    const sixtyDaysAgo = now - 60 * DAY_MS;
    const recentInteractions = interactions.filter((i) => i.timestamp >= sixtyDaysAgo);
    const count60 = recentInteractions.length;
    let frequencyScore = 0;
    let frequencyNote = "";

    if (count60 >= 5) {
        frequencyScore = 20;
        frequencyNote = `High engagement frequency (${count60} interactions in 60d) (+20)`;
    } else if (count60 >= 3) {
        frequencyScore = 12;
        frequencyNote = `Moderate engagement frequency (${count60} interactions in 60d) (+12)`;
    } else if (count60 >= 1) {
        frequencyScore = 5;
        frequencyNote = `Low engagement frequency (${count60} interaction in 60d) (+5)`;
    } else {
        frequencyScore = -15;
        frequencyNote = `Zero interactions in last 60 days (-15)`;
    }

    // 4. Follow-up Status
    let followUpScore = 0;
    let followUpNote = "";
    const pendingFollowUps = interactions.filter(
        (i) => i.followUpDate && new Date(i.followUpDate).getTime() < now
    );

    if (pendingFollowUps.length > 0) {
        followUpScore = -25;
        followUpNote = `Has ${pendingFollowUps.length} overdue follow-up commitment(s) (-25)`;
    } else if (count60 > 0) {
        followUpScore = 10;
        followUpNote = `Follow-ups on schedule (+10)`;
    }

    // 5. Total Score calculation
    let rawScore = Math.round(baseWeight * 0.4 + (recencyScore + frequencyScore + followUpScore + 50) * 0.6);
    const score = Math.max(0, Math.min(100, rawScore));

    // 6. Deterministic Status
    let status: "strong" | "healthy" | "at_risk" | "inactive" = "healthy";
    if (score >= 80) status = "strong";
    else if (score >= 60) status = "healthy";
    else if (score >= 40) status = "at_risk";
    else status = "inactive";

    // 7. Deterministic Trend (comparing last 30d vs 31-60d)
    const thirtyDaysAgo = now - 30 * DAY_MS;
    const countLast30 = interactions.filter((i) => i.timestamp >= thirtyDaysAgo).length;
    const countPrior30 = interactions.filter((i) => i.timestamp >= sixtyDaysAgo && i.timestamp < thirtyDaysAgo).length;

    let trend: "improving" | "stable" | "declining" = "stable";
    if (countLast30 > countPrior30 + 1) trend = "improving";
    else if (countLast30 < countPrior30 || daysSinceLast > 30) trend = "declining";

    // 8. Confidence Score (based on data completeness)
    let confidence = 70;
    if (interactions.length >= 3) confidence += 15;
    if (person.organizationId) confidence += 10;
    if (person.email || person.phone) confidence += 5;
    confidence = Math.min(100, confidence);

    // 9. Explanation Assembly
    const explanation = `Score ${score}/100 (${status}, ${trend}). Type: ${relType} (base weight ${baseWeight}). ${recencyNote}. ${frequencyNote}. ${followUpNote}.`;

    return {
        personId: person.id,
        score,
        status,
        trend,
        confidence,
        explanation,
        updatedAt: now,
    };
}
