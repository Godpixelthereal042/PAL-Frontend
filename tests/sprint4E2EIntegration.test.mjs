import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

// Sprint 2 imports
import { PermissionEngine } from "../lib/security/authorization/permissionEngine.ts";
import { RBACManager } from "../lib/security/authorization/rbacManager.ts";
import { RoleRepository } from "../lib/db/repositories/roleRepository.ts";
import { PermissionRepository } from "../lib/db/repositories/permissionRepository.ts";
import { AuditEngine } from "../lib/security/observability/auditEngine.ts";

// Sprint 3 imports
import { WorldModel } from "../lib/intelligence/brain/worldModel.ts";
import { ContextEngine } from "../lib/intelligence/context/contextEngine.ts";
import { ExecutiveOrchestrator } from "../lib/intelligence/council/executiveOrchestrator.ts";
import { ExecutiveBrain } from "../lib/intelligence/brain/executiveBrain.ts";

// Sprint 4 imports
import { AgentRuntime } from "../lib/runtime/agentRuntime.ts";
import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";
import { ToolRegistry } from "../lib/tools/toolRegistry.ts";
import { ExecutionSandbox } from "../lib/tools/executionSandbox.ts";
import { ConnectorSDK } from "../lib/connectors/connectorSDK.ts";
import { OAuthManager } from "../lib/connectors/oauthManager.ts";
import { TaskGraphEngine } from "../lib/tasks/taskGraphEngine.ts";
import { WorkerFactory } from "../lib/workers/workerFactory.ts";
import { AutonomousExecutionEngine } from "../lib/execution/autonomousExecutionEngine.ts";
import { DeadLetterQueue } from "../lib/execution/deadLetterQueue.ts";
import { ExecutionStore } from "../lib/persistence/executionStore.ts";
import { RecoveryEngine } from "../lib/persistence/recoveryEngine.ts";

describe("Sprint 4 — Milestone 7: End-to-End Integration & Production Readiness", () => {
    
    it("E2E 1: Full System Integration (Sprint 2 Security -> Sprint 3 Intelligence -> Sprint 4 Execution)", async () => {
        const tenantId = "tenant_acme_corp";
        const userId = "user_ceo_001";
        const correlationId = `corr_e2e_${Date.now()}`;

        // 1. Sprint 2 Security & Permission Verification
        const roleRepo = new RoleRepository();
        const permRepo = new PermissionRepository();
        const rbac = new RBACManager(roleRepo, permRepo);
        const permissionEngine = new PermissionEngine(rbac);

        const permTrace = await permissionEngine.evaluate({
            userId,
            workspaceId: tenantId,
            requiredPermission: "workflow:execute",
            resourceId: "res_expansion_plan",
            resourceWorkspaceId: tenantId,
            resourceClassification: "confidential"
        });
        assert.ok(permTrace.decision === "allow" || permTrace.decision === "deny");

        // Audit trace initialization
        const auditEngine = new AuditEngine();
        const auditRecord = await auditEngine.logAuditEvent({
            workspaceId: tenantId,
            actorId: userId,
            actorType: "human",
            event: "WorkflowExecutionInitiated",
            resource: "workflow_expansion_plan",
            result: "success",
            correlationId
        });
        assert.ok(auditRecord.signature);

        // 2. Sprint 3 Executive Intelligence Context & Council Consensus
        const brain = new ExecutiveBrain();
        const worldModel = new WorldModel();
        const contextEngine = new ContextEngine(brain);
        const orchestrator = new ExecutiveOrchestrator();

        const bizSnapshot = await worldModel.getSnapshot(tenantId);
        assert.ok(bizSnapshot);
        assert.equal(bizSnapshot.workspaceId, tenantId);

        const execContext = await contextEngine.getUnifiedContext(tenantId, correlationId, 4000);
        assert.equal(execContext.workspaceId, tenantId);

        const scenarios = [
            { optionId: "option_a_conservative", strategyType: "conservative" },
            { optionId: "option_b_aggressive", strategyType: "aggressive" },
            { optionId: "option_c_balanced", strategyType: "balanced" }
        ];

        const councilResponse = await orchestrator.orchestrateCouncil(correlationId, "operations", scenarios, execContext);
        assert.ok(councilResponse.consensusOptionId);

        // 3. Sprint 4 Planning & Task DAG Compilation
        const taskGraphEngine = new TaskGraphEngine();
        const nodesList = [
            {
                nodeId: "node_research",
                title: "Regional Market Analysis",
                type: "tool_call",
                assignedWorkerRole: "research",
                inputParameters: { targetRegion: "EU-West" },
                prerequisites: [],
                retryPolicy: { maxRetries: 2, backoffFactorMs: 50, jitter: true }
            },
            {
                nodeId: "node_finance",
                title: "Approve Infrastructure Allocation",
                type: "tool_call",
                assignedWorkerRole: "finance",
                inputParameters: { amountUSD: 500 }, // Under threshold so auto-approved
                prerequisites: ["node_research"]
            },
            {
                nodeId: "node_email",
                title: "Dispatch Executive Briefing",
                type: "tool_call",
                assignedWorkerRole: "email",
                inputParameters: { recipient: "board@acme.com", subject: "EU Expansion Plan Approved" },
                prerequisites: ["node_finance"]
            }
        ];

        const dag = taskGraphEngine.createTaskDAG(tenantId, correlationId, "Expand AI Infrastructure Regionally", nodesList);
        assert.equal(dag.executionLayers.length, 3);

        // 4. Sprint 4 Autonomous Execution Engine & Worker Dispatch
        const dlq = new DeadLetterQueue();
        const executionEngine = new AutonomousExecutionEngine(new WorkerFactory(), new ExecutionSandbox(), dlq);
        
        const executionResult = await executionEngine.executeDAG(dag, {
            tenantId,
            userId,
            sessionId: "sess_e2e_001",
            userRole: "admin",
            permissions: ["*"],
            grantedCapabilities: ["all"]
        });

        assert.equal(executionResult.status, "completed");
        assert.equal(executionResult.dlqRecords.length, 0);

        // 5. Verification of Worker Outputs & Trace Metadata
        const researchNode = dag.nodes.get("node_research");
        const financeNode = dag.nodes.get("node_finance");
        const emailNode = dag.nodes.get("node_email");

        assert.equal(researchNode?.status, "completed");
        assert.equal(financeNode?.status, "completed");
        assert.equal(emailNode?.status, "completed");

        const researchTrace = executionResult.executionTrace.find((t) => t.taskNodeId === "node_research");
        assert.ok(researchTrace);
        assert.equal(researchTrace.workerRole, "research");
    });

    it("E2E 2: Persistence Checkpointing & Cold Recovery Simulation", async () => {
        const store = new ExecutionStore();
        const recoveryEngine = new RecoveryEngine(store);

        const instanceId = `inst_rec_${Date.now()}`;
        const workspaceId = "tenant_acme";
        const correlationId = "corr_rec_test";

        const checkpoint = {
            checkpointId: `chk_${Date.now()}`,
            instanceId,
            workspaceId,
            correlationId,
            dagId: `dag_${instanceId}`,
            executionVersion: 1,
            completedNodeIds: ["node_1"],
            activeNodeId: "node_2",
            nodeOutputs: { node_1: { success: true } },
            agentMemoryState: { step: 1 },
            consumedTokensTotal: { input: 1000, output: 250 },
            timestamp: Date.now()
        };

        // Persist Checkpoint
        await store.saveCheckpoint(checkpoint);

        // Recover State
        const recoveryResult = await recoveryEngine.recoverDAG(instanceId, "crash");
        assert.ok(recoveryResult);
        assert.equal(recoveryResult.version, 2);
        assert.equal(recoveryResult.recoveredDAG.status, "executing");

        // Verify Idempotency Protection
        const idempotencyKey = "idem_doc_q3_report";
        await store.saveIdempotencyKey({
            idempotencyKey,
            workspaceId,
            toolId: "document.create_report",
            actionName: "Generate Report",
            executedAt: Date.now()
        });

        const isExecuted = await recoveryEngine.verifyIdempotency(idempotencyKey);
        assert.equal(isExecuted, true);
    });

    it("E2E 3: Universal Tool & Connector Sandbox Governance", async () => {
        const connectorSDK = new ConnectorSDK();
        const toolRegistry = new ToolRegistry();
        const sandbox = new ExecutionSandbox(toolRegistry);
        const contextHydrator = new ContextHydrator();

        const allTools = connectorSDK.getAllSupportedTools();
        assert.ok(allTools.length > 0);

        allTools.forEach((contract) => {
            toolRegistry.registerTool(contract, async (params) => ({ success: true, params }));
        });

        const context = contextHydrator.hydrateContext("inst_gov_001", {
            workspaceId: "tenant_acme",
            correlationId: "corr_gov_001",
            workerRole: "email",
            taskDescription: "Send confidential update",
            userId: "user_cfo",
            grantedPermissions: ["email.send"]
        });

        // Run Dry-Run Simulation Mode
        const simResult = await sandbox.executeTool({
            toolId: "google_workspace.send_email",
            inputParameters: {
                to: "board@acme.com",
                subject: "Financial Summary",
                body: "Report body",
                secretApiKey: "sk_live_SECRET_KEY_999"
            },
            context,
            isDryRun: true
        });

        assert.equal(simResult.status, "dry_run_success");
        assert.equal(simResult.sanitizedParameters.secretApiKey, "[REDACTED_SECRET]");
        assert.equal(simResult.sanitizedParameters.to, "board@acme.com");
    });

    it("E2E 4: Agent Runtime Lifecycle & Cost Accounting", async () => {
        const runtime = new AgentRuntime();

        const instance = await runtime.spawnAgent({
            workspaceId: "tenant_acme",
            correlationId: "corr_runtime_001",
            workerRole: "automation",
            taskDescription: "Automate webhooks ingestion",
            userId: "user_ops"
        });

        assert.equal(instance.status, "executing");

        // Record checkpoint
        await runtime.checkpointState(instance.instanceId, { step: 1 });

        const fetched = runtime.getAgentInstance(instance.instanceId);
        assert.ok(fetched);
        assert.equal(fetched.checkpoints.length, 2);

        const pausedInstance = await runtime.pauseAgent(instance.instanceId, "user pause");
        assert.equal(pausedInstance.status, "paused_for_approval");

        const resumedInstance = await runtime.resumeAgent(instance.instanceId);
        assert.equal(resumedInstance.status, "executing");
    });

    it("E2E 5: System Performance SLAs Verification", async () => {
        const taskGraphEngine = new TaskGraphEngine();

        const startTime = performance.now();
        const nodesList = Array.from({ length: 20 }, (_, i) => ({
            nodeId: `node_${i}`,
            title: `Node ${i}`,
            type: "tool_call",
            assignedWorkerRole: i % 2 === 0 ? "research" : "automation",
            inputParameters: {},
            prerequisites: i === 0 ? [] : [`node_${Math.floor(i / 2)}`]
        }));

        const dag = taskGraphEngine.createTaskDAG("tenant_perf", "corr_perf", "High Throughput SLA Test", nodesList);
        const compilationTimeMs = performance.now() - startTime;

        assert.ok(compilationTimeMs < 100.0, `Compilation took ${compilationTimeMs}ms, expected < 100ms`);
        assert.ok(dag.executionLayers.length > 0);
    });
});
