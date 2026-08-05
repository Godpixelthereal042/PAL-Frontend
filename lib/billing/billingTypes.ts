/**
 * Client-safe Billing Data Types (PAL v3.3)
 */

export type SubscriptionTier = "Starter" | "Growth" | "Enterprise";
export type UserRbacRole = "Owner" | "CEO" | "Admin" | "Member" | "Viewer";

export interface SubscriptionRecord {
    subscriptionId: string;
    workspaceId: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    tier: SubscriptionTier;
    monthlyPriceUsd: number;
    maxAiEmployees: number;
    maxAutonomousActionsPerMonth: number;
    actionsUsedThisMonth: number;
    status: "ACTIVE" | "PAST_DUE" | "CANCELED";
    currentPeriodEndsAt: number;
}
