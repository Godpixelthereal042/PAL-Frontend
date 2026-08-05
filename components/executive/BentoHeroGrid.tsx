"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Clock, ArrowRight, Play } from "lucide-react";

export function BentoHeroGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Green Date & Today's Schedule Overview */}
            <div className="bg-[#EDFCF2] border border-[#C6F0D5] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#16a34a]">Jan 15</h2>
                        <p className="text-xs font-semibold text-[#16a34a]/80 mt-0.5">Thursday</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/80 text-[#16a34a] text-xs font-bold border border-[#C6F0D5]">
                        Today
                    </span>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="p-3 rounded-2xl bg-white/90 border border-[#C6F0D5]/70 flex items-center justify-between text-xs shadow-sm">
                        <div>
                            <p className="font-bold text-[#1A1D26]">Series A Investor Alignment</p>
                            <p className="text-[11px] text-[#7C8494]">09:15 – 11:45 AM</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    </div>

                    <div className="p-3 rounded-2xl bg-white/90 border border-[#C6F0D5]/70 flex items-center justify-between text-xs shadow-sm">
                        <div>
                            <p className="font-bold text-[#1A1D26]">Digital Product Launch Review</p>
                            <p className="text-[11px] text-[#7C8494]">12:45 – 03:00 PM</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#3B7BF6]" />
                    </div>
                </div>
            </div>

            {/* Right Column: Pink Instant AI Chat + Blue Metric Gauge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pink Card: Instant AI COO Chat */}
                <div className="bg-[#FDF2F7] border border-[#F9D5E5] rounded-3xl p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#F9D5E5] flex items-center justify-center text-[#EC4899] shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                    </div>

                    <div>
                        <h4 className="text-base font-extrabold text-[#1A1D26] leading-tight">
                            Let&apos;s talk right now!
                        </h4>
                        <p className="text-xs text-[#7C8494] mt-1">PAL AI COO is online</p>
                    </div>

                    <Link
                        href="/chat"
                        className="w-full py-2.5 bg-[#1A1D26] hover:bg-black text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>Start chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Blue Card: Executive Time / Activity Gauge */}
                <div className="bg-[#EFF5FF] border border-[#C8DEFF] rounded-3xl p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4 relative overflow-hidden">
                    <div className="space-y-1">
                        <span className="text-3xl font-black text-[#1A1D26]">21:30</span>
                        <p className="text-xs font-semibold text-[#5A6070]">Hours logged this week</p>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div className="flex justify-end pt-2">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-[#C8DEFF]"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-[#3B7BF6]"
                                    strokeDasharray="75, 100"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <Clock className="w-5 h-5 text-[#3B7BF6] absolute" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
