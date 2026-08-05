/**
 * Central Notification Intelligence Engine Orchestrator
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 *
 * PAL's proactive communication layer. Evaluates business context, urgency, founder preferences,
 * quiet hours, and impact to produce context-aware notifications delivered to the founder.
 */

import { buildBusinessContext } from "../contextEngine.ts";
import { getNotificationPreferences } from "./notificationPreferences.ts";
import {
    saveNotification,
    getRecentDeliveredNotifications,
    getNotifications as getHistoryNotifications,
    markNotificationRead as historyMarkRead,
    dismissNotification as historyDismiss,
} from "./notificationHistory.ts";
import { generatePriorityCandidates } from "./priorityNotificationEngine.ts";
import { generateRiskCandidates } from "./riskNotificationEngine.ts";
import { generateReminderCandidates } from "./reminderNotificationEngine.ts";
import { generateOpportunityCandidates } from "./opportunityNotificationEngine.ts";
import { evaluateNotificationPolicies } from "./notificationPolicyEngine.ts";
import { determineNotificationSchedule } from "./notificationScheduler.ts";
import { composeNotification } from "./notificationComposer.ts";
import { DeliveryManager, globalDeliveryManager } from "./deliveryManager.ts";
import type { Notification, CandidateNotification, GroupedNotifications } from "./types.ts";

export class NotificationIntelligenceEngine {
    private deliveryManager: DeliveryManager;

    constructor(deliveryManager: DeliveryManager = globalDeliveryManager) {
        this.deliveryManager = deliveryManager;
    }

    /**
     * Executes the proactive notification pipeline:
     * Load Context -> Generate Candidates -> Evaluate Policies -> Schedule -> Compose -> Deliver -> Persist
     */
    async processNotifications(userId: string): Promise<Notification[]> {
        const effectiveUserId = userId || "current_user";

        // 1. Load Business Context & Preferences & History
        const context = await buildBusinessContext(effectiveUserId);
        const preferences = await getNotificationPreferences(effectiveUserId);
        const recentHistory = await getRecentDeliveredNotifications(effectiveUserId, 100);

        // 2. Generate Candidates Across All Categories
        const candidates: CandidateNotification[] = [
            ...generatePriorityCandidates(context),
            ...generateRiskCandidates(context),
            ...generateReminderCandidates(context),
            ...generateOpportunityCandidates(context),
        ];

        // 3. Apply Notification Policies (Deduplication, Batching, Quiet Hours, Preference Thresholds)
        const approvedCandidates = evaluateNotificationPolicies(candidates, preferences, recentHistory);

        // 4. Schedule, Compose, & Deliver Approved Notifications
        const delivered: Notification[] = [];
        for (const candidate of approvedCandidates) {
            const schedule = determineNotificationSchedule(candidate);
            const notification = composeNotification(candidate, schedule, effectiveUserId, "dashboard");

            await this.deliveryManager.deliverNotification(notification);
            delivered.push(notification);
        }

        return delivered;
    }
}

export const globalNotificationEngine = new NotificationIntelligenceEngine();

/**
 * Public Dashboard Integration Entry Points
 */

export async function processNotifications(userId: string): Promise<Notification[]> {
    return globalNotificationEngine.processNotifications(userId);
}

export async function getNotifications(userId: string): Promise<GroupedNotifications> {
    // Process new notification candidates before returning dashboard feed
    await globalNotificationEngine.processNotifications(userId);
    return getHistoryNotifications(userId);
}

export async function markNotificationRead(id: string, userId: string): Promise<Notification | null> {
    return historyMarkRead(id, userId);
}

export async function dismissNotification(id: string, userId: string): Promise<Notification | null> {
    return historyDismiss(id, userId);
}
