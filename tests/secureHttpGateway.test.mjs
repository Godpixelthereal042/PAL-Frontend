/**
 * Sprint 8 — Milestone 2: SecureHttpGateway Unit Tests
 *
 * Verifies:
 *   1. Outbound requests to private IPv4/IPv6 networks and cloud metadata (169.254.169.254, 127.0.0.1, 10.0.0.1) are BLOCKED (SSRF Protection).
 *   2. Non-http/https protocols (file://, gopher://, ftp://) are BLOCKED.
 *   3. Approved SaaS domains (googleapis.com, stripe.com, hubspot.com) are ALLOWED.
 *   4. Unapproved external domains are BLOCKED by policy.
 *   5. Security audit logs record allowed and blocked request attempts per workspace.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SecureHttpGateway } from "../lib/security/secureHttpGateway.ts";

describe("Sprint 8 — Milestone 2: SecureHttpGateway Security Hardening", () => {
    const gateway = SecureHttpGateway.getInstance();

    it("1. Blocks SSRF attempts to private IPv4 addresses (127.0.0.1, 10.0.0.1, 192.168.1.1)", () => {
        const res1 = gateway.validateUrlSecurity("http://127.0.0.1/admin");
        assert.equal(res1.valid, false);
        assert.ok(res1.reason?.includes("SSRF Blocked"));

        const res2 = gateway.validateUrlSecurity("http://10.0.0.15/internal-api");
        assert.equal(res2.valid, false);

        const res3 = gateway.validateUrlSecurity("http://192.168.1.100/router");
        assert.equal(res3.valid, false);
    });

    it("2. Blocks SSRF attempts to Cloud Metadata IP (169.254.169.254) and Localhost", () => {
        const res1 = gateway.validateUrlSecurity("http://169.254.169.254/latest/meta-data/");
        assert.equal(res1.valid, false);
        assert.ok(res1.reason?.includes("SSRF Blocked"));

        const res2 = gateway.validateUrlSecurity("http://localhost:8080/debug");
        assert.equal(res2.valid, false);
    });

    it("3. Blocks non-HTTP/HTTPS protocols (file://, gopher://, ftp://)", () => {
        const res1 = gateway.validateUrlSecurity("file:///etc/passwd");
        assert.equal(res1.valid, false);
        assert.ok(res1.reason?.includes("Forbidden protocol"));

        const res2 = gateway.validateUrlSecurity("gopher://malicious.com");
        assert.equal(res2.valid, false);
    });

    it("4. Allows approved SaaS provider domains (Google, Stripe, HubSpot)", () => {
        const res1 = gateway.validateUrlSecurity("https://generativelanguage.googleapis.com/v1beta/models");
        assert.equal(res1.valid, true);

        const res2 = gateway.validateUrlSecurity("https://api.stripe.com/v1/charges");
        assert.equal(res2.valid, true);

        const res3 = gateway.validateUrlSecurity("https://api.hubapi.com/crm/v3/objects/contacts");
        assert.equal(res3.valid, true);
    });

    it("5. Blocks unapproved external domains by default security policy", () => {
        const res = gateway.validateUrlSecurity("https://untrusted-unapproved-domain.com/exfiltrate");
        assert.equal(res.valid, false);
        assert.ok(res.reason?.includes("Security Policy Violation"));
    });

    it("6. Records security audit logs per workspace for security monitoring", async () => {
        gateway.clearAuditLogs();

        await gateway.executeRequest({
            url: "http://169.254.169.254/latest/meta-data/",
            workspaceId: "ws_security_audit_test",
            actorId: "usr_attacker"
        }).catch(() => {});

        const logs = gateway.getAuditLogs("ws_security_audit_test");
        assert.ok(logs.length > 0);
        assert.equal(logs[0].allowed, false);
        assert.ok(logs[0].reason?.includes("SSRF Blocked"));
    });
});
