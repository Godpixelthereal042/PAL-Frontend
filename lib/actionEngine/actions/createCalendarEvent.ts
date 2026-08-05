import { ActionType } from "../types.ts";
import type { ActionHandler, CreateCalendarEventParams, ValidationResult } from "../types.ts";
import { globalIntegrationManager } from "../../integrations/integrationManager.ts";
import { globalAuthManager } from "../../integrations/authManager.ts";

export const createCalendarEventHandler: ActionHandler<CreateCalendarEventParams> = {
    type: ActionType.CREATE_CALENDAR_EVENT,

    validate(params: CreateCalendarEventParams): ValidationResult {
        const errors: string[] = [];

        if (!params || typeof params !== "object") {
            return { valid: false, errors: ["Missing or invalid payload parameters"] };
        }

        if (!params.title || typeof params.title !== "string" || !params.title.trim()) {
            errors.push("Calendar event title is required");
        }

        if (!params.startsAt || typeof params.startsAt !== "string") {
            errors.push("Event startsAt timestamp/date string is required");
        }

        if (!params.endsAt || typeof params.endsAt !== "string") {
            errors.push("Event endsAt timestamp/date string is required");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    async execute(params: CreateCalendarEventParams, userId: string, db: any) {
        const now = Date.now();
        const eventId = `event_${now}_${Math.random().toString(36).slice(2, 8)}`;
        const effectiveUserId = userId || "current_user";

        await db.run(
            `INSERT INTO calendar_events (id, user_id, title, starts_at, ends_at, status, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                eventId,
                effectiveUserId,
                params.title.trim(),
                params.startsAt,
                params.endsAt,
                params.status || "confirmed",
                now,
            ]
        );

        let externalSync: any = null;
        try {
            const authContext = await globalAuthManager.getAuthContext(effectiveUserId, "google_calendar");
            if (authContext.status === "connected") {
                const syncResponse = await globalIntegrationManager.executeConnector({
                    provider: "google_calendar",
                    operation: "CREATE_EVENT",
                    params: {
                        title: params.title.trim(),
                        startsAt: params.startsAt,
                        endsAt: params.endsAt,
                        timeZone: (params as any).timeZone || "UTC",
                    },
                    userId: effectiveUserId,
                });
                if (syncResponse.success) {
                    externalSync = syncResponse.data;
                }
            }
        } catch (e) {
            console.warn("createCalendarEvent: Google Calendar sync skipped:", e);
        }

        const eventRecord = await db.get("SELECT * FROM calendar_events WHERE id = ?", [eventId]);

        return {
            event: eventRecord,
            externalSync,
            message: `Calendar event "${params.title}" created successfully for ${params.startsAt}.`,
        };
    },
};
