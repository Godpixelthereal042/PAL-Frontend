/**
 * Plugin SDK TypeScript Contracts
 *
 * PAL Milestone 9A — Plugin SDK & Skills Platform
 */

export type PluginStatus = "installed" | "enabled" | "disabled" | "error";

export interface ExecutiveSkill {
    id: string;
    name: string;
    description: string;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
    requiredPermissions: string[];
}

export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    permissions: string[];
    capabilities?: string[];
    events?: string[];
    actions?: string[];
    skills?: ExecutiveSkill[];
    dependencies?: string[];
}

export interface PluginContext {
    userId: string;
    snapshot: any;
    intelligence: any;
}

export interface PluginPermissionRecord {
    key: string;
    granted: boolean;
}
