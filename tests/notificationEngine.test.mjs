import test from "node:test";
import assert from "node:assert/strict";

import {
    processNotifications,
    getNotifications,
    markNotificationRead,
    dismissNotification,
} from "../lib/notifications/notificationEngine.ts";
import { generatePriorityCandidates } from "../lib/notifications/priorityNotificationEngine.ts";
import { generateRiskCandidates } from "../lib/notifications/riskNotificationEngine.ts";
import { generateReminderCandidates } from "../lib/notifications/reminderNotificationEngine.ts";
import { generateOpportunityCandidates } from "../lib/notifications/opportunityNotificationEngine.ts";
import { evaluateNotificationPolicies, isQuietHours } from "../lib/notifications/notificationPolicyEngine.ts";
import { saveNotificationPreferences, getNotificationPreferences } from "../lib/notifications/notificationPreferences.ts";
import { saveNotification } from "../lib/notifications/notificationHistory.ts";

test("Notification Intelligence Engine - generates candidate notifications across engines", () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL Labs" },
        business: { priorities: "Scale Enterprise ARR" },
        projects: [],
        tasks: [
            { id: "t_overdue_1", title: "Task 1 Overdue", priority: "high", status: "In Progress", dueDate: "2026-07-01" },
            { id: "t_overdue_2", title: "Task 2 Overdue", priority: "high", status: "In Progress", dueDate: "2026-07-01" },
        ],
        calendar: [
            { id: "c1", title: "Board Meeting", time: "14:00" },
        ],
        notifications: [],
        invoices: [
            { id: "inv1", client: "Acme Corp", amount: "$5000", service: "Dev", date: "2026-06-01", status: "overdue" },
        ],
        decisions: [
            { id: "d1", title: "Expand Sales Team", status: "pending_confirmation" },
        ],
        summary: { activeProjects: 0, overdueItems: 3, highPriorityItems: 2 },
    };

    const priorityCands = generatePriorityCandidates(mockContext);
    const riskCands = generateRiskCandidates(mockContext);
    const reminderCands = generateReminderCandidates(mockContext);
    const opportunityCands = generateOpportunityCandidates(mockContext);

    assert.ok(priorityCands.length >= 1);
    assert.ok(riskCands.length >= 3);
    assert.ok(reminderCands.length >= 1);
    assert.ok(opportunityCands.length >= 1);
});

test("Notification Policy Engine - intelligent batching batches 2+ overdue tasks into 1 summary candidate", () => {
    const mockCandidates = [
        { category: "tasks", type: "task_overdue", title: "Task 1", message: "m1", priority: "high", severity: "high", metadata: { taskId: "t1" } },
        { category: "tasks", type: "task_overdue", title: "Task 2", message: "m2", priority: "high", severity: "high", metadata: { taskId: "t2" } },
    ];

    const prefs = {
        userId: "u1",
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
        minPriority: "low",
        batchingEnabled: true,
        enabledCategories: ["tasks"],
        enabledChannels: ["dashboard"],
        updatedAt: Date.now(),
    };

    const evaluated = evaluateNotificationPolicies(mockCandidates, prefs, []);
    assert.equal(evaluated.length, 1);
    assert.equal(evaluated[0].type, "batched_tasks_overdue");
    assert.ok(evaluated[0].title.includes("2 Overdue Tasks"));
});

test("Notification Policy Engine - quiet hours suppresses non-critical notifications", () => {
    const nightTime = new Date("2026-07-25T23:30:00Z");
    assert.ok(isQuietHours(nightTime, "22:00", "07:00"));

    const mockCandidates = [
        { category: "calendar", type: "meeting_starts_soon", title: "Low alert", message: "m1", priority: "medium", severity: "low" },
        { category: "financial", type: "invoice_overdue", title: "Critical alert", message: "m2", priority: "urgent", severity: "critical" },
    ];

    const prefs = {
        userId: "u1",
        quietHoursEnabled: true,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
        minPriority: "low",
        batchingEnabled: false,
        enabledCategories: ["calendar", "financial"],
        enabledChannels: ["dashboard"],
        updatedAt: Date.now(),
    };

    const evaluated = evaluateNotificationPolicies(mockCandidates, prefs, [], nightTime);
    assert.equal(evaluated.length, 1);
    assert.equal(evaluated[0].severity, "critical");
});

test("Notification Preferences - saves and reads user preferences", async () => {
    const testUserId = `user_pref_${Date.now()}`;

    await saveNotificationPreferences(testUserId, {
        quietHoursEnabled: false,
        minPriority: "medium",
        batchingEnabled: true,
    });

    const prefs = await getNotificationPreferences(testUserId);
    assert.equal(prefs.userId, testUserId);
    assert.equal(prefs.quietHoursEnabled, false);
    assert.equal(prefs.minPriority, "medium");
    assert.equal(prefs.batchingEnabled, true);
});

test("Notification History & Lifecycle - marks read and dismisses notifications", async () => {
    const testUserId = `user_hist_${Date.now()}`;
    const notifId = `notif_test_${Date.now()}`;

    await saveNotification({
        id: notifId,
        userId: testUserId,
        category: "tasks",
        type: "task_overdue",
        title: "Test Task Overdue",
        message: "Test message",
        priority: "high",
        severity: "high",
        actionLabel: "View Task",
        actionUrl: "/tasks",
        channel: "dashboard",
        status: "delivered",
        scheduledFor: Date.now(),
        createdAt: Date.now(),
    });

    let grouped = await getNotifications(testUserId);
    const target = grouped.today.find((n) => n.id === notifId) || grouped.earlier.find((n) => n.id === notifId);
    assert.ok(target);
    assert.equal(target.status, "delivered");

    // Mark Read
    const read = await markNotificationRead(notifId, testUserId);
    assert.equal(read.status, "read");
    assert.ok(read.readAt);

    // Dismiss
    const dismissed = await dismissNotification(notifId, testUserId);
    assert.equal(dismissed.status, "dismissed");
    assert.ok(dismissed.dismissedAt);

    // Check grouped feed excludes dismissed
    grouped = await getNotifications(testUserId);
    const dismissedInFeed = grouped.today.find((n) => n.id === notifId);
    assert.equal(dismissedInFeed, undefined);
});
