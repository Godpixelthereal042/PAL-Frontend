/**
 * PAL Plugin Security & Sandboxing Manager
 * 
 * Governing Spec: PAL-TDD-001 Chapter 10 & Appendix A
 * Architecture Bible: Chapter 23 & 24
 */

import crypto from "crypto";
import { getDB } from "../../db.ts";
import { AuditRepository } from "../../db/repositories/auditRepository.ts";
import { ForbiddenError, ValidationError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:PluginSecurityManager");

export interface PluginRegistrationParams {
    workspaceId: string;
    pluginName: string;
    version: string;
    requestedCapabilities: string[]; // e.g. ["calendar:read", "email:send"]
}

export interface PluginSandboxContext {
    pluginId: string;
    workspaceId: string;
    capabilities: string[];
    isApproved: boolean;
}

export class PluginSecurityManager {
    private auditRepo: AuditRepository;

    constructor(auditRepo?: AuditRepository) {
        this.auditRepo = auditRepo || new AuditRepository();
    }

    public async registerPlugin(params: PluginRegistrationParams): Promise<PluginSandboxContext> {
        if (!params.workspaceId || !params.pluginName) {
            throw new ValidationError("Workspace ID and plugin name are required", { details: { params } });
        }

        const pluginId = `plug_${crypto.randomUUID()}`;
        const now = Date.now();

        const db = await getDB();
        await db.run(
            `INSERT INTO workspace_plugins (id, workspace_id, plugin_id, plugin_name, version, status, permissions_granted, approved_permissions, installed_by, installed_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pluginId,
                params.workspaceId,
                pluginId,
                params.pluginName,
                params.version,
                "installed",
                JSON.stringify(params.requestedCapabilities),
                JSON.stringify(params.requestedCapabilities),
                "system",
                now,
                now
            ]
        );

        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: params.workspaceId,
            actor_id: pluginId,
            actor_type: "plugin",
            event: "PluginInstalled",
            resource: `/plugins/${pluginId}`,
            result: "success",
            correlation_id: `corr_${crypto.randomUUID()}`,
            metadata: JSON.stringify({ name: params.pluginName, capabilities: params.requestedCapabilities }),
            created_at: now
        });

        logger.info("Plugin installed and sandboxed successfully", { pluginId, name: params.pluginName });

        return {
            pluginId,
            workspaceId: params.workspaceId,
            capabilities: params.requestedCapabilities,
            isApproved: true
        };
    }

    public enforceRuntimePermission(sandbox: PluginSandboxContext, requiredCapability: string): boolean {
        // Enforce Sandboxing
        if (!sandbox.isApproved) {
            logger.warn("Plugin execution blocked: Plugin not approved", { pluginId: sandbox.pluginId });
            throw new ForbiddenError("Unapproved plugins are prohibited from executing capabilities", {
                details: { errorCode: "PLUGIN_UNAPPROVED" }
            });
        }

        const hasCapability = sandbox.capabilities.includes("*") || sandbox.capabilities.includes(requiredCapability);
        if (!hasCapability) {
            logger.warn("Plugin execution blocked: Capability not granted in sandbox", { pluginId: sandbox.pluginId, requiredCapability });
            throw new ForbiddenError(`Plugin sandbox violation: Missing capability '${requiredCapability}'`, {
                details: { errorCode: "PLUGIN_CAPABILITY_VIOLATION" }
            });
        }

        return true;
    }
}
