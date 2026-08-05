"use client";

import React, { useState } from "react";
import type { SubscriptionTier, SubscriptionRecord } from "../../lib/billing/billingTypes";
import { Check } from "lucide-react";

export function BillingSettingsScreen() {
    const [subscription, setSubscription] = useState<SubscriptionRecord>({
        subscriptionId: "sub_growth_active",
        workspaceId: "ws_current_org",
        tier: "Growth",
        monthlyPriceUsd: 1499,
        maxAiEmployees: 10,
        maxAutonomousActionsPerMonth: 1000,
        actionsUsedThisMonth: 142,
        status: "ACTIVE",
        currentPeriodEndsAt: Date.now() + 30 * 86400 * 1000,
    });

    const handleUpgrade = (tier: SubscriptionTier) => {
        let monthlyPriceUsd = 1499;
        let maxAiEmployees = 10;
        let maxAutonomousActionsPerMonth = 1000;

        if (tier === "Starter") {
            monthlyPriceUsd = 499;
            maxAiEmployees = 3;
            maxAutonomousActionsPerMonth = 100;
        } else if (tier === "Enterprise") {
            monthlyPriceUsd = 4999;
            maxAiEmployees = -1;
            maxAutonomousActionsPerMonth = -1;
        }

        setSubscription((prev) => ({
            ...prev,
            tier,
            monthlyPriceUsd,
            maxAiEmployees,
            maxAutonomousActionsPerMonth,
        }));
    };

    return (
        <div className="space-y-6 text-[#1A1D26] max-w-5xl mx-auto py-4">
            <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3B7BF6]">Current Plan</span>
                    <h2 className="text-2xl font-extrabold text-[#1A1D26] mt-1">{subscription.tier} Autonomous OS Plan</h2>
                    <p className="text-xs text-[#7C8494] mt-1">
                        ${subscription.monthlyPriceUsd.toLocaleString()}/month • Actions used: {subscription.actionsUsedThisMonth} / {subscription.maxAutonomousActionsPerMonth === -1 ? "Unlimited" : subscription.maxAutonomousActionsPerMonth}
                    </p>
                </div>
                <span className="px-4 py-1.5 bg-[#EDFCF2] text-[#16a34a] border border-[#C6F0D5] text-xs font-bold rounded-full uppercase tracking-wider">
                    {subscription.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <div className={`bg-[#EDFCF2] border rounded-3xl p-6 flex flex-col justify-between transition-all ${subscription.tier === "Starter" ? "border-[#22c55e] ring-2 ring-[#22c55e]/20 shadow-md" : "border-[#C6F0D5]"}`}>
                    <div>
                        <h3 className="font-bold text-lg text-[#1A1D26]">Starter</h3>
                        <p className="text-xs text-[#5A6070] mt-1">For early-stage startups automating key workflows</p>
                        <div className="my-4">
                            <span className="text-3xl font-black text-[#1A1D26]">$499</span>
                            <span className="text-xs text-[#7C8494]">/month</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-[#1A1D26] my-4">
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#16a34a]" /><span>3 AI Employees</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#16a34a]" /><span>5 Standard Connectors</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#16a34a]" /><span>100 Autonomous Actions/mo</span></li>
                        </ul>
                    </div>
                    <button
                        onClick={() => handleUpgrade("Starter")}
                        disabled={subscription.tier === "Starter"}
                        className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all ${subscription.tier === "Starter" ? "bg-white/80 text-[#7C8494] cursor-default border border-[#C6F0D5]" : "bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-sm"}`}
                    >
                        {subscription.tier === "Starter" ? "Current Plan" : "Switch to Starter"}
                    </button>
                </div>

                {/* Growth Plan */}
                <div className={`bg-[#EFF5FF] border rounded-3xl p-6 flex flex-col justify-between relative transition-all ${subscription.tier === "Growth" ? "border-[#3B7BF6] ring-2 ring-[#3B7BF6]/20 shadow-md" : "border-[#C8DEFF]"}`}>
                    <span className="absolute -top-3 right-6 bg-gradient-to-r from-[#3B7BF6] to-[#6C5CE7] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">Popular</span>
                    <div>
                        <h3 className="font-bold text-lg text-[#1A1D26]">Growth</h3>
                        <p className="text-xs text-[#5A6070] mt-1">For growing companies scaling autonomous teams</p>
                        <div className="my-4">
                            <span className="text-3xl font-black text-[#1A1D26]">$1,499</span>
                            <span className="text-xs text-[#7C8494]">/month</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-[#1A1D26] my-4">
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#3B7BF6]" /><span>10 AI Employees</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#3B7BF6]" /><span>Unlimited Connectors</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#3B7BF6]" /><span>1,000 Autonomous Actions/mo</span></li>
                        </ul>
                    </div>
                    <button
                        onClick={() => handleUpgrade("Growth")}
                        disabled={subscription.tier === "Growth"}
                        className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all ${subscription.tier === "Growth" ? "bg-white/80 text-[#7C8494] cursor-default border border-[#C8DEFF]" : "bg-[#3B7BF6] hover:bg-[#2563EB] text-white shadow-sm"}`}
                    >
                        {subscription.tier === "Growth" ? "Current Plan" : "Upgrade to Growth"}
                    </button>
                </div>

                {/* Enterprise Plan */}
                <div className={`bg-[#FFF9F0] border rounded-3xl p-6 flex flex-col justify-between transition-all ${subscription.tier === "Enterprise" ? "border-[#F59E0B] ring-2 ring-[#F59E0B]/20 shadow-md" : "border-[#F5E6CF]"}`}>
                    <div>
                        <h3 className="font-bold text-lg text-[#1A1D26]">Enterprise</h3>
                        <p className="text-xs text-[#5A6070] mt-1">Full enterprise autonomous company OS</p>
                        <div className="my-4">
                            <span className="text-3xl font-black text-[#1A1D26]">$4,999</span>
                            <span className="text-xs text-[#7C8494]">/month</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-[#1A1D26] my-4">
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#d97706]" /><span>Unlimited AI Employees</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#d97706]" /><span>Custom Enterprise Connectors</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#d97706]" /><span>Unlimited Autonomous Actions</span></li>
                            <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#d97706]" /><span>Dedicated CSM & 99.98% SLA</span></li>
                        </ul>
                    </div>
                    <button
                        onClick={() => handleUpgrade("Enterprise")}
                        disabled={subscription.tier === "Enterprise"}
                        className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all ${subscription.tier === "Enterprise" ? "bg-white/80 text-[#7C8494] cursor-default border border-[#F5E6CF]" : "bg-[#F59E0B] hover:bg-[#d97706] text-white shadow-sm"}`}
                    >
                        {subscription.tier === "Enterprise" ? "Current Plan" : "Upgrade to Enterprise"}
                    </button>
                </div>
            </div>
        </div>
    );
}
