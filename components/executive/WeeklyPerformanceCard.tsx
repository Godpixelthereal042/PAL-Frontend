"use client";

import React from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { DrawerItem } from "@/components/ui/DetailDrawer";

export function WeeklyPerformanceCard({ onSelectItem }: { onSelectItem: (item: DrawerItem) => void }) {
    const weeklyData = [
        { day: "MON", height: "55%", label: "$1.2k" },
        { day: "TUE", height: "70%", label: "$2.4k" },
        { day: "WED", height: "85%", label: "$3.1k" },
        { day: "THU", height: "60%", label: "$2.0k" },
        { day: "FRI", height: "45%", label: "$1.5k" },
        { day: "SAT", height: "78%", label: "$2.8k" },
        { day: "SUN", height: "95%", label: "$4.5k" },
    ];

    const tiles: Array<{
        title: string;
        value: string;
        subtitle: string;
        bg: string;
        text: string;
        drawerData: DrawerItem;
    }> = [
        {
            title: "8",
            value: "8",
            subtitle: "Autonomous Actions",
            bg: "bg-[#2D7FE0]",
            text: "text-white",
            drawerData: {
                id: "m_actions",
                title: "8 Autonomous Worker Actions Executed",
                category: "AI Agent Operations",
                description: "AI Worker agents executed 8 high-impact automated workflows this week, including invoice collection, calendar sync, and risk simulation.",
                dueDate: "This Week",
                progressPct: 100,
                assignedAgent: "Executive Team",
            }
        },
        {
            title: "5",
            value: "5",
            subtitle: "Active Projects",
            bg: "bg-[#161B26]",
            text: "text-white",
            drawerData: {
                id: "m_projects",
                title: "5 Active Company Projects",
                category: "Project Portfolio",
                description: "5 active strategic initiatives currently running in PAL, including Series A Deck, Customer Onboarding Portal, and API Auth Upgrade.",
                dueDate: "Q1 2026",
                progressPct: 75,
                assignedAgent: "Product COO",
            }
        },
        {
            title: "3",
            value: "3",
            subtitle: "Pending Approvals",
            bg: "bg-[#161B26]",
            text: "text-white",
            drawerData: {
                id: "m_approvals",
                title: "3 Pending Founder Approvals",
                category: "Governance Gate",
                description: "3 high-spend proposals requiring human sign-off before worker execution ($5,000 sales campaign, $2,500 cloud infra).",
                dueDate: "Immediate",
                progressPct: 30,
                assignedAgent: "CFO Agent",
            }
        },
        {
            title: "82%",
            value: "82%",
            subtitle: "Business Health",
            bg: "bg-[#161B26]",
            text: "text-white",
            drawerData: {
                id: "m_health",
                title: "82% Composite Business Health Score",
                category: "Executive Operating Score",
                description: "Calculated based on cash flow collections (+5), active project milestones (+10), and pending investor follow-ups (-4).",
                dueDate: "Live Metric",
                progressPct: 82,
                assignedAgent: "Business Brain",
            }
        }
    ];

    return (
        <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                        <span>Weekly Performance & Growth</span>
                    </h3>
                    <p className="text-xs text-[#999CA5] mt-0.5">Real-time business activity & revenue pipeline</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#22C55E]/15 text-[#22C55E] text-xs font-bold rounded-full border border-[#22C55E]/30 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +14.2% MRR
                    </span>
                    <button className="p-2 rounded-xl bg-[#161B26] text-[#999CA5] hover:text-white border border-white/5 transition-colors">
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 7-Day Bar Chart */}
            <div className="h-28 flex items-end justify-between gap-3 px-2 pt-2">
                {weeklyData.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full bg-[#0F131C] rounded-xl h-full flex items-end p-1 border border-white/5">
                            <div
                                style={{ height: bar.height }}
                                className={`w-full rounded-lg transition-all duration-300 group-hover:opacity-90 ${
                                    bar.day === "SUN" ? "bg-[#2D7FE0]" : "bg-white/70"
                                }`}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-[#999CA5]">{bar.day}</span>
                    </div>
                ))}
            </div>

            {/* 4 Metric Tiles Row (Clickable for Detail Drawer) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {tiles.map((tile, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectItem(tile.drawerData)}
                        className={`${tile.bg} ${tile.text} rounded-2xl p-4 flex flex-col justify-between shadow-lg text-left hover:scale-[1.03] transition-all cursor-pointer border border-white/10`}
                    >
                        <span className="text-3xl font-black">{tile.value}</span>
                        <span className="text-xs font-bold leading-tight mt-3 opacity-90">{tile.subtitle}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
