"use client";

import React from "react";
import ExecutiveCard from "./ExecutiveCard";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Priority {
    id: string;
    title: string;
    score: number;
    reason: string;
    actionUrl: string;
}

export default function TopPrioritiesWidget({ priorities }: { priorities?: Priority[] }) {
    const list: Priority[] = priorities || [
        {
            id: "p1",
            title: "Finalize Series A Term Sheet Deck",
            score: 95,
            reason: "Upcoming investor meeting on Friday",
            actionUrl: "/projects",
        },
        {
            id: "p2",
            title: "Send Q3 Invoice Reminders",
            score: 88,
            reason: "$14,500 outstanding past due date",
            actionUrl: "/tasks",
        },
        {
            id: "p3",
            title: "Client Check-in with Apex Cybernetics",
            score: 82,
            reason: "35 days since last interaction",
            actionUrl: "/relationships",
        },
    ];

    return (
        <ExecutiveCard
            title="Top Operational Priorities"
            subtitle="Deterministic priority order by business impact score"
            action={
                <Link href="/tasks" className="text-xs text-[#2D7FE0] hover:underline font-bold">
                    View All
                </Link>
            }
        >
            <div className="space-y-2.5">
                {list.slice(0, 3).map((item, idx) => (
                    <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#161B26] border border-white/5 hover:border-[#2D7FE0]/50 transition-all flex items-start justify-between gap-3 group"
                    >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="w-6 h-6 rounded-xl bg-[#2D7FE0]/20 text-[#2D7FE0] border border-[#2D7FE0]/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                #{idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-white group-hover:text-[#2D7FE0] transition-colors truncate">
                                    {item.title}
                                </h4>
                                <p className="text-[11px] text-[#999CA5] mt-0.5 truncate">{item.reason}</p>
                            </div>
                        </div>

                        <Link
                            href={item.actionUrl}
                            className="p-2 rounded-xl bg-[#121620] text-[#999CA5] group-hover:text-white group-hover:bg-[#2D7FE0] transition-all shrink-0"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                ))}
            </div>
        </ExecutiveCard>
    );
}
