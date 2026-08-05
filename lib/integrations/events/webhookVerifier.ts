/**
 * Webhook HMAC Verifier & Security Gate (PAL-TDD-004, PAL-ARCH-DOC-029)
 */

import { ConnectorManager } from "../connectorManager.ts";
import type { RawWebhookPayload } from "./universalEventTypes.ts";

export class WebhookVerifier {
    private connectorManager: ConnectorManager;

    constructor(connectorManager?: ConnectorManager) {
        this.connectorManager = connectorManager || new ConnectorManager();
    }

    async verifyWebhook(payload: RawWebhookPayload): Promise<boolean> {
        const driver = this.connectorManager.getDriver(payload.connectorId);
        if (!driver) {
            // Unregistered driver cannot be verified
            return false;
        }

        const result = await driver.verifyWebhook(payload.headers, payload.rawBody);
        return result.valid;
    }
}
