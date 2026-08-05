/**
 * Notification Preferences Manager
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import { getDB } from "../db.ts";
import type { NotificationPreferences, NotificationCategory, DeliveryChannel, NotificationPriority } from "./types.ts";

export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, "userId" | "updatedAt"> = {
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    minPriority: "low",
    batchingEnabled: true,
    enabledCategories: ["executive", "calendar", "tasks", "financial", "decisions", "integrations", "opportunities"],
    enabledChannels: ["dashboard", "email", "push", "slack", "voice"],
};

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const row = await db.get(
        `SELECT * FROM notification_preferences WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL) LIMIT 1`,
        [effectiveUserId]
    );

    if (!row) {
        return {
            userId: effectiveUserId,
            ...DEFAULT_PREFERENCES,
            updatedAt: Date.now(),
        };
    }

    let categories: NotificationCategory[] = DEFAULT_PREFERENCES.enabledCategories;
    let channels: DeliveryChannel[] = DEFAULT_PREFERENCES.enabledChannels;

    if (row.enabled_categories) {
        try {
            categories = JSON.parse(row.enabled_categories);
        } catch {}
    }

    if (row.enabled_channels) {
        try {
            channels = JSON.parse(row.enabled_channels);
        } catch {}
    }

    return {
        userId: effectiveUserId,
        quietHoursEnabled: row.quiet_hours_enabled === 1,
        quietHoursStart: row.quiet_hours_start || "22:00",
        quietHoursEnd: row.quiet_hours_end || "07:00",
        minPriority: (row.min_priority as NotificationPriority) || "low",
        batchingEnabled: row.batching_enabled === 1,
        enabledCategories: categories,
        enabledChannels: channels,
        updatedAt: Number(row.updated_at || Date.now()),
    };
}

export async function saveNotificationPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";
    const current = await getNotificationPreferences(effectiveUserId);
    const now = Date.now();

    const merged: NotificationPreferences = {
        ...current,
        ...updates,
        userId: effectiveUserId,
        updatedAt: now,
    };

    const existing = await db.get(
        `SELECT user_id FROM notification_preferences WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [effectiveUserId]
    );

    if (existing) {
        await db.run(
            `UPDATE notification_preferences
             SET quiet_hours_enabled = ?, quiet_hours_start = ?, quiet_hours_end = ?, min_priority = ?, batching_enabled = ?, enabled_categories = ?, enabled_channels = ?, updated_at = ?
             WHERE user_id = ?`,
            [
                merged.quietHoursEnabled ? 1 : 0,
                merged.quietHoursStart,
                merged.quietHoursEnd,
                merged.minPriority,
                merged.batchingEnabled ? 1 : 0,
                JSON.stringify(merged.enabledCategories),
                JSON.stringify(merged.enabledChannels),
                now,
                effectiveUserId,
            ]
        );
    } else {
        await db.run(
            `INSERT INTO notification_preferences (user_id, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, min_priority, batching_enabled, enabled_categories, enabled_channels, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                effectiveUserId,
                merged.quietHoursEnabled ? 1 : 0,
                merged.quietHoursStart,
                merged.quietHoursEnd,
                merged.minPriority,
                merged.batchingEnabled ? 1 : 0,
                JSON.stringify(merged.enabledCategories),
                JSON.stringify(merged.enabledChannels),
                now,
            ]
        );
    }

    return merged;
}
