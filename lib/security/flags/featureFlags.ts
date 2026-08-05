/**
 * PAL Subsystem Feature Flag Manager
 * 
 * Governing Spec: PAL-TDD-001 Chapter 8 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:FeatureFlags");

export interface FeatureFlags {
    mfa_enabled: boolean;
    abac_strict_mode: boolean;
    ai_assisted_approvals: boolean;
    session_fingerprinting: boolean;
    connector_scope_isolation: boolean;
}

export class IdentityFeatureFlags {
    private static instance: IdentityFeatureFlags;
    private flags: FeatureFlags = {
        mfa_enabled: false,
        abac_strict_mode: true,
        ai_assisted_approvals: true,
        session_fingerprinting: true,
        connector_scope_isolation: true
    };

    private constructor() {}

    public static getInstance(): IdentityFeatureFlags {
        if (!IdentityFeatureFlags.instance) {
            IdentityFeatureFlags.instance = new IdentityFeatureFlags();
        }
        return IdentityFeatureFlags.instance;
    }

    public isEnabled(flag: keyof FeatureFlags): boolean {
        return this.flags[flag] ?? false;
    }

    public setFlag(flag: keyof FeatureFlags, enabled: boolean): void {
        const oldVal = this.flags[flag];
        this.flags[flag] = enabled;
        logger.info(`Feature flag '${flag}' updated`, { oldVal, newVal: enabled });
    }

    public getFlags(): FeatureFlags {
        return { ...this.flags };
    }
}

export const featureFlags = IdentityFeatureFlags.getInstance();
