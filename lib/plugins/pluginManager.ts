/**
 * Central Plugin Manager & Marketplace Engine
 *
 * PAL Milestone 9A — Plugin SDK & Skills Platform
 */

import { getDB } from "../db.ts";
import type { PluginManifest, PluginStatus } from "./sdk/types.ts";

export interface InstalledPluginRecord {
    id: string;
    userId: string;
    name: string;
    version: string;
    author: string;
    description: string;
    status: PluginStatus;
    manifest: PluginManifest;
    installedAt: number;
}

export class PluginManager {
    private catalog: PluginManifest[] = [
        {
            id: "plugin_legal_advisor",
            name: "Legal & Compliance Advisor",
            version: "1.0.0",
            author: "PAL Ecosystem Partner",
            description: "Scans contracts, decision records, and offer specs for legal compliance risks.",
            permissions: ["READ_BUSINESS_BRAIN", "READ_DECISIONS"],
            capabilities: ["LEGAL_COMPLIANCE_SCAN"],
        },
        {
            id: "plugin_customer_success",
            name: "Customer Success Automation",
            version: "1.2.0",
            author: "PAL Core Team",
            description: "Monitors client health scores and automatically stages onboarding milestone updates.",
            permissions: ["READ_RELATIONSHIPS", "CREATE_TASKS"],
            capabilities: ["CLIENT_HEALTH_MONITORING"],
        },
        {
            id: "plugin_hubspot_crm",
            name: "HubSpot CRM Connector",
            version: "2.0.0",
            author: "HubSpot Certified Partner",
            description: "Syncs deal pipelines, contact activity, and leads directly into PAL's Relationship Memory.",
            permissions: ["READ_RELATIONSHIPS", "USE_CONNECTORS"],
            capabilities: ["CRM_SYNC"],
        },
    ];

    public async installPlugin(userId: string, manifest: PluginManifest): Promise<InstalledPluginRecord> {
        const db = await getDB();
        const now = Date.now();
        const existing = await db.get("SELECT id FROM plugins WHERE (user_id = ? OR user_id = 'user_default') AND id = ?", [userId, manifest.id]);

        if (existing) {
            await db.run(
                "UPDATE plugins SET status = 'enabled', manifest = ?, updated_at = ? WHERE id = ?",
                [JSON.stringify(manifest), now, existing.id]
            );
        } else {
            await db.run(
                "INSERT INTO plugins (id, user_id, name, version, author, description, status, manifest, installed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [manifest.id, userId, manifest.name, manifest.version, manifest.author || "Community", manifest.description, "enabled", JSON.stringify(manifest), now, now]
            );
        }

        return {
            id: manifest.id,
            userId,
            name: manifest.name,
            version: manifest.version,
            author: manifest.author || "Community",
            description: manifest.description,
            status: "enabled",
            manifest,
            installedAt: now,
        };
    }

    public async listInstalledPlugins(userId = "user_default"): Promise<InstalledPluginRecord[]> {
        const db = await getDB();
        const records = await db.all("SELECT * FROM plugins WHERE user_id = ? OR user_id = 'user_default'", [userId]);

        // If empty, auto-install default sample plugin
        if (records.length === 0) {
            const installed = await this.installPlugin(userId, this.catalog[0]);
            return [installed];
        }

        return records.map((r) => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            version: r.version,
            author: r.author,
            description: r.description,
            status: r.status as PluginStatus,
            manifest: JSON.parse(r.manifest || "{}"),
            installedAt: r.installed_at,
        }));
    }

    public async setPluginStatus(userId: string, pluginId: string, status: PluginStatus): Promise<boolean> {
        const db = await getDB();
        const now = Date.now();
        await db.run("UPDATE plugins SET status = ?, updated_at = ? WHERE (user_id = ? OR user_id = 'user_default') AND id = ?", [status, now, userId, pluginId]);
        return true;
    }

    public async uninstallPlugin(userId: string, pluginId: string): Promise<boolean> {
        const db = await getDB();
        await db.run("DELETE FROM plugins WHERE (user_id = ? OR user_id = 'user_default') AND id = ?", [userId, pluginId]);
        return true;
    }

    public getMarketplaceCatalog(): PluginManifest[] {
        return this.catalog;
    }
}

export const pluginManager = new PluginManager();
