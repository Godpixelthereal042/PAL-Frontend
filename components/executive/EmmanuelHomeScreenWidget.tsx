"use client";

import React, { useState } from "react";
import {
    Zap,
    Camera,
    Bell,
    Plus,
    FileText,
    Wallet,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Crown,
    Mail,
    MessageSquare,
    FileSpreadsheet,
    Folder,
    Share2,
    Globe
} from "lucide-react";
import Link from "next/link";

export function EmmanuelHomeScreenWidget({ onOpenSearch }: { onOpenSearch: () => void }) {
    const [selectedDay, setSelectedDay] = useState(16);
    const [selectedTime, setSelectedTime] = useState("18:00");

    const days = [
        [30, 31, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12],
        [12, 13, 14, 15, 16, 17, 18],
        [19, 20, 21, 22, 23, 24, 25],
        [26, 27, 28, 29, 30, 1, 2],
    ];

    const times = ["17:30", "17:45", "18:00", "18:15", "18:30", "18:45"];

    return (
        <div className="space-y-6">
            {/* Top Bar: Lightning logo button, Camera, Bell, Avatar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onOpenSearch}
                    className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#2D7FE0] shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 group"
                    title="Search & Quick Actions"
                >
                    <Zap className="w-5 h-5 fill-[#2D7FE0] group-hover:drop-shadow-[0_0_8px_rgba(45,127,224,0.8)] transition-all" />
                </button>

                <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#999CA5] hover:text-white hover:border-white/20 cursor-pointer transition-all duration-200">
                        <Camera className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#999CA5] hover:text-white hover:border-white/20 cursor-pointer transition-all duration-200 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#EF4444]" />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2D7FE0] to-[#72D3EC] p-0.5 shadow-md cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-[#121620] flex items-center justify-center text-[#72D3EC]">
                            <Crown className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Greeting */}
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Welcome back Emmanuel</span>
                    <Zap className="w-7 h-7 text-[#2D7FE0] fill-[#2D7FE0] inline-block" />
                </h1>
            </div>

            {/* Action Row: Add Schedules + Integration Badges */}
            <div className="flex items-center gap-3 flex-wrap">
                <Link
                    href="/calendar"
                    className="px-6 py-3 rounded-full bg-[#2D7FE0] hover:bg-[#2563EB] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <span>Add Schedules</span>
                    <Plus className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#161B26] border border-white/10 flex items-center justify-center text-[#2D7FE0] shadow-sm" title="Gmail Connected">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#161B26] border border-white/10 flex items-center justify-center text-[#2D7FE0] shadow-sm" title="Slack Connected">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <Link
                        href="/connect"
                        className="w-10 h-10 rounded-full bg-[#2D7FE0]/20 border border-[#2D7FE0]/40 flex items-center justify-center text-[#2D7FE0] hover:bg-[#2D7FE0] hover:text-white transition-colors cursor-pointer"
                        title="Add Integration"
                    >
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Emmanuel's Calendar & Time Picker Card */}
            <div className="bg-[#121620] border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Calendar (2 Columns) */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <button className="p-1.5 rounded-lg text-[#999CA5] hover:text-white hover:bg-[#161B26] cursor-pointer transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-white tracking-wide">November 2024</span>
                            <button className="p-1.5 rounded-lg text-[#999CA5] hover:text-white hover:bg-[#161B26] cursor-pointer transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#999CA5]">
                            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>

                        {/* Month Grid */}
                        <div className="space-y-1">
                            {days.map((week, wIdx) => (
                                <div key={wIdx} className="grid grid-cols-7 gap-1 text-center text-xs">
                                    {week.map((d, dIdx) => {
                                        const isSelected = d === selectedDay;
                                        return (
                                            <button
                                                key={dIdx}
                                                onClick={() => setSelectedDay(d)}
                                                className={`py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-[#2D7FE0] text-white font-bold shadow-lg shadow-blue-500/30 scale-105"
                                                        : "text-slate-300 hover:bg-[#161B26] hover:text-white"
                                                }`}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Column (1 Column) */}
                    <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#999CA5] block text-center md:text-left">
                            Time
                        </span>
                        <div className="space-y-2">
                            {times.map((t) => {
                                const isSelected = t === selectedTime;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTime(t)}
                                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                            isSelected
                                                ? "bg-[#2D7FE0] text-white shadow-md shadow-blue-500/30 scale-102"
                                                : "bg-[#161B26] text-[#999CA5] hover:text-white hover:bg-[#1E2636]"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Connect Data Section (Lucide SVGs replaces raw text emojis) */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-white tracking-tight">Connect Data</h3>
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                    <div className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#2D7FE0] shrink-0 cursor-pointer hover:border-white/20 transition-colors" title="Excel & Spreadsheets">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#2D7FE0] shrink-0 cursor-pointer hover:border-white/20 transition-colors" title="Google Drive">
                        <Folder className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#2D7FE0] shrink-0 cursor-pointer hover:border-white/20 transition-colors" title="X / Social Media">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center text-[#2D7FE0] shrink-0 cursor-pointer hover:border-white/20 transition-colors" title="Web Data & Integrations">
                        <Globe className="w-5 h-5" />
                    </div>
                    <Link
                        href="/connect"
                        className="w-12 h-12 rounded-full bg-[#2D7FE0]/20 border border-[#2D7FE0]/40 flex items-center justify-center text-[#2D7FE0] hover:bg-[#2D7FE0] hover:text-white transition-colors shrink-0 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Quick Action Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/briefing" className="p-4 rounded-3xl bg-[#121620] border border-white/10 hover:border-[#2D7FE0]/50 transition-all duration-200 group flex flex-col justify-between h-28 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm group-hover:text-[#2D7FE0] transition-colors">Quick Invoice</span>
                        <FileText className="w-5 h-5 text-[#2D7FE0]" />
                    </div>
                    <p className="text-xs text-[#999CA5]">Generate & send invoice</p>
                </Link>

                <Link href="/timeline" className="p-4 rounded-3xl bg-[#121620] border border-white/10 hover:border-[#2D7FE0]/50 transition-all duration-200 group flex flex-col justify-between h-28 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm group-hover:text-[#2D7FE0] transition-colors">Log History</span>
                        <Wallet className="w-5 h-5 text-[#2D7FE0]" />
                    </div>
                    <p className="text-xs text-[#999CA5]">View activity log</p>
                </Link>

                <Link href="/reports" className="p-4 rounded-3xl bg-[#121620] border border-white/10 hover:border-[#2D7FE0]/50 transition-all duration-200 group flex flex-col justify-between h-28 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm group-hover:text-[#2D7FE0] transition-colors">Weekly Data</span>
                        <BarChart3 className="w-5 h-5 text-[#2D7FE0]" />
                    </div>
                    <p className="text-xs text-[#999CA5]">Analyze operational trends</p>
                </Link>
            </div>
        </div>
    );
}
