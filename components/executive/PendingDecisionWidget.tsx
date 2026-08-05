"use client";

import React from "react";
import ExecutiveCard from "./ExecutiveCard";
import { Scale, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DecisionItem {
    id: string;
    title: string;
    status: string;
    impactArea?: string;
}

export default function PendingDecisionWidget({ decisions }: { decisions?: DecisionItem[] }) {
    const list: DecisionItem[] = decisions || [
        {
            id: "d1",
            title: "Approve Enterprise Pricing Tier Upgrade ($499/mo)",
            status: "pending_confirmation",
            impactArea: "Revenue / Pricing",
        },
        {
            id: "d2",
            title: "Migrate Cloud Storage Infrastructure to AWS S3",
            status: "pending_confirmation",
            impactArea: "Engineering / Infra",
        },
    ];

    return (
        <ExecutiveCard
            title="Pending Decisions"
            subtitle="Strategic choices awaiting founder confirmation"
            action={
                <Link href="/decisions" className="text-xs text-[#2D7FE0] hover:underline font-bold flex items-center gap-1">
                    Decision Log <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            }
        >
            <div className="space-y-3">
                {list.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#999CA5]">
                        No decisions awaiting confirmation.
                    </div>
                ) : (
                    list.map((d) => (
                        <div
                            key={d.id}
                            className="p-3.5 rounded-2xl bg-[#161B26] border border-white/5 hover:border-[#2D7FE0]/50 transition-all flex items-start justify-between gap-3 group"
                        >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <Scale className="w-4 h-4 text-[#2D7FE0] shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-white group-hover:text-[#2D7FE0] transition-colors truncate">
                                        {d.title}
                                    </h4>
                                    <p className="text-[11px] text-[#999CA5]">{d.impactArea || "Strategic Impact"}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ExecutiveCard>
    );
}
