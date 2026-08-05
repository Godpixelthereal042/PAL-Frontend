"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

export function ActiveProjectsGrid() {
    const [activeFilter, setActiveFilter] = useState("Mandatory");

    const filters = ["All", "Mandatory", "Completed", "Recommended"];

    const projects = [
        {
            id: 1,
            title: "Designing Scalable Interfaces",
            description: "Core UI patterns, scalable components, and layout consistency.",
            dueDate: "Mar 25",
            progressPct: 80,
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
            category: "Mandatory"
        },
        {
            id: 2,
            title: "Product Metrics & Analytics",
            description: "Key product metrics, dashboards, and data-driven decisions.",
            dueDate: "May 2",
            progressPct: 50,
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
            category: "Mandatory"
        },
        {
            id: 3,
            title: "Mobile-First Design Approach",
            description: "Fast ideation methods, wireframes, and early-stage concepts.",
            dueDate: "May 20",
            progressPct: 65,
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80",
            category: "Mandatory"
        },
        {
            id: 4,
            title: "Cross-Platform UX Design",
            description: "Cross-device design, responsive systems, and adaptive layout strategies.",
            dueDate: "Apr 15",
            progressPct: 45,
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
            category: "Mandatory"
        }
    ];

    return (
        <div className="bg-[#1B1C24] border border-[#272835] rounded-3xl p-6 shadow-xl space-y-6 flex flex-col h-full">
            {/* Top Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Active Projects & Workflows</h3>

                <div className="flex items-center gap-1.5 p-1 bg-[#121319] rounded-2xl border border-[#272835] self-start sm:self-auto">
                    {filters.map((f) => {
                        const isSelected = activeFilter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isSelected
                                        ? "bg-[#FEF08A] text-[#121319] shadow-sm scale-105"
                                        : "text-[#7C8494] hover:text-white"
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
                {projects.map((p) => (
                    <Link
                        key={p.id}
                        href="/projects"
                        className="bg-[#252632] border border-[#2F303F] hover:border-[#3B82F6]/60 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] shadow-md"
                    >
                        {/* Top Image Preview Banner */}
                        <div className="relative h-44 w-full overflow-hidden">
                            <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#252632] via-transparent to-black/30" />

                            {/* Due Date Tag */}
                            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Due date: {p.dueDate}</span>
                            </div>
                        </div>

                        {/* Card Content & Progress Bar */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                            {/* Progress Line */}
                            <div className="space-y-1.5">
                                <div className="w-full bg-[#121319] h-1.5 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${p.progressPct}%` }}
                                        className="bg-[#3B82F6] h-full rounded-full"
                                    />
                                </div>
                                <div className="text-right text-[10px] font-bold text-[#7C8494]">
                                    {p.progressPct}%
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-1">
                                <h4 className="text-base font-extrabold text-white group-hover:text-[#3B82F6] transition-colors leading-snug">
                                    {p.title}
                                </h4>
                                <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                                    {p.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
