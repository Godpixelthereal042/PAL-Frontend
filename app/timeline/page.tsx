"use client";

import React, { useState } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import TimelineFeed, { TimelineFeedItem } from "@/components/executive/TimelineFeed";
import { History } from "lucide-react";

export default function TimelinePage() {
    const [searchOpen, setSearchOpen] = useState(false);

    const [timelineItems] = useState<TimelineFeedItem[]>(() => {
        const now = Date.now();
        return [
            {
                id: "t1",
                type: "relationship",
                title: "Logged quarterly sync call with Sarah Jenkins (Investor)",
                timestamp: now - 3600 * 1000 * 2,
                details: "Discussed Q3 growth trajectory and Series A term sheet schedule.",
            },
            {
                id: "t2",
                type: "workflow",
                title: "Workflow 'Follow-up Meeting' executed automatically",
                timestamp: now - 3600 * 1000 * 5,
                details: "Generated follow-up tasks and notification reminders.",
            },
            {
                id: "t3",
                type: "decision",
                title: "Confirmed Decision: Upgrade Enterprise Tier Pricing ($499/mo)",
                timestamp: now - 3600 * 1000 * 24,
                details: "Rationale: Enhances gross margins and captures enterprise value.",
            },
            {
                id: "t4",
                type: "meeting",
                title: "Executive Alignment Meeting with Engineering Team",
                timestamp: now - 3600 * 1000 * 48,
                details: "Approved API authentication architecture upgrade.",
            },
        ];
    });

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                                <History className="w-7 h-7 text-blue-400" /> Executive Activity Feed
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                Unified chronological audit log of all business meetings, decisions, workflows, tasks, and stakeholder interactions.
                            </p>
                        </div>
                    </div>

                    <ExecutiveCard title="Chronological Business Activity Feed" subtitle="Real-time organizational audit trail">
                        <div className="pt-4">
                            <TimelineFeed items={timelineItems} />
                        </div>
                    </ExecutiveCard>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
