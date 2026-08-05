/**
 * Abstract Base Plugin
 *
 * PAL Milestone 9A — Plugin SDK & Skills Platform
 */

import type { PluginManifest, PluginContext, PluginStatus } from "./types.ts";

export abstract class BasePlugin {
    public abstract readonly manifest: PluginManifest;

    protected status: PluginStatus = "disabled";

    public getStatus(): PluginStatus {
        return this.status;
    }

    public setStatus(status: PluginStatus): void {
        this.status = status;
    }

    public async onInstall(context: PluginContext): Promise<void> {}
    public async onLoad(context: PluginContext): Promise<void> {}
    public async onEnable(context: PluginContext): Promise<void> {}
    public async onDisable(context: PluginContext): Promise<void> {}
    public async onUninstall(context: PluginContext): Promise<void> {}

    public abstract executeSkill?(skillId: string, params: Record<string, any>, context: PluginContext): Promise<any>;
}
