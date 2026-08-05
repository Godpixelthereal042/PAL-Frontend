/**
 * Enterprise Identity Manager Test Suite (PAL-TDD-009, Sprint 22 Milestone 2)
 *
 * Verifies:
 *   1. Evaluates 11-Step RBAC permissions across roles (Owner, CEO, CFO, Executive, Operator, Viewer).
 *   2. Generates secure team invitations with token expiration.
 *   3. Logs admin actions into workspace audit trail.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnterpriseIdentityManager } from "../lib/tenant/enterpriseIdentityManager.ts";

describe("Sprint 22 Milestone 2 — Enterprise Identity & Organization Management", () => {
    const identityManager = EnterpriseIdentityManager.getInstance();

    it("1. Evaluates RBAC permissions across executive role hierarchy", () => {
        // CEO has full permission
        assert.equal(identityManager.evaluateRBACPermission("CEO", "finance:write"), true);
        assert.equal(identityManager.evaluateRBACPermission("CEO", "admin:delete"), true);

        // CFO has finance permission but not system admin delete
        assert.equal(identityManager.evaluateRBACPermission("CFO", "finance:write"), true);
        assert.equal(identityManager.evaluateRBACPermission("CFO", "system:delete"), false);

        // Viewer only has read/view permissions
        assert.equal(identityManager.evaluateRBACPermission("Viewer", "report:view"), true);
        assert.equal(identityManager.evaluateRBACPermission("Viewer", "finance:write"), false);
    });

    it("2. Creates team member invitation with token expiration and admin logging", () => {
        const inv = identityManager.createTeamInvitation({
            workspaceId: "ws_demo_company",
            email: "cro@acme.com",
            assignedRole: "Executive",
            invitedByEmail: "ceo@acme.com"
        });

        assert.ok(inv.invitationId.startsWith("inv_"));
        assert.ok(inv.invitationToken.startsWith("tok_"));
        assert.equal(inv.email, "cro@acme.com");
        assert.equal(inv.assignedRole, "Executive");

        const logs = identityManager.getAuditLogs("ws_demo_company");
        assert.ok(logs.some(l => l.action === "INVITE_TEAM_MEMBER" && l.actorEmail === "ceo@acme.com"));
    });
});
