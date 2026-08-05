import test from "node:test";
import assert from "node:assert/strict";
import { relationshipEngine } from "../lib/relationships/relationshipEngine.ts";
import { buildBusinessContext } from "../lib/contextEngine.ts";

test("Relationship Memory - creates organization and person records", async () => {
    const userId = "user_rel_test_1";

    const org = await relationshipEngine.createOrganization({
        userId,
        name: "Acme Ventures",
        industry: "Venture Capital",
        website: "https://acme.vc",
        relationshipStrength: "strong",
    });

    assert.ok(org.id);
    assert.equal(org.name, "Acme Ventures");
    assert.equal(org.relationshipStrength, "strong");

    const person = await relationshipEngine.createPerson({
        userId,
        name: "Sarah Jenkins",
        role: "Managing Partner",
        organizationId: org.id,
        email: "sarah@acme.vc",
        relationshipType: "Investor",
        tags: ["series-a", "board"],
    });

    assert.ok(person.id);
    assert.equal(person.name, "Sarah Jenkins");
    assert.equal(person.organizationId, org.id);
    assert.equal(person.relationshipType, "Investor");
    assert.equal(person.tags.length, 2);
});

test("Relationship Memory - logs interaction and updates person lastInteraction", async () => {
    const userId = "user_rel_test_2";
    const person = await relationshipEngine.createPerson({
        userId,
        name: "David Miller",
        role: "VP Engineering",
        relationshipType: "Client",
        tags: ["enterprise"],
    });

    const now = Date.now();
    const interaction = await relationshipEngine.logInteraction({
        userId,
        personId: person.id,
        type: "meeting",
        summary: "Quarterly product roadmap review meeting",
        source: "calendar",
        timestamp: now,
        followUpDate: "2026-08-15",
    });

    assert.ok(interaction.id);
    assert.equal(interaction.summary, "Quarterly product roadmap review meeting");
    assert.equal(interaction.followUpDate, "2026-08-15");

    const updatedPerson = await relationshipEngine.getPerson(person.id);
    assert.equal(updatedPerson.lastInteraction, now);
});

test("Relationship Memory - calculates deterministic relationship score and status", async () => {
    const userId = "user_rel_test_3";
    const person = await relationshipEngine.createPerson({
        userId,
        name: "Elena Rostova",
        relationshipType: "Investor",
        tags: ["lead-investor"],
    });

    // Log 3 recent meetings
    const now = Date.now();
    await relationshipEngine.logInteraction({
        userId,
        personId: person.id,
        type: "meeting",
        summary: "Monthly Update Call",
        source: "calendar",
        timestamp: now - 2 * 24 * 60 * 60 * 1000,
    });

    await relationshipEngine.logInteraction({
        userId,
        personId: person.id,
        type: "email",
        summary: "Follow-up email with financial deck",
        source: "manual",
        timestamp: now - 5 * 24 * 60 * 60 * 1000,
    });

    const refreshed = await relationshipEngine.getPerson(person.id);
    const interactions = await relationshipEngine.getInteractions(person.id);
    const score = await relationshipEngine.getRelationshipContext(userId);

    assert.ok(score.people.length > 0);
    const pScore = score.people.find((p) => p.id === person.id);
    assert.ok(pScore);
    assert.ok(pScore.score >= 70); // High score for active investor
    assert.equal(pScore.status, "strong");
});

test("Relationship Memory - generates relationship timeline chronologically", async () => {
    const userId = "user_rel_test_4";
    const person = await relationshipEngine.createPerson({
        userId,
        name: "Marcus Vance",
        relationshipType: "Partner",
        tags: ["channel-partner"],
    });

    const now = Date.now();
    await relationshipEngine.logInteraction({
        userId,
        personId: person.id,
        type: "call",
        summary: "Initial partnership intro call",
        source: "manual",
        timestamp: now - 10 * 24 * 60 * 60 * 1000,
    });

    await relationshipEngine.logInteraction({
        userId,
        personId: person.id,
        type: "meeting",
        summary: "Co-marketing strategy agreement",
        source: "calendar",
        timestamp: now - 2 * 24 * 60 * 60 * 1000,
    });

    const timeline = await relationshipEngine.getTimeline(person.id);
    assert.ok(timeline.length >= 3); // 1 created event + 2 interactions
    const meetingEvent = timeline.find((e) => e.summary === "Co-marketing strategy agreement");
    assert.ok(meetingEvent);
});

test("Relationship Memory - deterministic search across people and organizations", async () => {
    const userId = "user_rel_test_5";

    const org = await relationshipEngine.createOrganization({
        userId,
        name: "Apex Cybernetics",
        industry: "Robotics",
    });

    await relationshipEngine.createPerson({
        userId,
        name: "Samantha Wright",
        organizationId: org.id,
        relationshipType: "Client",
        tags: ["robotics", "vip"],
        notes: "Key sponsor for Q3 contract expansion",
    });

    const searchRes = await relationshipEngine.search(userId, { query: "robotics" });
    assert.ok(searchRes.organizations.some((o) => o.name === "Apex Cybernetics"));
    assert.ok(searchRes.people.some((p) => p.name === "Samantha Wright"));
});

test("Relationship Memory - Context Engine includes relationship intelligence", async () => {
    const userId = "user_rel_test_6";

    await relationshipEngine.createPerson({
        userId,
        name: "Alex Rivera",
        relationshipType: "Advisor",
        tags: ["tech-advisor"],
    });

    const context = await buildBusinessContext(userId);
    assert.ok(context.relationships);
    assert.ok(context.relationships.totalPeople >= 1);
    const alex = context.relationships.people.find((p) => p.name === "Alex Rivera");
    assert.ok(alex);
    assert.equal(alex.relationshipType, "Advisor");
});
