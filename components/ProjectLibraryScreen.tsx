"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronLeft, LayoutGrid, LayoutList } from "lucide-react";
import { Project } from "./projects/PALFolderStack";
import BottomNav from "./BottomNav";

const STATUS_FILTERS = ["All", "Active", "To Do", "In Progress", "Review", "Completed", "Archived"];

export default function ProjectLibraryScreen() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch projects
    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("/api/projects");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setProjects(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            }
        }
        fetchProjects();
    }, []);

    // Filter projects based on real data only. Fallbacks to unknown if undefined.
    const filteredProjects = projects.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const pStatus = (p as any).status; // Unmocked
        
        if (activeFilter === "All") return matchSearch;
        return matchSearch && pStatus === activeFilter;
    });

    const getStatusCount = (status: string) => {
        if (status === "All") return projects.length;
        return projects.filter(p => ((p as any).status) === status).length;
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden font-outfit flex flex-col">
            {/* Header / Nav */}
            <div className="shrink-0 px-6 pt-12 pb-4 bg-[var(--app-bg)] sticky top-0 z-30">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/projects" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Link>
                    
                    {/* View Toggle Placeholder */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full">
                        <button className="p-2 rounded-full bg-white/10 text-white"><LayoutList className="w-4 h-4" /></button>
                        <button className="p-2 rounded-full text-white/40"><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Project Library</h1>
                <p className="text-[15px] font-medium text-[var(--app-text-muted)] mb-6">Browse all your projects.</p>

                {/* Search */}
                <div className="relative mb-5">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a1f40]/50 border border-blue-500/20 rounded-xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>

                {/* Status Filters */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-6 px-6">
                    {STATUS_FILTERS.map(status => {
                        const count = getStatusCount(status);
                        const isActive = activeFilter === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setActiveFilter(status)}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all ${
                                    isActive 
                                        ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                                        : "bg-[#0a1f40] text-[var(--app-text-muted)] border border-blue-500/20 hover:text-white"
                                }`}
                            >
                                {status}
                                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/50"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Project Cards List */}
            <div className="flex-1 overflow-y-auto px-6 pb-28 custom-scrollbar">
                <div className="flex flex-col gap-4 mt-2">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 font-medium">No projects found.</div>
                    ) : (
                        filteredProjects.map(project => {
                            const pStatus = (project as any).status;
                            return (
                                <Link href={`/projects/${project.id}`} key={project.id}>
                                    <div className="relative bg-[#0a1f40]/30 rounded-2xl p-5 border border-white/5 overflow-hidden group hover:bg-[#0a1f40]/50 transition-colors">
                                        {/* Brand Color Accent Strip */}
                                        <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ backgroundColor: project.color || '#3b82f6' }} />
                                        
                                        <div className="pl-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-[17px] font-bold text-white tracking-wide group-hover:text-blue-400 transition-colors">
                                                    {project.title}
                                                </h3>
                                                {pStatus && (
                                                    <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ backgroundColor: `${project.color}20`, color: project.color }}>
                                                        {pStatus}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {project.description && (
                                                <p className="text-[13px] text-gray-400 font-medium mb-4 line-clamp-2 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center gap-4 text-[12px] font-semibold text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color || '#3b82f6' }} />
                                                    {project.type}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="opacity-70">Updated:</span>
                                                    {project.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            <BottomNav activePage="projects" />
        </div>
    );
}
