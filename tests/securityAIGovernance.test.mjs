import { test, describe } from "node:test";
import assert from "node:assert";
import { AIAgentManager } from "../lib/security/ai/aiAgentManager.ts";
import { GovernancePolicyEvaluator } from "../lib/security/ai/governancePolicy.ts";
import { DelegationEngine } from "../lib/security/ai/delegationEngine.ts";
import { AIAgentRepository } from "../lib/db/repositories/aiAgentRepository.ts";
import { AuditRepository } from "../lib/db/repositories/auditRepository.ts";

describe("Milestone 4: AI Executive Governance & Delegation Engine", () => {
    test("AIAgentManager registers agent and blocks self-escalation attempt", async () => {
        const manager = new AIAgentManager();
        const workspaceId = `ws_ai_${Date.now()}`;

        const agent = await manager.registerAgent({
            workspaceId,
            name: "AI COO Agent",
            role: "ai_coo",
            authorityLevel: "assisted",
            capabilities: ["project_management"],
            maxBudgetPerAction: 1000
        });

        assert.strictEqual(agent.name, "AI COO Agent");
        assert.strictEqual(agent.authority_level, "assisted");

        // Context validation
        const isValid = await manager.validateAgentContext(agent.id, workspaceId);
        assert.strictEqual(isValid, true);

        // Attempt self-escalation (Must fail)
        await assert.rejects(async () => {
            await manager.updateAgentAuthority(agent.id, agent.id, "operational");
        }, (err) => {
            assert.strictEqual(err.name, "ForbiddenError");
            assert.strictEqual(err.message.includes("forbidden"), true);
            return true;
        });
    });

    test("GovernancePolicyEvaluator enforces budget caps and blocks self-approval", async () => {
        const evaluator = new GovernancePolicyEvaluator();
        const mockAgent = {
            id: "agent_coo_1",
            workspace_id: "ws_1",
            name: "AI COO",
            role: "ai_coo",
            status: "active",
            authority_level: "assisted",
            max_budget_per_action: 1000,
            created_at: Date.now()
        };

        // 1. Routine action under threshold
        const res1 = evaluator.evaluateAction({
            agent: mockAgent,
            actionName: "projects:update",
            estimatedCost: 100
        });
        assert.strictEqual(res1.allowed, true);

        // 2. High-risk action without human approval
        const res2 = evaluator.evaluateAction({
            agent: mockAgent,
            actionName: "database:drop"
        });
        assert.strictEqual(res2.allowed, false);
        assert.strictEqual(res2.requiresHumanApproval, true);

        // 3. Self-approval attempt (Must fail)
        assert.throws(() => {
            evaluator.evaluateAction({
                agent: mockAgent,
                actionName: "database:drop",
                approverId: mockAgent.id // Self-approval
            });
        }, (err) => {
            assert.strictEqual(err.name, "ForbiddenError");
            return true;
        });

        // 4. Valid human approval for high-risk action
        const res4 = evaluator.evaluateAction({
            agent: mockAgent,
            actionName: "database:drop",
            approverId: "usr_founder_1" // Human Founder
        });
        assert.strictEqual(res4.allowed, true);
    });

    test("DelegationEngine handles delegation lifecycle, TTL, revocation, and blocks circular chains", async () => {
        const auditRepo = new AuditRepository();
        const delegationEngine = new DelegationEngine(auditRepo);

        const workspaceId = `ws_del_${Date.now()}`;
        const humanId = `usr_human_1`;
        const aiCooId = `agent_coo_1`;
        const aiCfoId = `agent_cfo_1`;

        // 1. Human-to-AI Delegation
        const del1 = await delegationEngine.createDelegation({
            workspaceId,
            delegatorId: humanId,
            delegateeId: aiCooId,
            scope: "projects:write",
            ttlSeconds: 60
        });

        assert.strictEqual(del1.delegatorId, humanId);
        assert.strictEqual(del1.delegateeId, aiCooId);

        const isValid = delegationEngine.validateDelegation(del1.id, "projects:write");
        assert.strictEqual(isValid, true);

        // 2. AI-to-AI Delegation (COO -> CFO)
        const del2 = await delegationEngine.createDelegation({
            workspaceId,
            delegatorId: aiCooId,
            delegateeId: aiCfoId,
            scope: "financial:report",
            parentDelegationId: del1.id
        });
        assert.strictEqual(del2.delegatorId, aiCooId);

        // 3. Attempt Circular Delegation (CFO -> COO)
        await assert.rejects(async () => {
            await delegationEngine.createDelegation({
                workspaceId,
                delegatorId: aiCfoId,
                delegateeId: aiCooId,
                scope: "projects:write"
            });
        }, (err) => {
            assert.strictEqual(err.name, "ForbiddenError");
            assert.strictEqual(err.message.includes("Circular delegation"), true);
            return true;
        });

        // 4. Revoke Delegation
        const revoked = await delegationEngine.revokeDelegation(del1.id, humanId);
        assert.strictEqual(revoked, true);

        const isValidAfterRevoke = delegationEngine.validateDelegation(del1.id, "projects:write");
        assert.strictEqual(isValidAfterRevoke, false);
    });
});
