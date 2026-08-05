"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Video, CheckCircle2 } from "lucide-react";
import { DrawerItem } from "@/components/ui/DetailDrawer";

export function InteractiveScheduleCard({ onSelectItem }: { onSelectItem: (item: DrawerItem) => void }) {
    const [selectedDate, setSelectedDate] = useState("27");

    const datePills = [
        { label: "MON", date: "24" },
        { label: "TUE", date: "25" },
        { label: "WED", date: "26" },
        { label: "THU", date: "27" },
        { label: "FRI", date: "28" },
        { label: "SAT", date: "29" },
        { label: "SUN", date: "30" },
    ];

    const scheduleRows: Record<string, Array<{
        id: string;
        title: string;
        category: string;
        name: string;
        time: string;
        duration: string;
        drawerData: DrawerItem;
    }>> = {
        "27": [
            {
                id: "sch_1",
                title: "Series A Term Sheet Deck & Financial Model Review",
                category: "Mandatory",
                name: "Sarah Jenkins (Lead Investor)",
                time: "11:30 AM",
                duration: "45 min",
                drawerData: {
                    id: "sch_1",
                    title: "Series A Term Sheet Deck & Financial Model Review",
                    category: "Investor Relations",
                    description: "High-stakes investor alignment call to discuss Series A deck revisions, financial forecast, and governance terms.",
                    dueDate: "Jan 27 • 11:30 AM",
                    progressPct: 85,
                    assignedAgent: "CEO Agent",
                    milestones: [
                        { title: "Financial Model Finalized", done: true },
                        { title: "Deck Revisions Approved", done: true },
                        { title: "Term Sheet Sign-off", done: false }
                    ]
                }
            },
            {
                id: "sch_2",
                title: "API Authentication & Multi-Tenant Security Audit",
                category: "Recommended",
                name: "Engineering Team",
                time: "02:00 PM",
                duration: "30 min",
                drawerData: {
                    id: "sch_2",
                    title: "API Authentication & Multi-Tenant Security Audit",
                    category: "Engineering & Security",
                    description: "Production audit verifying Argon2id password hashing, CSRF headers, and workspace database isolation.",
                    dueDate: "Jan 27 • 02:00 PM",
                    progressPct: 100,
                    assignedAgent: "CTO Agent",
                    milestones: [
                        { title: "Argon2id Hashing Deployed", done: true },
                        { title: "Workspace DB Isolation Verified", done: true },
                        { title: "Security Audit Gating", done: true }
                    ]
                }
            },
            {
                id: "sch_3",
                title: "Client Check-in & Q3 Invoice Reminders",
                category: "Completed",
                name: "Finance & Accounts",
                time: "04:30 PM",
                duration: "20 min",
                drawerData: {
                    id: "sch_3",
                    title: "Client Check-in & Q3 Invoice Reminders",
                    category: "Finance & Collections",
                    description: "Follow-up outreach for $14,500 outstanding client invoices past due date.",
                    dueDate: "Jan 27 • 04:30 PM",
                    progressPct: 90,
                    assignedAgent: "CFO Agent",
                    milestones: [
                        { title: "Invoice Notifications Sent", done: true },
                        { title: "Stripe Webhook Verified", done: true }
                    ]
                }
            }
        ],
        "28": [
            {
                id: "sch_4",
                title: "Customer Onboarding Portal Roadmap Sync",
                category: "Mandatory",
                name: "Product & Design",
                time: "10:00 AM",
                duration: "60 min",
                drawerData: {
                    id: "sch_4",
                    title: "Customer Onboarding Portal Roadmap Sync",
                    category: "Product & UX",
                    description: "Quarterly review of customer onboarding experience, active projects, and workspace setup flow.",
                    dueDate: "Jan 28 • 10:00 AM",
                    progressPct: 50,
                    assignedAgent: "COO Agent",
                }
            }
        ]
    };

    const currentRows = scheduleRows[selectedDate] || scheduleRows["27"];

    return (
        <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">Executive Schedule & Triggers</h3>
                    <p className="text-xs text-[#999CA5] mt-0.5">Filter date to inspect upcoming AI triggers</p>
                </div>
                <Link
                    href="/calendar"
                    className="text-xs font-bold text-[#2D7FE0] hover:underline flex items-center gap-1"
                >
                    <span>View Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Horizontal Date Pill Strip */}
            <div className="flex items-center justify-between gap-2">
                {datePills.map((d) => {
                    const isSelected = selectedDate === d.date;
                    return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#999CA5]">{d.label}</span>
                            <button
                                onClick={() => setSelectedDate(d.date)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                    isSelected
                                        ? "bg-[#2D7FE0] text-white shadow-lg shadow-blue-500/30 scale-105"
                                        : "bg-[#161B26] text-[#999CA5] hover:text-white hover:bg-[#1E2636]"
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
                {currentRows.map((row) => (
                    <div
                        key={row.id}
                        onClick={() => onSelectItem(row.drawerData)}
                        className="p-4 rounded-2xl bg-[#161B26] border border-white/5 hover:border-[#2D7FE0]/50 transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-md"
                    >
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#2D7FE0]/15 text-[#2D7FE0]">
                                    {row.category}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#2D7FE0] transition-colors truncate pt-0.5">
                                {row.title}
                            </h4>
                            <p className="text-xs text-[#999CA5] truncate">{row.name}</p>
                        </div>

                        <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-white block">{row.time}</span>
                            <span className="text-[10px] text-[#999CA5]">{row.duration}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
