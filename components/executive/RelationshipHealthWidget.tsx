"use client";

import React from "react";
import ExecutiveCard from "./ExecutiveCard";
import StatusBadge from "./StatusBadge";
import { Users, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RelationshipHealthProps {
    atRiskCount?: number;
    totalPeople?: number;
    atRiskList?: Array<{ id: string; name: string; type: string; daysAgo: number }>;
}

export default function RelationshipHealthWidget({
    atRiskCount = 2,
    totalPeople = 12,
    atRiskList,
}: RelationshipHealthProps) {
    const contacts = atRiskList || [
        { id: "p1", name: "Sarah Jenkins", type: "Investor", daysAgo: 32 },
        { id: "p2", name: "Samantha Wright", type: "Client", daysAgo: 45 },
    ];

    return (
        <ExecutiveCard
            title="Relationship Health"
            subtitle={`${totalPeople} key stakeholders tracked`}
            action={
                <Link href="/relationships" className="text-xs text-[#2D7FE0] hover:underline font-bold flex items-center gap-1">
                    Relationship Center <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            }
        >
            <div className="space-y-4">
                {/* Metric Summary Bar */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161B26] border border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#2D7FE0]/20 text-[#2D7FE0] border border-[#2D7FE0]/40 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs font-extrabold text-white">{totalPeople} Stakeholders</div>
                            <div className="text-[11px] text-[#999CA5]">Investors, Clients, Partners</div>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs font-bold text-[#EF4444] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {atRiskCount} At-Risk
                        </span>
                        <div className="text-[10px] text-[#999CA5]">Requires follow-up</div>
                    </div>
                </div>

                {/* At Risk List */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#999CA5] uppercase tracking-wider">
                        Stakeholders Requiring Attention
                    </h4>
                    <div className="space-y-2">
                        {contacts.map((c) => (
                            <div
                                key={c.id}
                                className="p-3 rounded-2xl bg-[#161B26] border border-white/5 flex items-center justify-between text-xs"
                            >
                                <div className="space-y-0.5">
                                    <div className="font-bold text-white">{c.name}</div>
                                    <div className="text-[10px] text-[#999CA5]">{c.type} • {c.daysAgo} days quiet</div>
                                </div>
                                <StatusBadge label="At Risk" variant="at_risk" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ExecutiveCard>
    );
}
