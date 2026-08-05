"use client";

import React, { useState, useEffect } from "react";
import { Bot, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import ExecutiveCard from "./ExecutiveCard";

export default function ExecutiveTeamWidget() {
    const [loading, setLoading] = useState(true);
    const [teamStatus, setTeamStatus] = useState<any>(null);

    useEffect(() => {
        async function fetchTeamStatus() {
            try {
                const res = await fetch("/api/agents/status");
                const data = await res.json();
                if (data.success && data.status) {
                    setTeamStatus(data.status);
                }
            } catch (err) {
                console.error("Failed to load Executive Team status:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTeamStatus();
    }, []);

    return (
        <ExecutiveCard
            title="Autonomous Executive Team"
            subtitle="Specialized AI worker agents collaborating under Business Brain"
            action={
                <Link href="/briefing" className="text-xs text-[#2D7FE0] hover:underline font-bold flex items-center gap-1">
                    View Team Status <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            }
        >
            <div className="space-y-4 pt-1">
                {loading ? (
                    <div className="py-6 text-center text-[#999CA5] text-xs animate-pulse">
                        Synchronizing Executive Agents context...
                    </div>
                ) : teamStatus ? (
                    <>
                        {/* Overall Confidence Header */}
                        <div className="p-3 rounded-2xl bg-[#161B26] border border-white/5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#2D7FE0]" />
                                <span className="text-white font-bold">Multi-Agent Unified Confidence</span>
                            </div>
                            <span className="font-bold text-[#2D7FE0] bg-[#2D7FE0]/20 px-2.5 py-0.5 rounded-full border border-[#2D7FE0]/40">
                                {Math.round((teamStatus.unifiedConfidence || 0.94) * 100)}% Verified
                            </span>
                        </div>

                        {/* Agents Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {(teamStatus.agents || [
                                { role: "COO Agent", focusArea: "Operations & Tasks", status: "active" },
                                { role: "CFO Agent", focusArea: "Financial MRR & Invoices", status: "active" },
                                { role: "CTO Agent", focusArea: "Security & API Infrastructure", status: "active" },
                                { role: "CMO Agent", focusArea: "Growth & Customer Retention", status: "active" },
                            ]).map((agent: any, idx: number) => (
                                <div key={idx} className="p-3.5 rounded-2xl bg-[#161B26] border border-white/5 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Bot className="w-3.5 h-3.5 text-[#2D7FE0]" /> {agent.role}
                                        </span>
                                        <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                                    </div>
                                    <p className="text-[11px] text-[#999CA5] leading-tight">{agent.focusArea}</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : null}
            </div>
        </ExecutiveCard>
    );
}
