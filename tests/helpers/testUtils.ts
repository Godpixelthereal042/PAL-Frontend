/**
 * PAL Testing Helpers & Mock Infrastructure
 * 
 * Governing Bible Chapters:
 * - Chapter 27: Platform API & Developer Experience (DX) Architecture
 * - Chapter 28: Deployment, Infrastructure & DevOps Architecture
 */

import { UserEntity } from "../../lib/db/repositories/userRepository.ts";
import { BusinessBrainEntity } from "../../lib/db/repositories/businessBrainRepository.ts";
import { DecisionEntity } from "../../lib/db/repositories/decisionRepository.ts";

export function createMockUser(overrides?: Partial<UserEntity>): UserEntity {
    return {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        email: "test.founder@pal.ai",
        name: "Test Founder",
        role: "founder",
        organization_id: "org_default_test",
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockBrainItem(overrides?: Partial<BusinessBrainEntity>): BusinessBrainEntity {
    return {
        id: `brain_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        category: "strategy",
        key: "company_mission",
        value: "Empower every team with an AI Executive Operating System",
        source: "user",
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockDecision(overrides?: Partial<DecisionEntity>): DecisionEntity {
    return {
        id: `dec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: "Approve Architecture Migration",
        description: "Adopt 9-Layer Downward Architecture & Core Infrastructure Framework",
        category: "engineering",
        status: "active",
        impact: "high",
        confidence_score: 0.95,
        created_at: new Date().toISOString(),
        ...overrides,
    };
}
