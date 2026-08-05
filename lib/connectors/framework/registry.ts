/**
 * Enterprise Connector Registry & Instantiation
 *
 * PAL Milestone 8C — Enterprise Connectivity Framework
 */

import { BaseConnector } from "./baseConnector.ts";
import { GoogleWorkspaceConnector } from "../production/googleWorkspaceConnector.ts";
import { SlackConnector } from "../production/slackConnector.ts";
import { GitHubConnector } from "../production/gitHubConnector.ts";
import { NotionConnector } from "../production/notionConnector.ts";
import { StripeConnector } from "../production/stripeConnector.ts";

export class EnterpriseConnectorRegistry {
    private connectors: Map<string, BaseConnector> = new Map();

    public register(connector: BaseConnector): void {
        this.connectors.set(connector.metadata.id, connector);
    }

    public get(id: string): BaseConnector | undefined {
        return this.connectors.get(id);
    }

    public listConnectors(): BaseConnector[] {
        return Array.from(this.connectors.values());
    }

    public has(id: string): boolean {
        return this.connectors.has(id);
    }
}

export const globalConnectorRegistry = new EnterpriseConnectorRegistry();

// Register production connectors
globalConnectorRegistry.register(new GoogleWorkspaceConnector());
globalConnectorRegistry.register(new SlackConnector());
globalConnectorRegistry.register(new GitHubConnector());
globalConnectorRegistry.register(new NotionConnector());
globalConnectorRegistry.register(new StripeConnector());
