"use client";

import React, { useState } from "react";
import { 
    ArrowLeft, Calendar, User, CheckCircle2, 
    MoreHorizontal, Clock, FileText, CheckSquare, 
    AlertTriangle, Sparkles, MessageSquare, Play,
    Plus, Bell, Download, Upload
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { palBrain } from "@/lib/brain/palBrain";

interface ProjectDetailsScreenProps {
    id: string;
}

export default function ProjectDetailsScreen({ id }: ProjectDetailsScreenProps) {
    const router = useRouter();

    React.useEffect(() => {
        palBrain.setActiveProject(id);
    }, [id]);
    
    // Mock Data for Simplified Executive Briefing
    const [project] = useState({
        id: id,
        title: "The Base App",
        description: "AI-powered mobile application built for Base users to onboard, save, and manage digital assets.",
        dueDate: "06/05/2026",
        status: "In Progress",
        owner: "Emmanuel",
        color: "#2D7FE0" // User-selected project color (Blue)
    });

    const metrics = {
        tasks: { completed: 24, total: 32 },
        completion: 75
    };

    const members = [
        { id: "1", name: "Emmanuel", avatar: "/assets/avatar_user.png" },
        { id: "2", name: "Sarah", avatar: "/assets/avatar_member_1.png" },
        { id: "3", name: "Mike", avatar: "/assets/avatar_member_2.png" }
    ];

    const activities = [
        { id: 1, text: "Sarah updated Figma mockups", time: "2h ago", icon: FileText, color: "text-blue-400" },
        { id: 2, text: "Mike completed API integration", time: "5h ago", icon: CheckCircle2, color: "text-green-400" },
        { id: 3, text: "Emmanuel left a comment on Task #42", time: "1d ago", icon: MessageSquare, color: "text-zinc-400" }
    ];

    const documents = [
        { id: 1, title: "Product Requirements", type: "PDF", action: "download" },
        { id: 2, title: "Q3 Pitch Deck", type: "Keynote", action: "download" },
        { id: 3, title: "UI Components", type: "Figma", action: "upload" }
    ];

    const getStatusColor = (status: string) => {
        switch(status) {
            case "In Progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "Completed": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "Review": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
        }
    };

    // Helper to format title lines
    const titleLine1 = "THE BASE";
    const titleLine2 = "APP";

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative overflow-hidden flex flex-col font-outfit">
            
            {/* Minimal Header */}
            <div className="flex justify-between items-center px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-2 shrink-0 z-30 bg-transparent">
                <button
                    onClick={() => router.push("/projects")}
                    className="grid h-10 w-10 place-items-center rounded-full border border-zinc-800 bg-[#121419] text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                    <button className="grid h-10 w-10 place-items-center rounded-full border border-zinc-800 bg-[#121419] text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-sm">
                        <Calendar size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Image src="/assets/avatar_user.png" alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Scrollable Contents with Heavy Whitespace */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6 space-y-12 scrollbar-hide">
                
                {/* Hero Section: Enclosed in big container */}
                <div 
                    className="border border-[#2A2E37] rounded-[32px] p-8 shadow-xl flex flex-col gap-6"
                    style={{ backgroundColor: project.color }}
                >
                    <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85] font-sans">
                        <span className="block">{titleLine1}</span>
                        <span className="block">{titleLine2}</span>
                    </h1>
                    
                    <div className="flex flex-col gap-3 mt-4">
                        <p className="text-sm font-medium text-white/90 leading-relaxed max-w-[95%]">
                            {project.description}
                        </p>
                        <span className="text-white font-bold text-sm">Let's dive in!</span>
                    </div>

                    {/* Inline Minimal Metadata inside container */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 rounded-full px-3 py-1.5 shadow-sm">
                            <Calendar size={12} className="text-white/70" />
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">{project.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 rounded-full px-3 py-1.5 shadow-sm">
                            <User size={12} className="text-white/70" />
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">{project.owner}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 border border-white/10 rounded-full px-3 py-1.5 shadow-sm bg-black/20`}>
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">{project.status}</span>
                        </div>
                    </div>
                </div>

                {/* Members Section (Minimal) */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Members</h3>
                    <div className="flex items-center -space-x-2 mb-2">
                        {members.map((member, i) => (
                            <div key={member.id} className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--app-bg)] flex items-center justify-center shadow-sm" style={{ zIndex: members.length - i }}>
                                <Image src={member.avatar} alt={member.name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <button 
                            onClick={() => {
                                const id = window.prompt("Enter the code or ID of the member to add:");
                                if (id) alert(`Member ${id} added successfully.`);
                            }}
                            className="flex items-center gap-2 bg-[#2D7FE0] hover:bg-[#1a6ecf] text-white text-xs font-bold py-2.5 px-4 rounded-full transition-colors cursor-pointer shadow-md"
                        >
                            <Plus size={14} /> Add Member
                        </button>
                        <button 
                            onClick={() => window.alert("All members have been pinged.")}
                            className="flex items-center gap-2 bg-[#3b82f6]/20 text-blue-400 border border-blue-500/30 hover:bg-[#3b82f6]/30 text-xs font-bold py-2.5 px-4 rounded-full transition-colors cursor-pointer"
                        >
                            <Bell size={14} /> Ping Members
                        </button>
                    </div>
                </div>

                {/* PAL Insights (Single Card) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-blue-400" />
                        <h3 className="text-lg font-bold text-white">PAL Insights</h3>
                    </div>
                    <div className="bg-[#121419] border border-[#2A2E37] rounded-2xl p-5 shadow-lg space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-zinc-300 leading-relaxed mt-1">Sprint on track for next milestone.</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertTriangle size={12} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-zinc-300 leading-relaxed mt-1">Design approval needed for authentication flow.</span>
                        </div>
                    </div>
                </div>

                {/* Metrics & Progress */}
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">Tasks Done</span>
                            <span className="text-3xl font-black text-white">{metrics.tasks.completed} <span className="text-zinc-600 text-xl font-bold">/ {metrics.tasks.total}</span></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">Completion</span>
                            <span className="text-3xl font-black text-white">{metrics.completion}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#1A1D24] rounded-full h-2 overflow-hidden border border-zinc-800 shadow-inner">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${metrics.completion}%` }}></div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    <div className="space-y-5">
                        {activities.map(act => (
                            <div key={act.id} className="flex items-start gap-4 group">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#121419] shadow shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                    <act.icon size={14} className={act.color} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-300">{act.text}</span>
                                    <span className="text-[11px] font-semibold text-zinc-500 mt-1">{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Files */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Files</h3>
                    <div className="flex flex-col gap-3">
                        {documents.map(doc => (
                            <div 
                                key={doc.id} 
                                onClick={() => {
                                    if (doc.action === "download") window.alert(`Downloading ${doc.title}...`);
                                    if (doc.action === "upload") window.alert(`Opening upload dialog for ${doc.title}...`);
                                }}
                                className="flex items-center gap-4 bg-[#121419] border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#1A1D24] border border-[#2A2E37] flex items-center justify-center shrink-0">
                                    <FileText size={18} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div className="flex flex-col flex-1 truncate">
                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                    <span className="text-[11px] font-semibold text-zinc-500">{doc.type}</span>
                                </div>
                                {doc.action === "download" ? (
                                    <Download size={16} className="text-zinc-600 shrink-0 group-hover:text-blue-400 transition-colors" />
                                ) : (
                                    <Upload size={16} className="text-zinc-600 shrink-0 group-hover:text-blue-400 transition-colors" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Sticky Bottom CTA */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[350px]">
                <button 
                    onClick={() => router.push("/chat")}
                    className="w-full bg-[#2D7FE0] hover:bg-[#1a6ecf] text-white font-bold py-4 px-6 rounded-full shadow-[0_12px_40px_rgba(45,127,224,0.35)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                    <span>Open Workspace</span>
                </button>
            </div>

        </div>
    );
}
