"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import ExecutiveCard from "./ExecutiveCard";
import { useToast } from "@/components/ui/ToastProvider";

export default function ApprovalQueueWidget() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [approvals, setApprovals] = useState<any[]>([]);

    useEffect(() => {
        loadApprovals();
    }, []);

    async function loadApprovals() {
        try {
            const res = await fetch("/api/approvals");
            const data = await res.json();
            if (data.success && data.items) {
                setApprovals(data.items);
            }
        } catch (err) {
            console.error("Failed to load approval queue:", err);
        } finally {
            setLoading(false);
        }
    }

    async function processApproval(approvalId: string, action: "approve" | "reject") {
        try {
            await fetch("/api/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approvalId, action }),
            });
            showToast(
                action === "approve" ? "Proposal approved & worker executed!" : "Proposal rejected.",
                action === "approve" ? "success" : "info"
            );
            await loadApprovals();
        } catch (err) {
            console.error(`Failed to process approval (${action}):`, err);
        }
    }

    return (
        <ExecutiveCard
            title="Executive Approval Queue"
            subtitle="Agent-prepared actions staged for founder review"
        >
            <div className="space-y-3 pt-1">
                {loading ? (
                    <div className="py-6 text-center text-[#999CA5] text-xs animate-pulse">
                        Loading pending agent proposals...
                    </div>
                ) : approvals.length > 0 ? (
                    <div className="space-y-2.5">
                        {approvals.map((appr) => (
                            <div key={appr.id} className="p-4 rounded-2xl bg-[#161B26] border border-white/5 space-y-2.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2D7FE0]/20 text-[#2D7FE0] border border-[#2D7FE0]/40">
                                        {appr.agentRole} Agent
                                    </span>
                                    <span className="text-[10px] text-[#999CA5]">
                                        Risk Level: <strong className="text-[#22C55E]">LOW</strong>
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white leading-snug">{appr.actionTitle}</h4>
                                    <p className="text-[#999CA5] mt-0.5">{appr.justification}</p>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        onClick={() => processApproval(appr.id, "reject")}
                                        className="px-3 py-1.5 rounded-xl bg-[#121620] hover:bg-rose-500/20 text-[#999CA5] hover:text-rose-400 border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                    </button>
                                    <button
                                        onClick={() => processApproval(appr.id, "approve")}
                                        className="px-3.5 py-1.5 rounded-xl bg-[#2D7FE0] hover:bg-[#2563EB] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Execute
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center text-[#999CA5] text-xs font-semibold bg-[#161B26] rounded-2xl border border-white/5">
                        ✓ No pending worker proposals requiring review.
                    </div>
                )}
            </div>
        </ExecutiveCard>
    );
}
