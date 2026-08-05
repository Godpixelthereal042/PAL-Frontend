/**
 * Notification Intelligence Engine Types & Interfaces
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

export type NotificationCategory =
    | "executive"
    | "calendar"
    | "tasks"
    | "financial"
    | "decisions"
    | "integrations"
    | "opportunities";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";
export type NotificationSeverity = "low" | "medium" | "high" | "critical";
export type DeliveryChannel = "dashboard" | "email" | "push" | "slack" | "voice";
export type NotificationStatus = "created" | "scheduled" | "delivered" | "read" | "dismissed" | "expired";
export type ScheduleMode = "immediate" | "scheduled" | "delayed" | "recurring" | "digest";

export interface Notification {
    id: string;
    userId: string;
    category: NotificationCategory;
    type: string;
    title: string;
    message: string;
    priority: NotificationPriority;
    severity: NotificationSeverity;
    actionLabel?: string | null;
    actionUrl?: string | null;
    channel: DeliveryChannel;
    status: NotificationStatus;
    scheduledFor: number;
    expiresAt?: number | null;
    createdAt: number;
    readAt?: number | null;
    dismissedAt?: number | null;
    metadata?: Record<string, any>;
}

export interface CandidateNotification {
    id?: string;
    category: NotificationCategory;
    type: string;
    title: string;
    message: string;
    priority: NotificationPriority;
    severity: NotificationSeverity;
    actionLabel?: string;
    actionUrl?: string;
    expiresAt?: number;
    metadata?: Record<string, any>;
}

export interface NotificationPreferences {
    userId: string;
    quietHoursEnabled: boolean;
    quietHoursStart: string; // "22:00"
    quietHoursEnd: string;   // "07:00"
    minPriority: NotificationPriority;
    batchingEnabled: boolean;
    enabledCategories: NotificationCategory[];
    enabledChannels: DeliveryChannel[];
    updatedAt: number;
}

export interface DeliveryResult {
    success: boolean;
    channel: DeliveryChannel;
    deliveredAt?: number;
    error?: string;
}

export interface GroupedNotifications {
    today: Notification[];
    upcoming: Notification[];
    earlier: Notification[];
    unreadCount: number;
}
