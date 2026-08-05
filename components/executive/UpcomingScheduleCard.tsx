"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function UpcomingScheduleCard() {
    const [selectedDay, setSelectedDay] = useState("27");

    const datePills = [
        { label: "MON", date: "24" },
        { label: "TUE", date: "25" },
        { label: "WED", date: "26" },
        { label: "THU", date: "27" },
        { label: "FRI", date: "28" },
        { label: "SAT", date: "29" },
        { label: "SUN", date: "30" },
    ];

    const scheduleRows = [
        {
            id: 1,
            title: "User Research & Series A Pitch Deck",
            category: "Mandatory",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            name: "Emma Carter",
            time: "11:30 AM",
            duration: "15 min"
        },
        {
            id: 2,
            title: "Design Systems & API Auth Practice",
            category: "Recommended",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            name: "Daniel Kim",
            time: "10:30 AM",
            duration: "20 min"
        },
        {
            id: 3,
            title: "Product Thinking & Executive Review",
            category: "Completed",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            name: "Lucas Moreau",
            time: "10:00 AM",
            duration: "17 min"
        },
        {
            id: 4,
            title: "Designing for Accessibility & Security",
            category: "Completed",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            name: "Sofia Martinez",
            time: "9:00 AM",
            duration: "17 min"
        }
    ];

    return (
        <div className="bg-[#1B1C24] border border-[#272835] rounded-3xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Upcoming Schedule</h3>
                <Link
                    href="/calendar"
                    className="text-xs font-bold text-[#9CA3AF] hover:text-white flex items-center gap-1 transition-colors"
                >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Horizontal Date Pill Strip */}
            <div className="flex items-center justify-between gap-2">
                {datePills.map((d) => {
                    const isSelected = selectedDay === d.date;
                    return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#7C8494]">{d.label}</span>
                            <button
                                onClick={() => setSelectedDay(d.date)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                    isSelected
                                        ? "bg-[#FEF08A] text-[#121319] shadow-md scale-105"
                                        : "bg-[#252632] text-[#9CA3AF] hover:text-white"
                                }`}
                            >
                                {d.date}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Schedule Activity List */}
            <div className="space-y-3 pt-2">
                {scheduleRows.map((row) => (
                    <div
                        key={row.id}
                        className="p-3.5 rounded-2xl bg-[#252632] border border-[#2F303F] hover:border-[#3B82F6]/40 transition-all flex items-center justify-between gap-4 group"
                    >
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white group-hover:text-[#3B82F6] transition-colors truncate">
                                {row.title}
                            </h4>
                            <span className="text-[10px] font-medium text-[#7C8494] block">{row.category}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <img
                                    src={row.avatar}
                                    alt={row.name}
                                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                                />
                                <span className="text-[11px] font-semibold text-[#D1D5DB] hidden sm:inline">
                                    {row.name}
                                </span>
                            </div>

                            <div className="text-right">
                                <span className="text-xs font-bold text-white block">{row.time}</span>
                                <span className="text-[10px] text-[#7C8494]">{row.duration}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
