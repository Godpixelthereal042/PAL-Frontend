"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import BottomNav from "./BottomNav";
import { useState, useEffect } from "react";
import AddProjectModal from "./projects/AddProjectModal";
import MascotAvatar from "./MascotAvatar";
import PALFolderStack, { Project } from "./projects/PALFolderStack";

export default function ProjectsScreen() {
    const [projects, setProjects] = useState<Project[]>([
        { id: "1", title: "The Base app", type: "Mobile app design", date: "02/08/2025", color: "#3b82f6", textColor: "text-white" },
        { id: "2", title: "Web platform", type: "Dashboard UI", date: "04/09/2025", color: "#1e293b", textColor: "text-[var(--app-text-secondary)]" },
        { id: "3", title: "Brand identity", type: "Brand design", date: "12/10/2025", color: "#0f172a", textColor: "text-[var(--app-text-secondary)]" },
        { id: "4", title: "Marketing site", type: "Web design", date: "15/11/2025", color: "#0f172a", textColor: "text-[var(--app-text-secondary)]" }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch projects on load
    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("/api/projects");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const mapped = data.map((p: any) => ({
                            ...p,
                            textColor: p.color === "#0f172a" || p.color === "#1e293b" 
                                ? "text-[var(--app-text-secondary)]" 
                                : p.color === "#3b82f6" 
                                    ? "text-blue-100" 
                                    : "text-white"
                        }));
                        setProjects(mapped);
                    }
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            }
        }
        fetchProjects();
    }, []);

    const handleAddProject = async (newProjectData: { title: string; type: string; description: string; date: string; color: string }) => {
        const payload = {
            id: String(Date.now()),
            title: newProjectData.title,
            type: newProjectData.type,
            description: newProjectData.description,
            date: newProjectData.date,
            color: newProjectData.color
        };

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const savedProject = await res.json();
                const newProject: Project = {
                    ...savedProject,
                    textColor: savedProject.color === "#0f172a" || savedProject.color === "#1e293b"
                        ? "text-[var(--app-text-secondary)]"
                        : "text-white"
                };
                setProjects((prev) => [newProject, ...prev]);
            } else {
                setProjects((prev) => [{ ...payload, textColor: "text-white" }, ...prev]);
            }
        } catch (err) {
            setProjects((prev) => [{ ...payload, textColor: "text-white" }, ...prev]);
        }
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 font-outfit flex flex-col">
            
            {/* iOS Status Bar placeholder (if necessary, or handled globally. Assumed handled here or in a wrapper. We can add a simple spacer or basic one) */}
            <div className="flex justify-between items-center px-7 pt-5 pb-2 text-[15px] font-semibold tracking-wide text-white shrink-0">
                <span>9:41</span>
                <div className="flex items-center gap-[6px]">
                    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><path d="M1 9h3v3H1V9zm5-3h3v6H6V6zm5-3h3v9h-3V3zm5-3h3v12h-3V0z" /></svg>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 12l-8-9.8C.9 1.5 4.3 0 8 0s7.1 1.5 8 2.2L8 12z" /></svg>
                    <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" /><path d="M23 4v4c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor" /><rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor" /></svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide flex flex-col pt-2">
                
                {/* SVG Defs for responsive clip path */}
                <svg width="0" height="0" className="absolute pointer-events-none">
                    <defs>
                        <clipPath id="folderClip" clipPathUnits="objectBoundingBox">
                            <path d="M 0 0.92 C 0 0.965 0.04 0.995 0.09 0.995 L 0.91 0.995 C 0.96 0.995 1 0.965 1 0.92 L 1 0.13 C 1 0.08 0.96 0.045 0.91 0.045 L 0.57 0.045 C 0.5 0.045 0.45 0.11 0.38 0.11 L 0.09 0.11 C 0.04 0.11 0 0.14 0 0.18 L 0 0.92 Z" />
                        </clipPath>
                    </defs>
                </svg>

                {/* Top Actions: Points Pill & Avatar */}
                <div className="flex justify-between items-center mb-4 shrink-0 z-30">
                    <div className="flex items-center gap-1.5 bg-[#0a1f40] px-4 py-2 rounded-full border border-blue-500/20 shadow-md">
                        <span className="text-[12px] font-extrabold text-blue-100 uppercase tracking-widest">✨ 100</span>
                    </div>

                    <div className="w-[44px] h-[44px] rounded-full bg-[#0a438a]/50 relative ring-1 ring-blue-500/30 flex items-center justify-center overflow-hidden shrink-0">
                        <MascotAvatar className="w-full h-full" />
                    </div>
                </div>

                {/* Page Header (using tokens) */}
                <div className="shrink-0 mb-4 pt-0">
                    <h1 className="page-header-title">
                        All Projects,<br />
                        Folders <span className="page-header-count">({projects.length || 10})</span>
                    </h1>
                    <p className="page-header-subtext mb-2">
                        Swipe down to view or search for previous projects.
                    </p>
                    <Link href="/projects/library" className="text-[13px] font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center">
                        View All <span className="ml-1 text-[15px]">→</span>
                    </Link>
                </div>

                {/* Folder Stack Container */}
                <div className="relative w-full flex-1 min-h-[360px] shrink-0 flex flex-col justify-center">
                    <div className="relative w-full h-full max-h-[360px] max-w-[350px] mx-auto">
                        <PALFolderStack projects={projects} onProjectsUpdate={setProjects} />

                        {/* Floating Action Button (FAB) */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="absolute -bottom-2 -right-2 w-[60px] h-[60px] rounded-full bg-[#0a1f40] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[100] cursor-pointer drop-shadow-[0_0_25px_rgba(45,127,224,0.7)] border border-blue-400/30 shadow-[0_0_15px_rgba(45,127,224,0.4)_inset]"
                            aria-label="Add project"
                        >
                            <Plus className="w-8 h-8 text-white" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>

            <BottomNav activePage="projects" />

            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProject}
            />
        </div>
    );
}
