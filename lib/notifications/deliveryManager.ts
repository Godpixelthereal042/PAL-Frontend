/**
 * Delivery Manager Channel Abstraction Subsystem
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import { saveNotification } from "./notificationHistory.ts";
import type { Notification, DeliveryResult, DeliveryChannel } from "./types.ts";

export class DeliveryManager {
    /**
     * Dispatch notification to configured delivery channel.
     * Dashboard delivery is fully persisted. Other channels expose placeholder handlers.
     */
    async deliverNotification(notification: Notification): Promise<DeliveryResult> {
        const now = Date.now();
        const updatedNotification: Notification = {
            ...notification,
            status: "delivered",
        };

        switch (notification.channel) {
            case "dashboard":
                await saveNotification(updatedNotification);
                return {
                    success: true,
                    channel: "dashboard",
                    deliveredAt: now,
                };

            case "email":
            case "push":
            case "slack":
            case "voice":
                // Placeholder channel handlers for multi-channel expansion
                await saveNotification(updatedNotification);
                return {
                    success: true,
                    channel: notification.channel,
                    deliveredAt: now,
                };

            default:
                await saveNotification(updatedNotification);
                return {
                    success: true,
                    channel: "dashboard",
                    deliveredAt: now,
                };
        }
    }
}

export const globalDeliveryManager = new DeliveryManager();
