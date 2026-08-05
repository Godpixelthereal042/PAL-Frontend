import test from "node:test";
import assert from "node:assert/strict";

import { globalConnectorRegistry } from "../lib/integrations/registry.ts";
import { globalAuthManager } from "../lib/integrations/authManager.ts";
import { globalIntegrationManager } from "../lib/integrations/integrationManager.ts";
import { globalAuditLogger } from "../lib/integrations/auditLogger.ts";
import {
    GoogleCalendarConnector,
    googleCalendarConnectorInstance,
    mapPALToGoogleEvent,
    mapGoogleToPALEvent,
    normalizeTimeZone,
} from "../lib/integrations/connectors/googleCalendarConnector.ts";
import { actionEngine } from "../lib/actionEngine/engine.ts";
import { ActionType } from "../lib/actionEngine/types.ts";

test("GoogleCalendarConnector - verifies metadata and registration", () => {
    const connector = globalConnectorRegistry.getConnector("google_calendar");
    assert.ok(connector);
    assert.equal(connector.metadata.id, "google_calendar_connector");
    assert.equal(connector.metadata.provider, "google_calendar");
    assert.deepEqual(connector.metadata.supportedOperations, [
        "CREATE_EVENT",
        "GET_UPCOMING_EVENTS",
        "UPDATE_EVENT",
        "DELETE_EVENT",
    ]);
});

test("GoogleCalendarConnector - mapPALToGoogleEvent & normalizeTimeZone", () => {
    assert.equal(normalizeTimeZone("America/New_York"), "America/New_York");
    assert.equal(normalizeTimeZone(""), Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

    const mapped = mapPALToGoogleEvent({
        title: "Product Sprint Planning",
        description: "Plan Sprint 4B tasks",
        startsAt: "2026-08-01T10:00:00.000Z",
        endsAt: "2026-08-01T11:00:00.000Z",
        timeZone: "America/Los_Angeles",
    });

    assert.equal(mapped.summary, "Product Sprint Planning");
    assert.equal(mapped.description, "Plan Sprint 4B tasks");
    assert.equal(mapped.start.timeZone, "America/Los_Angeles");
    assert.equal(mapped.end.timeZone, "America/Los_Angeles");
});

test("GoogleCalendarConnector - mapGoogleToPALEvent", () => {
    const palEvent = mapGoogleToPALEvent({
        id: "gcal_evt_123",
        summary: "Founder Sync",
        description: "Discuss ARR targets",
        location: "Meet Link",
        start: { dateTime: "2026-08-01T14:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-08-01T15:00:00Z", timeZone: "UTC" },
        htmlLink: "https://calendar.google.com/event?id=123",
        status: "confirmed",
    });

    assert.equal(palEvent.eventId, "gcal_evt_123");
    assert.equal(palEvent.title, "Founder Sync");
    assert.equal(palEvent.startsAt, "2026-08-01T14:00:00Z");
    assert.equal(palEvent.htmlLink, "https://calendar.google.com/event?id=123");
});

test("GoogleCalendarConnector - token refresh logic on near-expired token", async () => {
    const testUserId = `user_gcal_refresh_${Date.now()}`;
    const nearExpiry = Date.now() + 10000; // 10s left

    await globalAuthManager.saveAuthContext({
        provider: "google_calendar",
        userId: testUserId,
        accessToken: "gcal_old_token",
        refreshToken: "gcal_refresh_token_123",
        tokenExpiresAt: nearExpiry,
        grantedScopes: ["https://www.googleapis.com/auth/calendar.events"],
        status: "connected",
    });

    const authBefore = await globalAuthManager.getAuthContext(testUserId, "google_calendar");
    const updatedAuth = await googleCalendarConnectorInstance.ensureFreshAccessToken(authBefore);

    assert.ok(updatedAuth.accessToken.startsWith("gcal_access_refreshed_"));
    assert.ok(updatedAuth.tokenExpiresAt > Date.now() + 3000000);
});

test("GoogleCalendarConnector - CREATE_EVENT operation execution", async () => {
    const testUserId = `user_gcal_create_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "google_calendar",
        userId: testUserId,
        accessToken: "gcal_valid_access_token",
        tokenExpiresAt: Date.now() + 3600000,
        grantedScopes: ["https://www.googleapis.com/auth/calendar.events"],
        status: "connected",
    });

    const response = await globalIntegrationManager.executeConnector({
        provider: "google_calendar",
        operation: "CREATE_EVENT",
        params: {
            title: "Board Meeting",
            description: "Q3 Strategy Presentation",
            startsAt: "2026-08-15T09:00:00Z",
            endsAt: "2026-08-15T10:00:00Z",
        },
        userId: testUserId,
    });

    assert.equal(response.success, true);
    assert.equal(response.provider, "google_calendar");
    assert.equal(response.connectorId, "google_calendar_connector");
    assert.ok(response.data.eventId);
    assert.equal(response.data.title, "Board Meeting");
});

test("GoogleCalendarConnector - GET_UPCOMING_EVENTS operation execution", async () => {
    const testUserId = `user_gcal_get_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "google_calendar",
        userId: testUserId,
        accessToken: "gcal_valid_token",
        tokenExpiresAt: Date.now() + 3600000,
        grantedScopes: ["https://www.googleapis.com/auth/calendar.readonly"],
        status: "connected",
    });

    const response = await globalIntegrationManager.executeConnector({
        provider: "google_calendar",
        operation: "GET_UPCOMING_EVENTS",
        params: { maxResults: 5 },
        userId: testUserId,
    });

    assert.equal(response.success, true);
    assert.ok(Array.isArray(response.data.events));
    assert.ok(response.data.count >= 1);
});

test("GoogleCalendarConnector - UPDATE_EVENT & DELETE_EVENT operations", async () => {
    const testUserId = `user_gcal_upd_del_${Date.now()}`;

    await globalAuthManager.saveAuthContext({
        provider: "google_calendar",
        userId: testUserId,
        accessToken: "gcal_valid_token",
        tokenExpiresAt: Date.now() + 3600000,
        grantedScopes: ["https://www.googleapis.com/auth/calendar.events"],
        status: "connected",
    });

    const updResponse = await globalIntegrationManager.executeConnector({
        provider: "google_calendar",
        operation: "UPDATE_EVENT",
        params: {
            eventId: "gcal_evt_100",
            title: "Rescheduled Roadmap Review",
            startsAt: "2026-08-20T11:00:00Z",
        },
        userId: testUserId,
    });

    assert.equal(updResponse.success, true);
    assert.equal(updResponse.data.title, "Rescheduled Roadmap Review");

    const delResponse = await globalIntegrationManager.executeConnector({
        provider: "google_calendar",
        operation: "DELETE_EVENT",
        params: { eventId: "gcal_evt_100" },
        userId: testUserId,
    });

    assert.equal(delResponse.success, true);
    assert.equal(delResponse.data.deleted, true);
});

test("Action Engine & Google Calendar Connector Integration", async () => {
    const testUserId = `user_action_gcal_${Date.now()}`;

    // Enable connected Google Calendar integration for user
    await globalAuthManager.saveAuthContext({
        provider: "google_calendar",
        userId: testUserId,
        accessToken: "gcal_valid_token",
        tokenExpiresAt: Date.now() + 3600000,
        grantedScopes: ["https://www.googleapis.com/auth/calendar.events"],
        status: "connected",
    });

    const result = await actionEngine.execute({
        type: ActionType.CREATE_CALENDAR_EVENT,
        userId: testUserId,
        params: {
            title: "Sync with Investor",
            startsAt: "2026-09-01T15:00:00Z",
            endsAt: "2026-09-01T16:00:00Z",
        },
    });

    assert.equal(result.success, true);
    assert.ok(result.data.event);
    assert.ok(result.data.externalSync);
    assert.equal(result.data.externalSync.title, "Sync with Investor");

    const logs = await globalAuditLogger.getAuditLogs(testUserId, { provider: "google_calendar" });
    assert.ok(logs.length >= 1);
    assert.equal(logs[0].operation, "CREATE_EVENT");
    assert.equal(logs[0].status, "success");
});
