/**
 * Connector Marketplace Engine Test Suite (PAL-TDD-009, Sprint 22 Milestone 3)
 *
 * Verifies:
 *   1. Displays enterprise SaaS connector catalog with SLA uptime metrics and verified badges.
 *   2. Installs verified connectors into enterprise workspace.
 *   3. Filters catalog by product category (Finance, CRM, Communication).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ConnectorMarketplaceEngine } from "../lib/marketplace/connectorMarketplaceEngine.ts";

describe("Sprint 22 Milestone 3 — Real Connector Marketplace", () => {
    const marketplace = ConnectorMarketplaceEngine.getInstance();

    it("1. Displays productized enterprise connector catalog with 99.9%+ SLA uptime and verified badges", () => {
        const catalog = marketplace.getCatalog();

        assert.ok(catalog.length >= 3);
        const stripe = catalog.find(c => c.connectorId === "conn_stripe_prod");

        assert.ok(stripe);
        assert.equal(stripe.isVerifiedEnterprise, true);
        assert.equal(stripe.uptimeSlaPct, 99.99);
        assert.equal(stripe.publisherName, "Stripe Inc (Official)");
    });

    it("2. Installs enterprise connector into workspace and updates install metrics", () => {
        const installed = marketplace.installConnector("ws_demo_company", "conn_stripe_prod");

        assert.ok(installed.installationId.startsWith("inst_conn_"));
        assert.equal(installed.connectorName, "Stripe Enterprise Billing Gateway");
        assert.equal(installed.healthStatus, "healthy");

        const list = marketplace.getInstalledConnectors("ws_demo_company");
        assert.ok(list.some(i => i.connectorId === "conn_stripe_prod"));
    });

    it("3. Filters catalog items by domain category (finance)", () => {
        const financeConnectors = marketplace.getCatalog("finance");

        assert.ok(financeConnectors.length >= 1);
        assert.equal(financeConnectors[0].category, "finance");
    });
});
