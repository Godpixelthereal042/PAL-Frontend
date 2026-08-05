import test from "node:test";
import assert from "node:assert/strict";

import {
    createDecision,
    confirmDecision,
    getDecision,
    getActiveDecisions,
    getDecisions,
    updateDecision,
    archiveDecision,
    supersedeDecision,
} from "../lib/decisionMemory.ts";
import { buildBusinessContext } from "../lib/contextEngine.ts";
import { getDB } from "../lib/db.ts";

test("Decision Memory - creates decision defaulting to pending_confirmation", async () => {
    const testUserId = `user_dec_${Date.now()}`;

    const decision = await createDecision(testUserId, {
        title: "Pivot to B2B SaaS pricing model",
        description: "Focus exclusively on annual enterprise seats",
        rationale: "Higher LTV and lower churn",
        impactArea: "pricing",
    });

    assert.ok(decision.id.startsWith("dec_"));
    assert.equal(decision.user_id, testUserId);
    assert.equal(decision.title, "Pivot to B2B SaaS pricing model");
    assert.equal(decision.rationale, "Higher LTV and lower churn");
    assert.equal(decision.impact_area, "pricing");
    assert.equal(decision.status, "pending_confirmation");
    assert.equal(decision.confirmed_at, null);
});

test("Decision Memory - confirms decision transitioning status to active", async () => {
    const testUserId = `user_dec_${Date.now()}`;

    const pending = await createDecision(testUserId, {
        title: "Migrate database to PostgreSQL",
        rationale: "Required for pgvector support",
    });

    assert.equal(pending.status, "pending_confirmation");

    const confirmed = await confirmDecision(pending.id, testUserId);

    assert.equal(confirmed.status, "active");
    assert.ok(typeof confirmed.confirmed_at === "number");
    assert.ok(confirmed.confirmed_at > 0);

    const activeList = await getActiveDecisions(testUserId);
    assert.equal(activeList.length, 1);
    assert.equal(activeList[0].id, pending.id);
});

test("Decision Memory - creates decision autoConfirmed directly", async () => {
    const testUserId = `user_dec_${Date.now()}`;

    const autoConf = await createDecision(testUserId, {
        title: "Adopt Next.js App Router for frontend",
        autoConfirm: true,
    });

    assert.equal(autoConf.status, "active");
    assert.ok(autoConf.confirmed_at);
});

test("Decision Memory - updates decision properties", async () => {
    const testUserId = `user_dec_${Date.now()}`;

    const decision = await createDecision(testUserId, {
        title: "Initial Tech Stack Selection",
        description: "SQLite for MVP",
        autoConfirm: true,
    });

    const updated = await updateDecision(decision.id, testUserId, {
        description: "SQLite local with Cloud sync",
        impactArea: "architecture",
    });

    assert.equal(updated.description, "SQLite local with Cloud sync");
    assert.equal(updated.impact_area, "architecture");
});

test("Decision Memory - archives decision", async () => {
    const testUserId = `user_dec_${Date.now()}`;

    const decision = await createDecision(testUserId, {
        title: "Temporary feature freeze",
        autoConfirm: true,
    });

    const archived = await archiveDecision(decision.id, testUserId);

    assert.equal(archived.status, "archived");

    const activeList = await getActiveDecisions(testUserId);
    assert.equal(activeList.length, 0);
});

test("Decision Memory - supersedes decision creating chain link", async () => {
    const testUserId = `user_dec_${Date.now()}`;

    const original = await createDecision(testUserId, {
        title: "Offer free tier for all users",
        impactArea: "growth",
        autoConfirm: true,
    });

    assert.equal(original.status, "active");

    const { newDecision, supersededDecision } = await supersedeDecision(
        original.id,
        {
            title: "Replace free tier with 14-day free trial",
            rationale: "Prevent API spam and qualify leads",
            impactArea: "growth",
        },
        testUserId
    );

    assert.equal(supersededDecision.status, "superseded");
    assert.equal(supersededDecision.superseded_by, newDecision.id);

    assert.equal(newDecision.status, "active");
    assert.equal(newDecision.title, "Replace free tier with 14-day free trial");

    const activeList = await getActiveDecisions(testUserId);
    assert.equal(activeList.length, 1);
    assert.equal(activeList[0].id, newDecision.id);
});

test("Context Engine Integration - active decisions automatically included in BusinessContext", async () => {
    const testUserId = `user_ctx_dec_${Date.now()}`;

    // 1. Create one pending and one active decision
    await createDecision(testUserId, {
        title: "Pending strategic decision",
        status: "pending_confirmation",
    });

    const activeDec = await createDecision(testUserId, {
        title: "Standardize on Tailwind CSS",
        rationale: "Maintain visual consistency",
        autoConfirm: true,
    });

    // 2. Build business context
    const context = await buildBusinessContext(testUserId);

    assert.ok(Array.isArray(context.decisions));
    // Verify only active decision is included in context.decisions
    const userDecisions = context.decisions.filter((d) => d.id === activeDec.id);
    assert.equal(userDecisions.length, 1);
    assert.equal(userDecisions[0].title, "Standardize on Tailwind CSS");
    assert.equal(userDecisions[0].rationale, "Maintain visual consistency");
});
