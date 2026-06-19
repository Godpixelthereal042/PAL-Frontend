"use client";

import { Plus, Home, Grid, MoreVertical, Check, ChevronDown } from "lucide-react";
import BottomNav from "./BottomNav";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import AddProjectModal from "./projects/AddProjectModal";
import MascotAvatar from "./MascotAvatar";
import { useRouter } from "next/navigation";

interface Project {
    id: number | string;
    title: string;
    type: string;
    description?: string;
    date: string;
    color: string;
    textColor: string;
}

interface CardProps {
    project: Project;
    index: number;
    onSwipe: () => void;
    onAdd: () => void;
    dragY: any;
}

const INITIAL_PROJECTS: Project[] = [
    { id: 1, title: "The Base app", type: "Mobile app design", description: "Designing the new web & mobile layout for Base", date: "02/08/2025", color: "#3b82f6", textColor: "text-white" },
    { id: 2, title: "Onboard", type: "Web platform", description: "Simplifying user onboarding flow", date: "01/15/2025", color: "#0f172a", textColor: "text-[var(--app-text-secondary)]" },
    { id: 3, title: "Paypal AI", type: "Fintech integration", description: "Integrating conversational AI to speed checkout", date: "12/20/2024", color: "#3b82f6", textColor: "text-blue-100" },
    { id: 4, title: "Busy Easy", type: "Productivity tool", description: "All-in-one productivity tracker for teams", date: "11/05/2024", color: "#1e293b", textColor: "text-[var(--app-text-secondary)]" },
    { id: 5, title: "Crypto Wallet", type: "Mobile app", description: "Decentralized secure crypto wallet interface", date: "10/20/2024", color: "#8b5cf6", textColor: "text-white" },
    { id: 6, title: "Health Tracker", type: "Wearable app", description: "Fitness tracking companion dashboard", date: "09/15/2024", color: "#10b981", textColor: "text-white" },
];

export default function ProjectsScreen() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dragY = useMotionValue(0);

    // Timeline interactive states
    const [showTime, setShowTime] = useState(true);
    const [selectedDate, setSelectedDate] = useState("Fr 18");

    const [events, setEvents] = useState<any[]>([]);

    // Fetch projects and schedules on load
    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("/api/projects");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        // Map textColor property
                        const mapped = data.map((p: any) => ({
                            ...p,
                            textColor: p.color === "#0f172a" || p.color === "#1e293b" 
                                ? "text-[var(--app-text-secondary)]" 
                                : p.color === "#3b82f6" 
                                    ? "text-blue-100" 
                                    : "text-white"
                        }));
                        setProjects(mapped);
                    } else {
                        setProjects([]);
                    }
                } else {
                    setProjects([]);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
                setProjects([]);
            }
        }

        async function fetchSchedules() {
            try {
                const res = await fetch("/api/schedules");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setEvents(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load schedules", err);
            }
        }

        fetchProjects();
        fetchSchedules();
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
                // Fallback
                const newProject: Project = {
                    ...payload,
                    textColor: "text-white"
                };
                setProjects((prev) => [newProject, ...prev]);
            }
        } catch (err) {
            console.error("Error adding project", err);
            const newProject: Project = {
                ...payload,
                textColor: "text-white"
            };
            setProjects((prev) => [newProject, ...prev]);
        }
    };

    const moveToBack = () => {
        // Animate top card off screen first
        animate(dragY, 250, { type: "tween", ease: "easeOut", duration: 0.2 }).then(() => {
            setProjects((prev) => {
                const newProjects = [...prev];
                const movedItem = newProjects.shift();
                if (movedItem) newProjects.push(movedItem);
                return newProjects;
            });
            // Reset dragY to 0 instantly after shifting states
            dragY.set(0);
        });
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 font-outfit flex flex-col">
            
            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-28 scrollbar-hide flex flex-col">
                {/* SVG Defs for responsive clip path (preserves card structure) */}
                <svg width="0" height="0" className="absolute pointer-events-none">
                    <defs>
                        <clipPath id="folderClip" clipPathUnits="objectBoundingBox">
                            <path d="M 0 0.9333 L 0 0.1777 C 0 0.1416 0.0323 0.1111 0.0705 0.1111 L 0.3529 0.1111 C 0.4411 0.1111 0.5 0.0444 0.5882 0.0444 L 0.9294 0.0444 C 0.9676 0.0444 1 0.075 1 0.1111 L 1 0.9333 C 1 0.9694 0.9676 1 0.9294 1 L 0.0705 1 C 0.0323 1 0 0.9694 0 0.9333 Z" />
                        </clipPath>
                    </defs>
                </svg>

                {/* Header (Refined to match left screen of IMG_2573.JPG) */}
                <div className="flex justify-between items-center pt-2 mb-4 shrink-0 z-30">
                    {/* Dots menu :: icon */}
                    <button
                        onClick={() => router.push('/')}
                        className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#121419] text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                        aria-label="Dots Menu"
                    >
                        <div className="grid grid-cols-2 gap-[3px]">
                            <div className="w-[5px] h-[5px] rounded-full bg-zinc-400" />
                            <div className="w-[5px] h-[5px] rounded-full bg-zinc-400" />
                            <div className="w-[5px] h-[5px] rounded-full bg-zinc-400" />
                            <div className="w-[5px] h-[5px] rounded-full bg-zinc-400" />
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Points Pill */}
                        <div className="flex items-center gap-1.5 bg-[#0a1f40] px-3.5 py-1.5 rounded-full border border-blue-500/20">
                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">✨ 100 PTS</span>
                        </div>

                        {/* Profile Avatar (MASCOT) */}
                        <div className="w-[42px] h-[42px] rounded-full border border-blue-500/20 relative ring-1 ring-black flex items-center justify-center overflow-hidden shrink-0">
                            <MascotAvatar className="w-full h-full" />
                        </div>
                    </div>
                </div>

                {/* Greeting & Title Section (Adapting Wendy's layout) */}
                <div className="shrink-0 mb-4">
                    <span className="text-xs text-[var(--app-text-muted)] font-semibold block">Hello, Co-Founder</span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h1 className="text-2xl font-black text-white font-outfit tracking-wide">
                            Your Projects
                        </h1>
                        <span className="text-2xl font-black text-[#51d4ff] font-outfit">({projects.length})</span>
                    </div>
                </div>

                {/* Stacked Folder Cards Stack (KEPT EXACTLY AS IT IS) */}
                <div className="relative w-full h-[280px] max-w-[340px] mx-auto mt-2 perspective-1000 px-2 shrink-0">
                    <div className="relative w-full h-full">
                        <AnimatePresence>
                            {projects.slice(0, 4).map((project, index) => (
                                <Card
                                    key={project.id}
                                    project={project}
                                    index={index}
                                    onSwipe={moveToBack}
                                    onAdd={() => setIsModalOpen(true)}
                                    dragY={dragY}
                                />
                            )).reverse()}
                        </AnimatePresence>

                        {/* Floating Plus Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="absolute bottom-6 right-2 w-[50px] h-[50px] rounded-full bg-white text-[#0a438a] flex items-center justify-center shadow-lg hover:bg-zinc-100 active:scale-95 transition-all z-[100] cursor-pointer"
                            aria-label="Add project"
                        >
                            <Plus className="w-5 h-5 text-[#0a438a]" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Calendar & Schedule Timeline Section (Adapting bottom layout from left screen of IMG_2573.JPG) */}
                <div className="mt-8 space-y-4 shrink-0">
                    
                    {/* Date Carousel */}
                    <div className="flex justify-between items-center overflow-x-auto scrollbar-hide py-1 border-t border-[var(--app-card-border)] pt-4">
                        {[
                            { day: "Tu", date: "15" },
                            { day: "We", date: "16" },
                            { day: "Th", date: "17" },
                            { day: "Fr", date: "18", isToday: true },
                            { day: "Sa", date: "19" },
                            { day: "Su", date: "20" },
                            { day: "Mo", date: "21" }
                        ].map((d, i) => {
                            const key = `${d.day} ${d.date}`;
                            const isSelected = selectedDate === key || (selectedDate === "" && d.isToday);
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(key)}
                                    className="flex flex-col items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                                >
                                    <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-[var(--app-text-muted)]"}`}>{d.day}</span>
                                    <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                                        isSelected 
                                            ? "bg-[#2d7fe0] text-white shadow-md shadow-blue-500/20" 
                                            : "text-[var(--app-text-secondary)] hover:text-white"
                                    }`}>
                                        {d.date}
                                    </span>
                                    {d.isToday && !isSelected && (
                                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Calendar Controls */}
                    <div className="flex justify-between items-center bg-[#121419]/60 border border-[var(--app-card-border)] rounded-2xl p-3.5">
                        <button
                            onClick={() => setShowTime(prev => !prev)}
                            className="flex items-center gap-2.5 text-xs text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                        >
                            <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                showTime 
                                    ? "bg-[#2d7fe0] border-blue-500 text-white" 
                                    : "border-zinc-700 bg-transparent text-transparent"
                            }`}>
                                <Check size={11} strokeWidth={3} />
                            </div>
                            <span className="font-bold">Show timeline</span>
                        </button>

                        <button 
                            onClick={() => setSelectedDate("Fr 18")}
                            className="flex items-center gap-1 bg-zinc-900 border border-[var(--app-card-border)] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                            <span>Today</span>
                            <ChevronDown size={11} />
                        </button>
                    </div>

                    {/* Timeline Grid (Conditional based on showTime) */}
                    <AnimatePresence>
                        {showTime && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pt-1"
                            >
                                {(() => {
                                    const selectedDayNum = selectedDate.split(" ")[1]; // e.g. "18"
                                    const dayEvents = events.filter((e: any) => {
                                        const parts = (e.date || "").split("-");
                                        return parts[2] === selectedDayNum;
                                    });

                                    if (dayEvents.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-xs text-[var(--app-text-muted)] border border-dashed border-zinc-800/80 rounded-2xl">
                                                No meetings or tasks scheduled for this day
                                            </div>
                                        );
                                    }

                                    return dayEvents.map((ev, idx) => (
                                        <div key={ev.id || idx} className="flex gap-4 items-start">
                                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] w-8 pt-1">{ev.time}</span>
                                            <div className="flex-1 bg-[#121419] border border-[var(--app-card-border)] rounded-2xl p-3 flex justify-between items-center">
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-zinc-300">{ev.title}</h4>
                                                    <span className="text-[9px] text-[var(--app-text-muted)] font-semibold block mt-0.5 uppercase tracking-wider">Schedule Event</span>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
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

function Card({ project, index, onSwipe, onAdd, dragY }: CardProps) {
    const isTop = index === 0;

    // Direct motion transforms mapped to the parent dragY value
    const cardY = useTransform(
        dragY,
        [0, 150],
        [-index * 24, isTop ? 150 : -(index - 1) * 24]
    );

    const cardScale = useTransform(
        dragY,
        [0, 150],
        [1 - index * 0.05, 1 - (index - 1) * 0.05]
    );

    const cardOpacity = useTransform(
        dragY,
        [0, 120, 250],
        [
            isTop ? 1 : Math.max(0.4, 1 - index * 0.2),
            isTop ? 1 : Math.max(0.4, 1 - (index - 1) * 0.2),
            isTop ? 0 : Math.max(0.4, 1 - (index - 1) * 0.2)
        ]
    );
    
    // Rotate leaf angle on top card during swipes
    const rotate = useTransform(dragY, [0, 200], [0, 5]);

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.y > 100) {
            onSwipe();
        } else {
            animate(dragY, 0, { type: "spring", stiffness: 300, damping: 25 });
        }
    };

    const router = useRouter();

    return (
        <motion.div
            drag={isTop ? "y" : false}
            dragConstraints={{ top: 0, bottom: 250 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            style={{
                y: isTop ? dragY : cardY,
                scale: cardScale,
                opacity: cardOpacity,
                rotate: isTop ? rotate : 0,
                zIndex: 50 - index,
                position: "absolute",
                width: "100%",
                height: "85%",
                left: 0,
                top: 40,
                touchAction: "none"
            }}
            className="origin-top"
        >
            <div className="relative w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                <div
                    onClick={() => {
                        if (isTop && Math.abs(dragY.get()) < 5) {
                            router.push(`/projects/${project.id}`);
                        }
                    }}
                    className={`relative w-full h-full transition-colors duration-300 ${isTop ? 'cursor-pointer' : ''}`}
                    style={{
                        clipPath: "url(#folderClip)",
                        background: project.color === "#3b82f6" ? "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" : project.color,
                    }}
                >
                    {/* Responsive Border Overlay Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M 0.5 93.3 L 0.5 17.8 C 0.5 14.2 3.2 11.1 7.1 11.1 L 35.3 11.1 C 44.1 11.1 50 4.4 58.8 4.4 L 92.9 4.4 C 96.8 4.4 99.5 7.5 99.5 11.1 L 99.5 93.3 C 99.5 96.9 96.8 99.5 92.9 99.5 L 7.1 99.5 C 3.2 99.5 0.5 96.9 0.5 93.3 Z"
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    <div className="p-6 pt-10 flex flex-col justify-between h-full select-none">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] uppercase font-semibold tracking-wider opacity-75 ${project.textColor === 'text-[var(--app-text-secondary)]' ? 'text-[var(--app-text-muted)]' : 'text-blue-200'}`}>
                                    {project.type}
                                </span>
                                <span className={`text-[10px] font-medium opacity-75 ${project.textColor === 'text-[var(--app-text-secondary)]' ? 'text-gray-600' : 'text-blue-200'}`}>
                                    {project.date}
                                </span>
                            </div>
                            <h3 className={`text-xl font-bold tracking-tight mt-1 ${project.textColor || 'text-white'}`}>
                                {project.title}
                            </h3>
                        </div>

                        <div className="mt-2 flex-1 flex flex-col justify-start mb-4">
                            <p className={`text-xs leading-relaxed opacity-80 ${project.textColor === 'text-[var(--app-text-secondary)]' ? 'text-[var(--app-text-muted)]' : 'text-blue-100'}`}>
                                {project.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
