/**
 * Live Connector Hub Test Suite (PAL-TDD-015, Phase 2)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LiveConnectorHub } from "../lib/connectors/liveConnectorHub.ts";

describe("Phase 2 — Live Connector Hub & Normalization Pipeline", () => {
    const hub = LiveConnectorHub.getInstance();

    it("1. Initializes Stripe, Google Workspace, Slack, and GitHub connectors with 99% health score", () => {
        const statuses = hub.getAllStatuses();

        assert.equal(statuses.length, 4);
        const stripe = hub.getConnectorStatus("Stripe");
        assert.ok(stripe);
        assert.equal(stripe.healthScorePct, 99);
        assert.equal(stripe.status, "CONNECTED");
    });

    it("2. Triggers sync and increments records processed count", () => {
        const initial = hub.getConnectorStatus("Stripe")?.recordsProcessedCount || 0;
        const updated = hub.triggerSync("Stripe");

        assert.equal(updated.recordsProcessedCount, initial + 50);
        assert.equal(updated.status, "CONNECTED");
    });
});
