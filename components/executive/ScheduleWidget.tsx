"use client";

import React from "react";
import ExecutiveCard from "./ExecutiveCard";
import { Clock, GitBranch } from "lucide-react";
import Link from "next/link";

interface ScheduleItem {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    workflowTriggered?: boolean;
}

export default function ScheduleWidget({ items }: { items?: ScheduleItem[] }) {
    const list: ScheduleItem[] = items || [
        {
            id: "s1",
            title: "Executive Weekly Alignment Call",
            startsAt: "10:00 AM",
            endsAt: "11:00 AM",
            workflowTriggered: true,
        },
        {
            id: "s2",
            title: "Product Roadmap Sync with Engineering",
            startsAt: "02:00 PM",
            endsAt: "03:00 PM",
        },
        {
            id: "s3",
            title: "Investor Update Call — Sarah Jenkins",
            startsAt: "04:30 PM",
            endsAt: "05:00 PM",
            workflowTriggered: true,
        },
    ];

    return (
        <ExecutiveCard
            title="Today's Schedule"
            subtitle="Meetings & automated workflow triggers"
            tint="cream"
            action={
                <Link href="/calendar" className="text-xs text-[#F59E0B] hover:underline font-semibold">
                    Full Calendar
                </Link>
            }
        >
            <div className="space-y-2.5">
                {list.map((item) => (
                    <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-white/70 border border-[#F5E6CF]/50 hover:border-[#F5E6CF] transition-all flex items-center justify-between gap-3 text-xs"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#FFF9F0] text-[#F59E0B] border border-[#F5E6CF] flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-semibold text-[#1A1D26] truncate">{item.title}</h4>
                                <p className="text-[#7C8494]">
                                    {item.startsAt} – {item.endsAt}
                                </p>
                            </div>
                        </div>

                        {item.workflowTriggered && (
                            <span
                                className="px-2 py-0.5 rounded-full bg-[#F4F0FF] text-[#6C5CE7] border border-[#DDD0FD] text-[10px] font-semibold flex items-center gap-1 shrink-0"
                                title="Triggers post-meeting workflow"
                            >
                                <GitBranch className="w-3 h-3" /> Auto Workflow
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </ExecutiveCard>
    );
}
