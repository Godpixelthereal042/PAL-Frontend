import test from "node:test";
import assert from "node:assert/strict";
import { pluginManager } from "../lib/plugins/pluginManager.ts";
import { pluginPermissionManager } from "../lib/plugins/permissionManager.ts";
import { globalCapabilityRegistry } from "../lib/plugins/sdk/capabilityRegistry.ts";
import { globalSkillsFramework } from "../lib/plugins/sdk/skillsFramework.ts";

test("Plugin Framework - lists marketplace catalog and installs new plugin", async () => {
    const catalog = pluginManager.getMarketplaceCatalog();
    assert.ok(catalog.length >= 3, "Catalog should list at least 3 plugins");

    const sampleManifest = catalog[0];
    const installed = await pluginManager.installPlugin("user_test", sampleManifest);

    assert.equal(installed.id, sampleManifest.id);
    assert.equal(installed.status, "enabled");

    const list = await pluginManager.listInstalledPlugins("user_test");
    assert.ok(list.some((p) => p.id === sampleManifest.id), "Installed list should contain new plugin");
});

test("Plugin Permission Manager - grants and revokes plugin permissions", async () => {
    await pluginPermissionManager.grantPermission("user_test", "plugin_legal_advisor", "READ_BUSINESS_BRAIN");
    let hasPerm = await pluginPermissionManager.hasPermission("user_test", "plugin_legal_advisor", "READ_BUSINESS_BRAIN");
    assert.equal(hasPerm, true, "Permission should be granted");

    await pluginPermissionManager.revokePermission("user_test", "plugin_legal_advisor", "READ_BUSINESS_BRAIN");
    hasPerm = await pluginPermissionManager.hasPermission("user_test", "plugin_legal_advisor", "READ_BUSINESS_BRAIN");
    assert.equal(hasPerm, false, "Permission should be revoked");
});

test("Capability Registry - resolves vendor-agnostic capability to provider", () => {
    globalCapabilityRegistry.registerCapability("GENERATE_CONTRACT_SPEC", "legal_plugin");
    const provider = globalCapabilityRegistry.resolveCapability("GENERATE_CONTRACT_SPEC");
    assert.equal(provider, "legal_plugin");
});

test("Skills Framework - registers and lists executive skills", () => {
    const skills = globalSkillsFramework.listSkills();
    assert.ok(skills.length >= 4, "Should list at least 4 default executive skills");

    const swotSkill = globalSkillsFramework.getSkill("skill_swot_analysis");
    assert.ok(swotSkill, "SWOT skill should exist");
    assert.equal(swotSkill.name, "SWOT Analysis Generator");
});
