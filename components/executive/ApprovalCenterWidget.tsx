"use client";

import React, { useState } from "react";
import { Check, X, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface PendingApproval {
    id: string;
    title: string;
    agentRole: string;
    estimatedCostUSD: number;
    justification: string;
    status: "pending" | "approved" | "rejected";
    createdAt: number;
}

export function ApprovalCenterWidget() {
    const { showToast } = useToast();
    const [approvals, setApprovals] = useState<PendingApproval[]>([
        {
            id: "appr_demo_101",
            title: "Expand sales team outreach campaign",
            agentRole: "CFO Agent",
            estimatedCostUSD: 5000,
            justification: "Automated operational trigger requiring human sign-off ($5,000 > $1,000 threshold)",
            status: "pending",
            createdAt: Date.now() - 3600000
        },
        {
            id: "appr_demo_102",
            title: "Authorize Q3 Cloud Infrastructure Budget",
            agentRole: "CTO Agent",
            estimatedCostUSD: 2500,
            justification: "Quarterly server capacity expansion proposal",
            status: "pending",
            createdAt: Date.now() - 7200000
        }
    ]);

    const handleAction = (id: string, action: "approved" | "rejected") => {
        setApprovals(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: action };
            }
            return item;
        }));
        showToast(
            action === "approved" ? "Approval confirmed and sent to AI Agent" : "Proposal rejected",
            action === "approved" ? "success" : "info"
        );
    };

    const pendingList = approvals.filter(a => a.status === "pending");

    return (
        <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-[#2D7FE0]" />
                        <span>Executive Approval Center</span>
                    </h3>
                    <p className="text-xs text-[#999CA5] mt-0.5">
                        Human-in-the-loop governance sign-off for high-spend operations (&gt; $1,000).
                    </p>
                </div>
                <span className="px-3 py-1 bg-[#2D7FE0]/20 text-[#2D7FE0] text-xs font-bold rounded-full border border-[#2D7FE0]/40">
                    {pendingList.length} Pending
                </span>
            </div>

            {pendingList.length === 0 ? (
                <div className="p-6 text-center text-[#999CA5] text-xs bg-[#161B26] rounded-2xl border border-white/5 font-semibold">
                    ✓ All high-spend governance proposals approved or reviewed.
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingList.map(item => (
                        <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-[#161B26] border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#2D7FE0]/20 text-[#2D7FE0]">
                                        {item.agentRole}
                                    </span>
                                    <span className="text-xs font-extrabold text-[#22C55E]">
                                        ${item.estimatedCostUSD.toLocaleString()} USD
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                <p className="text-xs text-[#999CA5]">{item.justification}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleAction(item.id, "approved")}
                                    className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                                >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(item.id, "rejected")}
                                    className="px-4 py-2 rounded-xl bg-[#161B26] hover:bg-rose-500/20 text-[#999CA5] hover:text-rose-400 border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
