"use client";

import React, { useState } from "react";
import { Link2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface ConnectorStatusItem {
    id: string;
    name: string;
    icon: string;
    category: "email" | "calendar" | "crm" | "finance";
    status: "connected" | "sandbox" | "needs_auth" | "disconnected";
    accountName?: string;
    lastSyncAt?: string;
}

export function ConnectorOnboardingWidget() {
    const { showToast } = useToast();
    const [connectors, setConnectors] = useState<ConnectorStatusItem[]>([
        { id: "google_gmail", name: "Gmail API", icon: "✉️", category: "email", status: "connected", accountName: "executive@company.com", lastSyncAt: "2 mins ago" },
        { id: "google_calendar", name: "Google Calendar", icon: "📅", category: "calendar", status: "connected", accountName: "executive@company.com", lastSyncAt: "5 mins ago" },
        { id: "stripe", name: "Stripe Billing", icon: "💳", category: "finance", status: "sandbox", accountName: "Test Sandbox Account", lastSyncAt: "10 mins ago" },
        { id: "hubspot", name: "HubSpot CRM", icon: "🧡", category: "crm", status: "connected", accountName: "Enterprise Sales Hub", lastSyncAt: "1 min ago" },
        { id: "salesforce", name: "Salesforce CRM", icon: "☁️", category: "crm", status: "needs_auth", accountName: "Pending OAuth Grant" }
    ]);

    const handleConnect = (id: string) => {
        setConnectors(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, status: "connected", accountName: "user@company.com", lastSyncAt: "Just now" };
            }
            return c;
        }));
        showToast("SaaS Connector authorized & live context synced!", "success");
    };

    return (
        <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-[#2D7FE0]" />
                        <span>SaaS Connector Hub</span>
                    </h3>
                    <p className="text-xs text-[#999CA5] mt-0.5">
                        Authorize PAL worker agents to operate through your business APIs.
                    </p>
                </div>
                <span className="text-xs font-bold text-[#2D7FE0] bg-[#2D7FE0]/20 px-3 py-1 rounded-full border border-[#2D7FE0]/40">
                    {connectors.filter(c => c.status === "connected").length} / {connectors.length} Active
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connectors.map(c => (
                    <div key={c.id} className="p-4 bg-[#161B26] border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all shadow-md">
                        <div className="flex items-center gap-3">
                            <span className="text-xl p-2.5 rounded-2xl bg-[#121620] border border-white/10">{c.icon}</span>
                            <div>
                                <h4 className="text-sm font-bold text-white">{c.name}</h4>
                                <p className="text-xs text-[#999CA5]">{c.accountName || "Not Connected"}</p>
                                {c.lastSyncAt && <p className="text-[10px] text-[#22C55E] font-medium mt-0.5">✓ Synced: {c.lastSyncAt}</p>}
                            </div>
                        </div>

                        {c.status === "connected" ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Live
                            </span>
                        ) : c.status === "sandbox" ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] text-[10px] font-bold border border-[#3B82F6]/30">
                                Sandbox
                            </span>
                        ) : (
                            <button
                                onClick={() => handleConnect(c.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#2D7FE0] hover:bg-[#2563EB] text-white text-xs font-bold shadow-md transition-all"
                            >
                                Connect
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
