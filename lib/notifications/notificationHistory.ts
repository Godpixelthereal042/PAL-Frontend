/**
 * Notification History Persistence & Query Service
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import { getDB } from "../db.ts";
import type { Notification, GroupedNotifications, NotificationStatus, NotificationCategory, DeliveryChannel, NotificationPriority, NotificationSeverity } from "./types.ts";

export async function saveNotification(n: Notification): Promise<Notification> {
    const db = await getDB();
    const effectiveUserId = n.userId || "current_user";

    const existing = await db.get(`SELECT id FROM notification_history WHERE id = ?`, [n.id]);

    if (existing) {
        await db.run(
            `UPDATE notification_history
             SET status = ?, read_at = ?, dismissed_at = ?
             WHERE id = ?`,
            [n.status, n.readAt || null, n.dismissedAt || null, n.id]
        );
    } else {
        await db.run(
            `INSERT INTO notification_history (id, user_id, category, type, title, message, priority, severity, action_label, action_url, channel, status, scheduled_for, expires_at, created_at, read_at, dismissed_at, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                n.id,
                effectiveUserId,
                n.category,
                n.type,
                n.title,
                n.message,
                n.priority,
                n.severity,
                n.actionLabel || null,
                n.actionUrl || null,
                n.channel,
                n.status,
                n.scheduledFor,
                n.expiresAt || null,
                n.createdAt,
                n.readAt || null,
                n.dismissedAt || null,
                n.metadata ? JSON.stringify(n.metadata) : null,
            ]
        );
    }

    return n;
}

export async function getNotificationById(id: string, userId: string): Promise<Notification | null> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const row = await db.get(
        `SELECT * FROM notification_history WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [id, effectiveUserId]
    );

    if (!row) return null;

    return mapRowToNotification(row);
}

export async function markNotificationRead(id: string, userId: string): Promise<Notification | null> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";
    const now = Date.now();

    await db.run(
        `UPDATE notification_history
         SET status = 'read', read_at = ?
         WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [now, id, effectiveUserId]
    );

    return getNotificationById(id, effectiveUserId);
}

export async function dismissNotification(id: string, userId: string): Promise<Notification | null> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";
    const now = Date.now();

    await db.run(
        `UPDATE notification_history
         SET status = 'dismissed', dismissed_at = ?
         WHERE id = ? AND (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)`,
        [now, id, effectiveUserId]
    );

    return getNotificationById(id, effectiveUserId);
}

export async function getRecentDeliveredNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const rows = (await db.all(
        `SELECT * FROM notification_history
         WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL)
         ORDER BY created_at DESC LIMIT ?`,
        [effectiveUserId, limit]
    )) || [];

    return rows.map(mapRowToNotification);
}

export async function getNotifications(userId: string): Promise<GroupedNotifications> {
    const db = await getDB();
    const effectiveUserId = userId || "current_user";

    const rows = (await db.all(
        `SELECT * FROM notification_history
         WHERE (user_id = ? OR user_id = 'current_user' OR user_id IS NULL) AND status != 'dismissed'
         ORDER BY scheduled_for DESC`,
        [effectiveUserId]
    )) || [];

    const notifications = rows.map(mapRowToNotification);

    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    const today: Notification[] = [];
    const upcoming: Notification[] = [];
    const earlier: Notification[] = [];

    let unreadCount = 0;

    for (const n of notifications) {
        if (!n.readAt && n.status !== "dismissed") {
            unreadCount++;
        }

        if (n.scheduledFor > now + 60000) {
            upcoming.push(n);
        } else if (n.createdAt >= startOfToday) {
            today.push(n);
        } else {
            earlier.push(n);
        }
    }

    return {
        today,
        upcoming,
        earlier,
        unreadCount,
    };
}

function mapRowToNotification(row: any): Notification {
    let meta: any = undefined;
    if (row.metadata) {
        try {
            meta = JSON.parse(row.metadata);
        } catch {}
    }

    return {
        id: row.id,
        userId: row.user_id,
        category: row.category as NotificationCategory,
        type: row.type,
        title: row.title,
        message: row.message,
        priority: row.priority as NotificationPriority,
        severity: row.severity as NotificationSeverity,
        actionLabel: row.action_label || null,
        actionUrl: row.action_url || null,
        channel: row.channel as DeliveryChannel,
        status: row.status as NotificationStatus,
        scheduledFor: Number(row.scheduled_for || Date.now()),
        expiresAt: row.expires_at ? Number(row.expires_at) : null,
        createdAt: Number(row.created_at || Date.now()),
        readAt: row.read_at ? Number(row.read_at) : null,
        dismissedAt: row.dismissed_at ? Number(row.dismissed_at) : null,
        metadata: meta,
    };
}
