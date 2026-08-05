"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, FolderKanban, ArrowRight, CheckCircle2 } from "lucide-react";
import { DrawerItem } from "@/components/ui/DetailDrawer";

export function ExecutiveProjectsPanel({ onSelectItem }: { onSelectItem: (item: DrawerItem) => void }) {
    const [activeFilter, setActiveFilter] = useState("High Priority");

    const filters = ["All", "High Priority", "Active", "Completed"];

    const projects = [
        {
            id: "proj_1",
            title: "Series A Deck & Financial Model",
            description: "Designing investor deck, financial projections, and Series A term sheet deck.",
            dueDate: "Feb 15",
            progressPct: 80,
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
            category: "High Priority",
            drawerData: {
                id: "proj_1",
                title: "Series A Deck & Financial Model",
                category: "Investor Relations",
                description: "Complete presentation deck and financial forecasting for upcoming Series A fundraising round.",
                dueDate: "Feb 15, 2026",
                progressPct: 80,
                assignedAgent: "CEO & CFO Agents",
                milestones: [
                    { title: "Market Size & Revenue Traction", done: true },
                    { title: "Financial Model & Projections", done: true },
                    { title: "Term Sheet Sign-off", done: false }
                ]
            }
        },
        {
            id: "proj_2",
            title: "Customer Onboarding & Retention",
            description: "Automated onboarding workflow, email sequences, and workspace activation.",
            dueDate: "Feb 28",
            progressPct: 50,
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
            category: "High Priority",
            drawerData: {
                id: "proj_2",
                title: "Customer Onboarding & Retention Portal",
                category: "Product & Success",
                description: "Streamlined 1-click customer onboarding, founder checklist, and connector setup wizard.",
                dueDate: "Feb 28, 2026",
                progressPct: 50,
                assignedAgent: "COO Agent",
                milestones: [
                    { title: "First User Signup Journey", done: true },
                    { title: "Workspace Setup Gating", done: true },
                    { title: "Usage Analytics Integration", done: false }
                ]
            }
        },
        {
            id: "proj_3",
            title: "Stripe Billing & Subscription Gating",
            description: "Stripe billing webhooks, payment failure handling, and multi-tenant plan enforcement.",
            dueDate: "Mar 10",
            progressPct: 90,
            image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
            category: "High Priority",
            drawerData: {
                id: "proj_3",
                title: "Stripe Billing & Subscription Gating",
                category: "Commercial Infrastructure",
                description: "Commercial billing engine supporting automated webhooks, invoice reminders, and tier limits.",
                dueDate: "Mar 10, 2026",
                progressPct: 90,
                assignedAgent: "CFO Agent",
                milestones: [
                    { title: "Stripe Subscriptions Webhook", done: true },
                    { title: "Tier Limits Enforcement", done: true },
                    { title: "Failed Payment Gating", done: true }
                ]
            }
        },
        {
            id: "proj_4",
            title: "Google & Slack SaaS Connectors",
            description: "Production connector hub for Gmail, Google Calendar, Slack events, and GitHub.",
            dueDate: "Mar 20",
            progressPct: 100,
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
            category: "Completed",
            drawerData: {
                id: "proj_4",
                title: "Google & Slack SaaS Connectors",
                category: "Integrations & APIs",
                description: "Live connector hub running OAuth token refresh, data normalization, and failure retries.",
                dueDate: "Completed",
                progressPct: 100,
                assignedAgent: "CTO Agent",
                milestones: [
                    { title: "Gmail & Calendar Sync", done: true },
                    { title: "Slack Workspace OAuth", done: true },
                    { title: "GitHub Event Watcher", done: true }
                ]
            }
        }
    ];

    const filteredProjects = activeFilter === "All"
        ? projects
        : projects.filter(p => p.category === activeFilter);

    const displayList = filteredProjects.length > 0 ? filteredProjects : projects;

    return (
        <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col h-full">
            {/* Top Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Active Projects & Workflows</h3>
                    <p className="text-xs text-[#999CA5] mt-0.5">Click any project card to inspect milestones & AI status</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#0F131C] rounded-2xl border border-white/10 self-start sm:self-auto">
                    {filters.map((f) => {
                        const isSelected = activeFilter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isSelected
                                        ? "bg-[#2D7FE0] text-white shadow-md shadow-blue-500/30 scale-105"
                                        : "text-[#999CA5] hover:text-white"
                                }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2x2 Grid of Rich Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {displayList.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => onSelectItem(p.drawerData)}
                        className="bg-[#161B26] border border-white/5 hover:border-[#2D7FE0]/60 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] shadow-lg cursor-pointer"
                    >
                        {/* Top Image Banner */}
                        <div className="relative h-40 w-full overflow-hidden">
                            <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#161B26] via-transparent to-black/40" />

                            {/* Due Date Tag */}
                            <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                                <Calendar className="w-3.5 h-3.5 text-[#2D7FE0]" />
                                <span>Due date: {p.dueDate}</span>
                            </div>
                        </div>

                        {/* Card Content & Progress Bar */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                            {/* Progress Line */}
                            <div className="space-y-1.5">
                                <div className="w-full bg-[#0F131C] h-2 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        style={{ width: `${p.progressPct}%` }}
                                        className="bg-gradient-to-r from-[#2D7FE0] to-[#3B82F6] h-full rounded-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-[#999CA5]">
                                    <span>{p.category}</span>
                                    <span className="text-[#2D7FE0]">{p.progressPct}%</span>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-extrabold text-white group-hover:text-[#2D7FE0] transition-colors leading-snug">
                                    {p.title}
                                </h4>
                                <p className="text-xs text-[#999CA5] line-clamp-2 leading-relaxed">
                                    {p.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
