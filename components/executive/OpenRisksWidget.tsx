"use client";

import React from "react";
import ExecutiveCard from "./ExecutiveCard";
import StatusBadge from "./StatusBadge";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RiskItem {
    id: string;
    title: string;
    severity: "critical" | "high" | "medium";
    impact: string;
}

export default function OpenRisksWidget({ risks }: { risks?: RiskItem[] }) {
    const list: RiskItem[] = risks || [
        {
            id: "r1",
            title: "2 Overdue Invoices ($14,500 Total)",
            severity: "critical",
            impact: "Delays cash flow collection for Q3 payroll",
        },
        {
            id: "r2",
            title: "Investor Follow-up Overdue (Sarah Jenkins)",
            severity: "high",
            impact: "Threatens relationship trust & Series A timeline",
        },
        {
            id: "r3",
            title: "Project Deadline Missed: API Auth Update",
            severity: "medium",
            impact: "Blocks dependent developer workflow tasks",
        },
    ];

    return (
        <ExecutiveCard
            title="Open Risks & Critical Items"
            subtitle="Immediate operational & strategic threats"
            action={
                <Link href="/notifications" className="text-xs text-rose-400 hover:underline font-bold">
                    Review All
                </Link>
            }
        >
            <div className="space-y-2.5">
                {list.map((item) => (
                    <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#161B26] border border-white/5 hover:border-rose-500/40 transition-all flex items-start justify-between gap-3 group"
                    >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <AlertTriangle
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                    item.severity === "critical"
                                        ? "text-[#EF4444]"
                                        : item.severity === "high"
                                        ? "text-[#F59E0B]"
                                        : "text-[#3B82F6]"
                                }`}
                            />
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                                    {item.title}
                                </h4>
                                <p className="text-[11px] text-[#999CA5] mt-0.5 truncate">{item.impact}</p>
                            </div>
                        </div>

                        <StatusBadge
                            label={item.severity.toUpperCase()}
                            variant={item.severity === "critical" ? "critical" : item.severity === "high" ? "warning" : "info"}
                        />
                    </div>
                ))}
            </div>
        </ExecutiveCard>
    );
}
