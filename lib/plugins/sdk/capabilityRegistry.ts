/**
 * Vendor-Agnostic Capability Registry
 *
 * PAL Milestone 9A — Plugin SDK & Skills Platform
 */

export class CapabilityRegistry {
    private capabilityMap: Map<string, string[]> = new Map();

    public registerCapability(capability: string, providerId: string): void {
        if (!this.capabilityMap.has(capability)) {
            this.capabilityMap.set(capability, []);
        }
        const providers = this.capabilityMap.get(capability)!;
        if (!providers.includes(providerId)) {
            providers.push(providerId);
        }
    }

    public resolveCapability(capability: string): string | null {
        const providers = this.capabilityMap.get(capability);
        return providers && providers.length > 0 ? providers[0] : null;
    }

    public listCapabilities(): Array<{ capability: string; providers: string[] }> {
        const list: Array<{ capability: string; providers: string[] }> = [];
        for (const [capability, providers] of this.capabilityMap.entries()) {
            list.push({ capability, providers });
        }
        return list;
    }
}

export const globalCapabilityRegistry = new CapabilityRegistry();

// Default core capability registrations
globalCapabilityRegistry.registerCapability("CREATE_ISSUE", "github");
globalCapabilityRegistry.registerCapability("SEND_SLACK_ALERT", "slack");
globalCapabilityRegistry.registerCapability("CREATE_INVOICE", "stripe");
globalCapabilityRegistry.registerCapability("SCHEDULE_MEETING", "google_workspace");
