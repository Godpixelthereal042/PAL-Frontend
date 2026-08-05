"use client";

import React from "react";
import { LayoutDashboard, Users, CheckCircle2, TrendingUp, Cable, CreditCard, Sparkles, LogIn, UserCheck } from "lucide-react";
import PALLogo from "../ui/PALLogo";

export type ActiveTab = "cockpit" | "agents" | "approvals" | "insights" | "connectors" | "billing" | "demo";

interface CeoSaasNavigationProps {
    activeTab: ActiveTab;
    onTabChange: (tab: ActiveTab) => void;
    authenticatedUser: { email: string; organizationName: string; role: string } | null;
    onOpenAuth: () => void;
}

export function CeoSaasNavigation({ activeTab, onTabChange, authenticatedUser, onOpenAuth }: CeoSaasNavigationProps) {
    const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
        { id: "cockpit", label: "Executive Cockpit", icon: LayoutDashboard },
        { id: "agents", label: "AI Workforce", icon: Users },
        { id: "approvals", label: "Approvals", icon: CheckCircle2 },
        { id: "insights", label: "Intelligence", icon: TrendingUp },
        { id: "connectors", label: "Connectors", icon: Cable },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "demo", label: "Investor Demo", icon: Sparkles }
    ];

    return (
        <header className="border-b border-[#EEF0F4] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange("cockpit")}>
                    <PALLogo width={36} height={36} className="drop-shadow-sm" />
                    <div className="flex flex-col justify-center ml-1">
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EFF5FF] text-[#3B7BF6] border border-[#C8DEFF] uppercase tracking-wider">
                            v3.0
                        </span>
                    </div>
                </div>

                <nav className="hidden md:flex items-center space-x-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-[#EFF5FF] text-[#3B7BF6] border border-[#C8DEFF] shadow-sm"
                                        : "text-[#7C8494] hover:text-[#1A1D26] hover:bg-[#F5F7FA]"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center space-x-4">
                {authenticatedUser ? (
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-semibold text-[#1A1D26]">{authenticatedUser.organizationName}</p>
                            <p className="text-[11px] text-[#9CA3AF]">{authenticatedUser.role} • {authenticatedUser.email}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#EDFCF2] text-[#22c55e] border border-[#C6F0D5] flex items-center justify-center">
                            <UserCheck className="w-4 h-4" />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onOpenAuth}
                        className="bg-[#3B7BF6] hover:bg-[#2563EB] text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center space-x-2 transition shadow-md shadow-blue-500/15"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In / Register</span>
                    </button>
                )}
            </div>
        </header>
    );
}
