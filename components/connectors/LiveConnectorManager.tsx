"use client";

import React, { useState } from "react";
import type { LiveConnectorStatus, ConnectorProvider } from "../../lib/connectors/connectorTypes";
import { RefreshCw, CheckCircle, Cable } from "lucide-react";

export function LiveConnectorManager() {
    const [statuses, setStatuses] = useState<LiveConnectorStatus[]>([
        { provider: "Stripe", status: "CONNECTED", lastSyncedTimestamp: Date.now(), recordsProcessedCount: 1420, healthScorePct: 99 },
        { provider: "Google_Workspace", status: "CONNECTED", lastSyncedTimestamp: Date.now(), recordsProcessedCount: 840, healthScorePct: 98 },
        { provider: "Slack", status: "CONNECTED", lastSyncedTimestamp: Date.now(), recordsProcessedCount: 2310, healthScorePct: 100 },
        { provider: "GitHub", status: "CONNECTED", lastSyncedTimestamp: Date.now(), recordsProcessedCount: 450, healthScorePct: 97 },
    ]);

    const handleSync = (provider: ConnectorProvider) => {
        setStatuses((prev) =>
            prev.map((s) =>
                s.provider === provider
                    ? { ...s, lastSyncedTimestamp: Date.now(), recordsProcessedCount: s.recordsProcessedCount + 50 }
                    : s
            )
        );
    };

    return (
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] text-[#1A1D26] space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[#1A1D26] flex items-center space-x-2">
                        <Cable className="w-5 h-5 text-[#3B7BF6]" />
                        <span>Production Business Connectors</span>
                    </h2>
                    <p className="text-xs text-[#7C8494] mt-1">Real-time data feeds connecting PAL to your company data ecosystem</p>
                </div>
                <span className="px-3 py-1 bg-[#EDFCF2] text-[#16a34a] border border-[#C6F0D5] text-xs font-semibold rounded-full">
                    4 Live Connectors Active
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statuses.map((conn) => (
                    <div key={conn.provider} className="bg-[#F5F7FA] border border-[#E2E6ED] rounded-2xl p-4.5 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#C8DEFF] transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E6ED] flex items-center justify-center font-bold text-[#3B7BF6] text-sm shadow-sm">
                                    {conn.provider.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1A1D26] text-sm">{conn.provider.replace("_", " ")}</h3>
                                    <p className="text-xs text-[#7C8494]">{conn.recordsProcessedCount.toLocaleString()} records normalized</p>
                                </div>
                            </div>
                            <span className="flex items-center space-x-1 text-xs font-semibold text-[#16a34a] bg-[#EDFCF2] px-2.5 py-1 rounded-full border border-[#C6F0D5]">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{conn.status}</span>
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#7C8494] pt-2 border-t border-[#EEF0F4]">
                            <span>Health: <strong className="text-[#1A1D26]">{conn.healthScorePct}%</strong></span>
                            <button
                                onClick={() => handleSync(conn.provider)}
                                className="flex items-center space-x-1 text-[#3B7BF6] hover:text-[#2563EB] font-semibold transition"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Sync Now</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
