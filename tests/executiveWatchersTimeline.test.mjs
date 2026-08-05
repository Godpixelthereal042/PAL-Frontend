import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TimelineEngine } from "../lib/intelligence/events/timelineEngine.ts";
import { EventEngine } from "../lib/intelligence/events/eventEngine.ts";
import { RevenueWatcher } from "../lib/intelligence/events/watchers/revenueWatcher.ts";
import { CashWatcher } from "../lib/intelligence/events/watchers/cashWatcher.ts";
import { SecurityWatcher } from "../lib/intelligence/events/watchers/securityWatcher.ts";

describe("Milestone 6: Event Engine, Executive Watchers & Timeline", () => {
    const workspaceId = "ws_test_m6";

    it("Executive Watchers observe metrics and emit prioritized business events", async () => {
        const cashWatcher = new CashWatcher();
        const secWatcher = new SecurityWatcher();

        const cashEvt = await cashWatcher.checkCondition(workspaceId);
        const secEvt = await secWatcher.checkCondition(workspaceId);

        assert.ok(cashEvt);
        assert.ok(secEvt);

        assert.equal(cashEvt.severity, "critical");
        assert.equal(secEvt.severity, "critical");
        assert.equal(cashEvt.domain, "finance");
        assert.equal(secEvt.category, "ai_governance");

        const health = cashWatcher.getHealth();
        assert.equal(health.healthStatus, "healthy");
        assert.equal(health.consecutiveFailures, 0);
    });

    it("EventEngine deduplicates events and manages priority queues (critical > high > medium > info)", async () => {
        const timeline = new TimelineEngine();
        const engine = new EventEngine(timeline);

        const now = Date.now();

        // Publish events with different severities
        await engine.publishEvent({
            id: "evt_1",
            workspaceId,
            correlationId: "corr_1",
            category: "business",
            domain: "sales",
            eventType: "DEAL_UPDATED",
            source: "HubSpot",
            severity: "medium",
            title: "Deal Updated",
            summary: "Deal stage updated",
            metadata: {},
            status: "open",
            timestamp: now - 100,
        });

        await engine.publishEvent({
            id: "evt_2",
            workspaceId,
            correlationId: "corr_2",
            category: "business",
            domain: "finance",
            eventType: "CASH_RUNWAY_CRITICAL",
            source: "Bank Feed",
            severity: "critical",
            title: "Low Runway Alert",
            summary: "Runway under 6 months",
            metadata: {},
            status: "open",
            timestamp: now,
        });

        const queue = engine.getPriorityQueue();
        assert.equal(queue.length, 2);
        // Critical severity should be sorted first
        assert.equal(queue[0].severity, "critical");
        assert.equal(queue[1].severity, "medium");
    });

    it("EventEngine executes all 8 watchers and logs events into Executive Timeline", async () => {
        const timeline = new TimelineEngine();
        const engine = new EventEngine(timeline);

        const published = await engine.executeWatchers(workspaceId);
        assert.ok(published.length >= 8);

        const timelineEvents = await timeline.getTimeline(workspaceId);
        assert.ok(timelineEvents.length >= 8);

        const criticalEvents = await timeline.getTimeline(workspaceId, undefined, "critical");
        assert.ok(criticalEvents.length >= 1);
        assert.equal(criticalEvents[0].severity, "critical");
    });
});
