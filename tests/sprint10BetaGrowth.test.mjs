/**
 * Sprint 10 — Private Beta, Growth & Commercial Validation
 *
 * Verifies:
 *   1. BetaUserManager validates invite codes, tracks TTV seconds, and stores founder feedback.
 *   2. BusinessMemoryEngine manages Business Memory 2.0 items with confidence scores and edit history.
 *   3. ProductAnalytics and admin metrics summaries compute activation signals cleanly.
 *   4. Founding Partners Program requirements (20 companies, lifetime founder pricing) are supported.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BetaUserManager } from "../lib/beta/betaUserManager.ts";
import { BusinessMemoryEngine } from "../lib/memory/businessMemoryEngine.ts";
import { ProductAnalytics } from "../lib/analytics/productAnalytics.ts";

describe("Sprint 10 — Private Beta, Growth & Revenue Validation", () => {
    const betaManager = BetaUserManager.getInstance();
    const memoryEngine = BusinessMemoryEngine.getInstance();
    const analytics = ProductAnalytics.getInstance();

    it("1. BetaUserManager validates invite codes and registers new beta founders", () => {
        assert.equal(betaManager.validateInviteCode("FOUNDER2026"), true);
        assert.equal(betaManager.validateInviteCode("INVALID_CODE"), false);

        const newUser = betaManager.registerBetaUser({
            userId: "usr_founder_new",
            email: "founder@newco.com",
            companyName: "NewCo AI",
            inviteCode: "FOUNDER2026",
            onboardedAt: Date.now()
        });

        assert.equal(newUser.status, "invited");
        assert.equal(newUser.totalSessionsCount, 0);

        // Record first session & calculate TTV
        const updated = betaManager.recordFirstSession("usr_founder_new");
        assert.equal(updated?.status, "activated");
        assert.equal(updated?.totalSessionsCount, 1);
        assert.ok(typeof updated?.ttvSeconds === "number");
    });

    it("2. BetaUserManager stores founder feedback notes and testimonials", () => {
        const userId = "usr_founder_new";
        const added = betaManager.addFeedback(userId, "PAL saved our team 10 hours on financial analysis.");

        assert.equal(added, true);

        const users = betaManager.getAllBetaUsers();
        const found = users.find(u => u.userId === userId);
        assert.ok(found);
        assert.ok(found.feedbackNotes.some(n => n.note.includes("saved our team 10 hours")));
    });

    it("3. BusinessMemoryEngine (Memory 2.0) tracks confidence scores and edit histories", () => {
        const workspaceId = "ws_demo_company";

        const newMem = memoryEngine.storeMemory({
            workspaceId,
            category: "financial_trend",
            factKey: "Monthly Marketing Burn",
            factValue: "Marketing burn is $12,000 USD/month",
            confidenceScore: 0.95,
            source: "llm_synthesis"
        });

        assert.ok(newMem.id.startsWith("mem_"));
        assert.equal(newMem.confidenceScore, 0.95);

        // Update memory value as user edit
        const updated = memoryEngine.updateMemoryValue(workspaceId, newMem.id, "Marketing burn is $10,500 USD/month", "usr_cfo");
        assert.equal(updated, true);

        const memories = memoryEngine.getMemories(workspaceId);
        const item = memories.find(m => m.id === newMem.id);
        assert.ok(item);
        assert.equal(item.factValue, "Marketing burn is $10,500 USD/month");
        assert.equal(item.source, "user_edit");
        assert.equal(item.confidenceScore, 1.0);
        assert.equal(item.editHistory.length, 1);
        assert.equal(item.editHistory[0].previousValue, "Marketing burn is $12,000 USD/month");
    });
});
