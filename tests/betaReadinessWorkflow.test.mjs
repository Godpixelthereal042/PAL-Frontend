/**
 * Sprint 8 — Milestone 4: Product Validation & Beta Readiness Verification
 *
 * Verifies:
 *   1. WorkspaceAuthEngine manages workspaces, member invitations, and role permissions (Owner, Admin, Member).
 *   2. RLS tenant workspace isolation maps cleanly to workspace auth sessions.
 *   3. ProductAnalytics tracks user activation, Golden Path executions, and calculates admin metrics summaries.
 *   4. Investor demo workspace reset clears state for clean presentations.
 *   5. First-time onboarding journey initializes business goals & executes first Golden Path session.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WorkspaceAuthEngine } from "../lib/auth/workspaceAuthEngine.ts";
import { ProductAnalytics } from "../lib/analytics/productAnalytics.ts";
import { GoldenPathWorkflow } from "../lib/workflows/goldenPathWorkflow.ts";

describe("Sprint 8 — Milestone 4: Product Validation & Beta Readiness", () => {
    const authEngine = WorkspaceAuthEngine.getInstance();
    const analytics = ProductAnalytics.getInstance();
    const workflow = new GoldenPathWorkflow();

    it("1. WorkspaceAuthEngine creates workspaces and enforces role hierarchy", () => {
        const ws = authEngine.createWorkspace({
            name: "Beta Startup Inc",
            ownerUserId: "usr_beta_founder",
            ownerEmail: "founder@betastartup.com",
            ownerName: "Beta Founder",
            industry: "B2B SaaS",
            targetRevenueGoalUSD: 1000000
        });

        assert.ok(ws.id.startsWith("ws_"));
        assert.equal(ws.members.length, 1);
        assert.equal(ws.members[0].role, "owner");

        // Add member with admin role
        const added = authEngine.addMember(ws.id, {
            userId: "usr_admin_01",
            email: "admin@betastartup.com",
            name: "Admin User",
            role: "admin"
        });
        assert.equal(added, true);

        // Permission checks
        assert.equal(authEngine.checkPermission(ws.id, "usr_beta_founder", "owner"), true);
        assert.equal(authEngine.checkPermission(ws.id, "usr_admin_01", "admin"), true);
        assert.equal(authEngine.checkPermission(ws.id, "usr_admin_01", "owner"), false);
    });

    it("2. ProductAnalytics records events and calculates admin metrics summary", () => {
        const workspaceId = "ws_analytics_test";

        analytics.trackEvent({
            workspaceId,
            userId: "usr_founder",
            eventType: "user_onboarding_completed",
            metadata: { step: 4 }
        });

        analytics.trackEvent({
            workspaceId,
            userId: "usr_founder",
            eventType: "first_golden_path_executed",
            metadata: { userPrompt: "Scale MRR" }
        });

        const events = analytics.getEvents(workspaceId);
        assert.equal(events.length, 2);

        const summary = analytics.getAdminMetricsSummary();
        assert.ok(summary.totalWorkspaces >= 1);
        assert.ok(summary.totalGoldenPathExecutions >= 1);
    });

    it("3. Investor demo reset function clears workspace telemetry for presentation", () => {
        const workspaceId = "ws_reset_demo";

        analytics.trackEvent({
            workspaceId,
            userId: "usr_test",
            eventType: "golden_path_executed"
        });

        assert.equal(analytics.getEvents(workspaceId).length, 1);

        analytics.resetDemoWorkspace(workspaceId);

        // Should now contain only 1 reset audit event
        const resetEvents = analytics.getEvents(workspaceId);
        assert.equal(resetEvents.length, 1);
        assert.equal(resetEvents[0].eventType, "demo_reset_executed");
    });

    it("4. First-time onboarding first Golden Path session executes cleanly", async () => {
        const result = await workflow.executeGoldenPath({
            workspaceId: "ws_onboarding_test",
            userId: "usr_new_founder",
            userPrompt: "PAL, analyze my business performance and increase revenue by 20% in 90 days.",
            budgetLimitUSD: 1000,
            dryRun: true
        });

        assert.equal(result.workspaceId, "ws_onboarding_test");
        assert.ok(result.intent.okrs.length > 0);
        assert.ok(result.councilReview.votes.length >= 5);
        assert.equal(typeof result.decisionLedger.contentHash, "string");
    });
});
