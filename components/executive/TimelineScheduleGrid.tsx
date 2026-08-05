"use client";

import React from "react";
import { Video, Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function TimelineScheduleGrid() {
    const hours = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM"];

    return (
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-[#1A1D26] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#3B7BF6]" />
                        <span>Daily Executive Schedule</span>
                    </h3>
                    <p className="text-xs text-[#7C8494] mt-0.5">Timeline overview for Thursday, Jan 15</p>
                </div>
                <Link
                    href="/calendar"
                    className="text-xs font-semibold text-[#3B7BF6] hover:underline flex items-center gap-1"
                >
                    <span>Full Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Timeline Layout */}
            <div className="relative pt-2 space-y-8">
                {hours.map((hour) => (
                    <div key={hour} className="flex items-center gap-4 group">
                        <span className="text-xs font-bold text-[#9CA3AF] w-12 text-right shrink-0">{hour}</span>
                        <div className="flex-1 h-px bg-[#EEF0F4] group-hover:bg-[#C8DEFF] transition-colors" />
                    </div>
                ))}

                {/* Event Card 1: 09:15 - 11:45 AM (Soft Pink Tint) */}
                <div className="absolute top-[28px] left-16 right-0 p-4 rounded-2xl bg-[#FDF2F7] border border-[#F9D5E5] shadow-sm flex flex-col justify-between gap-3 transition-transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#EC4899] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#F9D5E5]">
                            09:15 – 11:45 AM
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-[#EC4899] text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#db2777]">
                            <Video className="w-4 h-4" />
                        </div>
                    </div>
                    <h4 className="text-base font-bold text-[#1A1D26]">Intro to Front-End Development & Series A Pitch Deck</h4>
                    <div className="flex items-center -space-x-2 pt-1">
                        <div className="w-6 h-6 rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">S</div>
                        <div className="w-6 h-6 rounded-full bg-[#3B7BF6] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">M</div>
                        <span className="text-[10px] font-bold text-[#7C8494] pl-3">+4 team</span>
                    </div>
                </div>

                {/* Event Card 2: 12:45 - 03:00 PM (Soft Blue Tint) */}
                <div className="absolute top-[180px] left-16 right-0 p-4 rounded-2xl bg-[#EFF5FF] border border-[#C8DEFF] border-l-4 border-l-[#3B7BF6] shadow-sm flex flex-col justify-between gap-3 transition-transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#3B7BF6] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#C8DEFF]">
                            12:45 – 03:00 PM
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-[#3B7BF6] text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#2563eb]">
                            <Video className="w-4 h-4" />
                        </div>
                    </div>
                    <h4 className="text-base font-bold text-[#1A1D26]">Startup & Product Development Alignment</h4>
                    <div className="flex items-center -space-x-2 pt-1">
                        <div className="w-6 h-6 rounded-full bg-[#3B7BF6] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">K</div>
                        <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">Y</div>
                        <span className="text-[10px] font-bold text-[#7C8494] pl-3">+3 team</span>
                    </div>
                </div>

                {/* Event Card 3: 04:30 - 07:00 PM (Soft Mint Tint) */}
                <div className="absolute top-[340px] left-16 right-0 p-4 rounded-2xl bg-[#EDFCF2] border border-[#C6F0D5] shadow-sm flex flex-col justify-between gap-3 transition-transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#16a34a] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#C6F0D5]">
                            04:30 – 07:00 PM
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-[#22c55e] text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#16a34a]">
                            <Video className="w-4 h-4" />
                        </div>
                    </div>
                    <h4 className="text-base font-bold text-[#1A1D26]">Digital Product Creation & Executive Review</h4>
                    <div className="flex items-center -space-x-2 pt-1">
                        <div className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">L</div>
                        <span className="text-[10px] font-bold text-[#7C8494] pl-3">+2 team</span>
                    </div>
                </div>
            </div>
            <div className="h-44" /> {/* Spacer for absolute cards */}
        </div>
    );
}
