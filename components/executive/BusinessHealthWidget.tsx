"use client";

import React from "react";
import ExecutiveCard from "./ExecutiveCard";
import StatusBadge from "./StatusBadge";
import { TrendingUp, Activity } from "lucide-react";

interface BusinessHealthProps {
    health?: {
        score: number;
        status: string;
        trend: string;
        factors: Array<{ category: string; impact: string; detail: string }>;
    };
}

export default function BusinessHealthWidget({ health }: BusinessHealthProps) {
    const score = health?.score || 82;
    const status = health?.status || "Healthy";
    const factors = health?.factors || [
        { category: "Invoices", impact: "+5", detail: "On-time client invoice collections" },
        { category: "Projects", impact: "+10", detail: "Active projects advancing on schedule" },
        { category: "Relationships", impact: "-4", detail: "Investor update follow-up pending" },
    ];

    return (
        <ExecutiveCard title="Business Health" subtitle="Real-time composite operating score">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Score Display */}
                <div className="shrink-0 flex flex-col items-center">
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#161B26" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke="#2D7FE0" strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${score * 2.64} 264`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-white">{score}</span>
                            <span className="text-[10px] text-[#999CA5] font-semibold">Score</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <StatusBadge label={status} variant={status === "Healthy" ? "healthy" : "warning"} />
                        <span className="text-xs text-[#22C55E] font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" /> +4%
                        </span>
                    </div>
                </div>

                {/* Factors List */}
                <div className="flex-1 w-full space-y-2.5">
                    <h4 className="text-xs font-bold text-[#999CA5] uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#2D7FE0]" /> Primary Health Drivers
                    </h4>
                    <div className="space-y-2">
                        {factors.map((f, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-2xl bg-[#161B26] border border-white/5 flex items-center justify-between gap-3 text-xs"
                            >
                                <span className="text-slate-200 font-medium truncate">{f.detail}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                        f.impact.startsWith("+")
                                            ? "bg-[#22C55E]/15 text-[#22C55E]"
                                            : "bg-[#EF4444]/15 text-[#EF4444]"
                                    }`}
                                >
                                    {f.impact}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ExecutiveCard>
    );
}
