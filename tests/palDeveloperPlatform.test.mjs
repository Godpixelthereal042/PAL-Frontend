/**
 * PAL Developer Platform Test Suite (PAL-TDD-015, Sprint 28 Milestone 5)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PalDeveloperPlatform } from "../lib/platform/palDeveloperPlatform.ts";

describe("Sprint 28 Milestone 5 — PAL Intelligence API Platform", () => {
    const devPlatform = PalDeveloperPlatform.getInstance();

    it("1. Provisions developer API key with pal_live_ mask, 600 RPM rate limit, and active status", () => {
        const keyRecord = devPlatform.provisionApiKey("ws_dev_platform_101", ["read:intelligence", "write:agents"]);

        assert.ok(keyRecord.keyId.startsWith("key_"));
        assert.ok(keyRecord.apiKeyMasked.startsWith("pal_live_..."));
        assert.equal(keyRecord.rateLimitRpm, 600);
        assert.equal(keyRecord.isActive, true);
        assert.equal(keyRecord.permissions.length, 2);
    });

    it("2. Records API requests and increments total requests count counter", () => {
        const keyRecord = devPlatform.provisionApiKey("ws_dev_platform_101", ["read:intelligence"]);
        const updated = devPlatform.recordApiRequest(keyRecord.keyId);

        assert.equal(updated.totalRequestsCount, 1);
    });
});
