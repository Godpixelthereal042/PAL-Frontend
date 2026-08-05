import { test, describe } from "node:test";
import assert from "node:assert";
import { IdentityFeatureFlags, featureFlags } from "../lib/security/flags/featureFlags.ts";
import { RBACManager, DEFAULT_HUMAN_ROLES, DEFAULT_AI_ROLES } from "../lib/security/authorization/rbacManager.ts";
import { ABACEngine } from "../lib/security/authorization/abacEngine.ts";
import { PermissionEngine } from "../lib/security/authorization/permissionEngine.ts";
import { RoleRepository } from "../lib/db/repositories/roleRepository.ts";
import { PermissionRepository } from "../lib/db/repositories/permissionRepository.ts";

describe("Milestone 3: Authorization & Policy Engine (RBAC + ABAC)", () => {
    test("IdentityFeatureFlags manages dynamic feature flag toggles", () => {
        const flags = IdentityFeatureFlags.getInstance();
        assert.strictEqual(flags.isEnabled("abac_strict_mode"), true);

        flags.setFlag("mfa_enabled", true);
        assert.strictEqual(flags.isEnabled("mfa_enabled"), true);

        flags.setFlag("mfa_enabled", false);
        assert.strictEqual(flags.isEnabled("mfa_enabled"), false);
    });

    test("RBACManager role hierarchy and wildcard permission matching", async () => {
        const rbac = new RBACManager();

        // Exact match
        assert.strictEqual(rbac.matchPermission(["projects:write", "brain:read"], "projects:write"), true);

        // Wildcard match
        assert.strictEqual(rbac.matchPermission(["projects:*"], "projects:read"), true);
        assert.strictEqual(rbac.matchPermission(["projects.*"], "projects.delete"), true);
        assert.strictEqual(rbac.matchPermission(["*"], "any:permission"), true);

        // Mismatch
        assert.strictEqual(rbac.matchPermission(["projects:read"], "projects:write"), false);

        // Role verification
        assert.strictEqual(rbac.hasRole([DEFAULT_HUMAN_ROLES.FOUNDER], "Employee"), true);
        assert.strictEqual(rbac.hasRole([DEFAULT_HUMAN_ROLES.EXECUTIVE], DEFAULT_HUMAN_ROLES.EXECUTIVE), true);
        assert.strictEqual(rbac.hasRole([DEFAULT_HUMAN_ROLES.EMPLOYEE], DEFAULT_HUMAN_ROLES.EXECUTIVE), false);
    });

    test("ABACEngine evaluates tenant isolation, classification, and risk limits", () => {
        const abac = new ABACEngine();

        // 1. Valid context
        const validRes = abac.evaluate({
            actorId: "usr_1",
            workspaceId: "ws_1",
            resourceWorkspaceId: "ws_1",
            riskScore: 20
        });
        assert.strictEqual(validRes.passed, true);

        // 2. Cross-tenant violation
        const crossTenantRes = abac.evaluate({
            actorId: "usr_1",
            workspaceId: "ws_1",
            resourceWorkspaceId: "ws_2"
        });
        assert.strictEqual(crossTenantRes.passed, false);
        assert.strictEqual(crossTenantRes.reason.includes("Cross-workspace"), true);

        // 3. Restricted classification non-owner block
        const restrictedRes = abac.evaluate({
            actorId: "usr_1",
            workspaceId: "ws_1",
            resourceWorkspaceId: "ws_1",
            resourceClassification: "restricted",
            resourceOwnerId: "usr_2"
        });
        assert.strictEqual(restrictedRes.passed, false);

        // 4. High risk score block
        const highRiskRes = abac.evaluate({
            actorId: "usr_1",
            workspaceId: "ws_1",
            resourceWorkspaceId: "ws_1",
            riskScore: 95
        });
        assert.strictEqual(highRiskRes.passed, false);
        assert.strictEqual(highRiskRes.reason.includes("risk score"), true);
    });

    test("PermissionEngine executes 11-step permission resolution & decision caching", async () => {
        const roleRepo = new RoleRepository();
        const permRepo = new PermissionRepository();
        const rbac = new RBACManager(roleRepo, permRepo);
        const engine = new PermissionEngine(rbac);

        const uniqueId = Date.now() + "_" + Math.random().toString(36).slice(2, 6);
        const userId = `usr_${uniqueId}`;
        const workspaceId = `ws_${uniqueId}`;

        // Create Founder role
        const role = await roleRepo.createRole({
            id: `role_${uniqueId}`,
            workspace_id: workspaceId,
            name: DEFAULT_HUMAN_ROLES.FOUNDER,
            system_role: 1,
            created_at: Date.now()
        });
        await roleRepo.assignRoleToUser({
            user_id: userId,
            role_id: role.id,
            assigned_by: "system",
            assigned_at: Date.now()
        });

        // Evaluate permission check for Founder (Cache miss)
        const trace1 = await engine.evaluate({
            userId,
            workspaceId,
            requiredPermission: "projects:delete"
        });

        assert.strictEqual(trace1.decision, "allow");
        assert.strictEqual(trace1.cacheHit, false);
        assert.strictEqual(trace1.stepsCompleted.length > 5, true);

        // Evaluate permission check for Founder (Cache hit)
        const trace2 = await engine.evaluate({
            userId,
            workspaceId,
            requiredPermission: "projects:delete"
        });

        assert.strictEqual(trace2.decision, "allow");
        assert.strictEqual(trace2.cacheHit, true);
        assert.strictEqual(trace2.executionTimeMs < 50, true);
    });
});
