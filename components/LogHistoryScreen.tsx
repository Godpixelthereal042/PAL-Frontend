"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Check, 
    Trash2, 
    Play, 
    Pause, 
    ArrowUp, 
    CalendarPlus, 
    Mic, 
    ArrowRight, 
    Clock, 
    ExternalLink, 
    ChevronDown, 
    ChevronUp, 
    AlertCircle, 
    ShieldCheck, 
    FileText,
    X
} from "lucide-react";
import BottomNav from "./BottomNav";

interface TimelineItem {
    id: string;
    time: string;
    title: string;
    details?: string;
    category: "life" | "work" | "sync";
    isCompleted: boolean;
    isActive?: boolean;
    hasCalendarLink?: boolean;
    systemIcon?: any;
    statusLabel?: string;
}

export default function LogHistoryScreen() {
    const router = useRouter();
    
    // Timeline Data State
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);

    const enrichLogItem = (log: any): TimelineItem => {
        let systemIcon: any = undefined;
        let statusLabel: string | undefined = undefined;
        let hasCalendarLink = false;
        let isActive = false;

        if (log.title.includes("Synced") || log.title.includes("Updated")) {
            systemIcon = ShieldCheck;
            statusLabel = "Success";
        } else if (log.title.includes("Error") || log.title.includes("Captured")) {
            systemIcon = AlertCircle;
            statusLabel = "Error";
        } else if (log.title.includes("Generated") || log.title.includes("Report")) {
            systemIcon = FileText;
            statusLabel = "Report";
        }

        if (log.title.includes("Dinner")) {
            hasCalendarLink = true;
        }

        if (log.title.includes("Finish book")) {
            isActive = true;
        }

        return {
            ...log,
            systemIcon,
            statusLabel,
            hasCalendarLink,
            isActive
        };
    };

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch("/api/logs");
                if (res.ok) {
                    const data = await res.json();
                    setTimeline(data.map(enrichLogItem));
                }
            } catch (err) {
                console.error("Failed to fetch logs", err);
            }
        }
        fetchLogs();
    }, []);

    // Active Category Filter
    const [filter, setFilter] = useState<"all" | "life" | "work" | "sync">("all");
    
    // Collapsible states for details card
    const [expandedNodes, setExpandedNodes] = useState<string[]>(["2", "5"]);

    // Recording Memo Simulation States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(4); // default 4 seconds as in screenshot
    const [isPaused, setIsPaused] = useState(true);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Add Task Sheet Drawer States
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskTime, setNewTaskTime] = useState("");
    const [newTaskCategory, setNewTaskCategory] = useState<"life" | "work" | "sync">("work");
    
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Audio recording timer loop
    useEffect(() => {
        if (isRecording && !isPaused) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, [isRecording, isPaused]);

    // Format recording timer
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // Toggle expand/collapse
    const toggleExpand = (id: string) => {
        setExpandedNodes(prev => 
            prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
        );
    };

    // Trigger floating message
    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    };

    // Diagnose error log and redirect to chat
    const handleDiagnose = (details: string) => {
        localStorage.setItem("chat_incoming_prompt", `Let's diagnose and fix this error trace from our system logs:\n\n\`\`\`\n${details}\n\`\`\``);
        triggerToast("Routing to Co-Founder Chat...");
        setTimeout(() => {
            router.push("/chat");
        }, 1200);
    };

    // Toggle recording mode
    const handleToggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
        } else {
            setIsPaused(!isPaused);
        }
    };

    // Reset/Delete recording
    const handleDeleteRecording = () => {
        setIsRecording(false);
        setIsPaused(true);
        setRecordingTime(4);
        triggerToast("Voice recording discarded");
    };

    // Toggle completion status on SQLite backend
    const handleToggleCompleted = async (id: string, nextStatus: boolean) => {
        setTimeline(prev => prev.map(t => t.id === id ? { ...t, isCompleted: nextStatus } : t));
        triggerToast(nextStatus ? "Task completed!" : "Item marked pending");
        try {
            await fetch("/api/logs", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isCompleted: nextStatus })
            });
        } catch (err) {
            console.error("Failed to update task completion", err);
        }
    };

    // Submit voice note as timeline event
    const handleSendVoiceNote = async () => {
        if (!isRecording) return;
        
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        
        const newItem = {
            time: `${hrs}:${mins}`,
            title: "From voice note...",
            details: `Transcribed audio note (${formatTime(recordingTime)}): "Refine database model schemas and audit code commits for optimization."`,
            category: "work",
            isCompleted: false
        };

        try {
            const res = await fetch("/api/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem)
            });

            if (res.ok) {
                const saved = await res.json();
                setTimeline(prev => {
                    const copy = [...prev];
                    copy.splice(4, 0, enrichLogItem(saved));
                    return copy;
                });
                triggerToast("Voice log transcribed & added!");
            }
        } catch (err) {
            console.error("Failed to create voice note log", err);
        }

        setIsRecording(false);
        setIsPaused(true);
        setRecordingTime(4);
    };

    // Add custom task from bottom sheet drawer
    const handleAddNewTask = async () => {
        if (!newTaskTitle.trim()) {
            triggerToast("Please enter a title");
            return;
        }

        const timeString = newTaskTime.trim() || (() => {
            const now = new Date();
            const hrs = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            return `${hrs}:${mins}`;
        })();

        const newItem = {
            time: timeString,
            title: newTaskTitle,
            category: newTaskCategory,
            isCompleted: false
        };

        try {
            const res = await fetch("/api/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem)
            });

            if (res.ok) {
                const saved = await res.json();
                setTimeline(prev => [...prev, enrichLogItem(saved)].sort((a, b) => a.time.localeCompare(b.time)));
                triggerToast("New task scheduled!");
            }
        } catch (err) {
            console.error("Failed to add custom task log", err);
        }
        
        setShowAddDrawer(false);
        setNewTaskTitle("");
        setNewTaskTime("");
    };

    // Filter timeline
    const filteredTimeline = timeline.filter(item => {
        if (filter === "all") return true;
        return item.category === filter;
    });

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#121212] text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-center">
                    <span className="text-[9px] text-[var(--app-text-muted)] font-bold uppercase tracking-widest block mb-0.5">November 11, 2026</span>
                    <h1 className="text-base font-extrabold text-white tracking-wide leading-tight">Tasks & Events</h1>
                </div>
                <div className="w-[44px]" />
            </div>

            {/* Filter Navigation Category Pills */}
            <div className="flex px-4 py-3 border-b border-[var(--app-card-border)] bg-[#0a0a0d] shrink-0 gap-2 overflow-x-auto scrollbar-hide text-[10px] uppercase font-bold tracking-wider">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                        filter === "all" ? "bg-white/10 border-white/15 text-white" : "border-transparent text-[var(--app-text-muted)] hover:text-gray-300"
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter("life")}
                    className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                        filter === "life" ? "bg-blue-500/10 border-blue-500/25 text-blue-400" : "border-transparent text-[var(--app-text-muted)] hover:text-gray-300"
                    }`}
                >
                    Life
                </button>
                <button
                    onClick={() => setFilter("work")}
                    className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                        filter === "work" ? "bg-orange-500/10 border-orange-500/25 text-orange-400" : "border-transparent text-[var(--app-text-muted)] hover:text-gray-300"
                    }`}
                >
                    Work
                </button>
                <button
                    onClick={() => setFilter("sync")}
                    className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                        filter === "sync" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "border-transparent text-[var(--app-text-muted)] hover:text-gray-300"
                    }`}
                >
                    Syncs
                </button>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4 relative scrollbar-hide">
                {filteredTimeline.length > 0 ? (
                    <div className="space-y-0 relative">
                        
                        {/* Vertical Timeline Connection Line */}
                        <div className="absolute left-[70px] top-4 bottom-4 w-[1.5px] border-l-2 border-dashed border-zinc-800 pointer-events-none" />

                        {filteredTimeline.map((item, idx) => {
                            const isCompleted = item.isCompleted;
                            const isActive = item.isActive;
                            const isExpanded = expandedNodes.includes(item.id);
                            
                            // Category specific styling cards
                            let cardStyle = "bg-[#111218] border border-zinc-900 rounded-2xl p-3.5 shadow-sm";
                            if (item.category === "work") {
                                cardStyle = "bg-[#0b1320]/80 border border-[#2d7fe0]/15 rounded-[22px] p-4 shadow-md hover:border-[#2d7fe0]/35 transition-colors";
                            } else if (item.category === "life") {
                                cardStyle = "bg-[#19110d]/80 border border-[#ff5a2b]/15 rounded-[22px] p-4 shadow-md hover:border-[#ff5a2b]/35 transition-colors";
                            } else if (item.category === "sync") {
                                cardStyle = "bg-[#0a1510]/80 border border-[#10b981]/15 rounded-[22px] p-4 shadow-md hover:border-[#10b981]/35 transition-colors";
                            }

                            return (
                                <div key={item.id} className="grid grid-cols-[52px_36px_1fr] gap-1.5 items-start min-h-[68px] py-2 relative group">
                                    
                                    {/* Column 1: Time stamp */}
                                    <div className="text-right pt-4">
                                        <span className={`text-[11px] font-extrabold tracking-tight ${
                                            isCompleted ? "text-zinc-600 line-through" : isActive ? "text-[#FF532B] font-black text-xs" : "text-zinc-400"
                                        }`}>
                                            {item.time}
                                        </span>
                                    </div>

                                    {/* Column 2: Circle Node indicator (Scribble/Marker theme from IMG_2575.JPG) */}
                                    <div className="flex justify-center items-start pt-[14px] relative h-full">
                                        {isCompleted ? (
                                            <button 
                                                onClick={() => handleToggleCompleted(item.id, false)}
                                                className="w-5.5 h-5.5 rounded-lg bg-[#d9f99d] flex items-center justify-center text-black z-10 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md relative overflow-hidden border-none"
                                            >
                                                {/* Hand-drawn scribble vector overlay */}
                                                <svg className="absolute inset-0 w-full h-full text-black/50 pointer-events-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M2,11 C5,4 12,18 17,9" />
                                                    <path d="M4,15 C9,13 7,5 14,8" />
                                                </svg>
                                                <Check size={11} className="stroke-[4.5px] text-black relative z-10" />
                                            </button>
                                        ) : isActive ? (
                                            <button
                                                onClick={() => handleToggleCompleted(item.id, true)}
                                                className="w-5.5 h-5.5 rounded-lg bg-[#FF532B] text-white z-10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md border-none text-[8.5px] font-black"
                                            >
                                                {idx + 1}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleCompleted(item.id, true)}
                                                className="w-5.5 h-5.5 rounded-lg border-2 border-zinc-700 bg-zinc-950 z-10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer hover:border-zinc-500"
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Column 3: Content card block */}
                                    <div className="space-y-1.5 pb-2.5">
                                        <div className={cardStyle}>
                                            <div className="flex justify-between items-start">
                                                {/* Title */}
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 
                                                        onClick={() => item.details && toggleExpand(item.id)}
                                                        className={`text-xs font-bold leading-relaxed transition-all ${
                                                            item.details ? "cursor-pointer hover:text-white" : ""
                                                        } ${
                                                            isCompleted 
                                                                ? "text-zinc-500 line-through font-medium" 
                                                                : isActive 
                                                                    ? "text-white font-extrabold text-[12.5px]" 
                                                                    : "text-zinc-200"
                                                        }`}
                                                    >
                                                        {item.title}
                                                    </h4>
                                                </div>

                                                {/* Action Badges / Chevrons */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {item.hasCalendarLink && (
                                                        <button 
                                                            onClick={() => triggerToast("Opening calendar invitation details...")}
                                                            className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-blue-500/20 transition-all cursor-pointer"
                                                        >
                                                            Open in <Clock size={9} />
                                                        </button>
                                                    )}
                                                    {item.systemIcon && (
                                                        <span className={`text-[7px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                                            item.statusLabel === "Error" 
                                                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                                                : item.statusLabel === "Report"
                                                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        }`}>
                                                            {item.statusLabel}
                                                        </span>
                                                    )}
                                                    {item.details && (
                                                        <button
                                                            onClick={() => toggleExpand(item.id)}
                                                            className="text-zinc-500 hover:text-white p-0.5 cursor-pointer"
                                                        >
                                                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded Details Card */}
                                            <AnimatePresence>
                                                {item.details && isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-black/30 border border-zinc-850 p-3 rounded-[14px] mt-3 space-y-2.5 shadow-inner">
                                                            <p className="text-[10.5px] leading-relaxed text-zinc-400 font-medium">
                                                                {item.details}
                                                            </p>
                                                            
                                                            {/* Diagnose action button for error logs */}
                                                            {item.statusLabel === "Error" && (
                                                                <button
                                                                    onClick={() => handleDiagnose(item.details || "")}
                                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-[9px] font-extrabold text-red-400 uppercase tracking-wider transition-all cursor-pointer"
                                                                >
                                                                    Diagnose in Chat <ArrowRight size={9} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                        <div className="w-12 h-12 bg-white/5 border border-[var(--app-card-border)] rounded-full flex items-center justify-center text-zinc-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-white">No tasks scheduled</h3>
                            <p className="text-[10px] text-[var(--app-text-muted)] mt-1">There are no timeline events matching this filter.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom floating Voice Note Recorder / Add Task Bar */}
            <div className="absolute bottom-[92px] left-1/2 -translate-x-1/2 w-[90%] max-w-[370px] z-40">
                <div className="bg-[#161821]/95 border border-[var(--app-card-border)] backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between shadow-2xl space-x-2">
                    
                    {/* Recording indicator & timer waves */}
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <button
                            onClick={handleToggleRecording}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 transition-all cursor-pointer ${
                                isRecording && !isPaused
                                    ? "bg-red-500/20 border-red-500 text-red-400"
                                    : "bg-white/5 border-[var(--app-card-border)] text-zinc-300 hover:text-white"
                            }`}
                        >
                            <Mic size={15} className={isRecording && !isPaused ? "animate-pulse" : ""} />
                        </button>

                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-white block">
                                {isRecording ? (isPaused ? "Recording Paused" : "Voice Recording") : "Voice Memo"}
                            </span>
                            
                            <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-extrabold text-[var(--app-text-secondary)] tabular-nums">
                                    {formatTime(recordingTime)}
                                </span>
                                
                                {/* Simulated Equalizer lines */}
                                <div className="flex items-center gap-[1.5px] h-3.5 px-0.5">
                                    <div className={`w-[1.5px] bg-[#4cd964] rounded-full transition-all duration-300 ${
                                        isRecording && !isPaused ? "h-2.5 animate-pulse" : "h-1 bg-zinc-700"
                                    }`} />
                                    <div className={`w-[1.5px] bg-[#4cd964] rounded-full transition-all duration-300 [animation-delay:0.1s] ${
                                        isRecording && !isPaused ? "h-3 animate-pulse" : "h-1 bg-zinc-700"
                                    }`} />
                                    <div className={`w-[1.5px] bg-[#4cd964] rounded-full transition-all duration-300 [animation-delay:0.2s] ${
                                        isRecording && !isPaused ? "h-1.5 animate-pulse" : "h-1.5 bg-zinc-700"
                                    }`} />
                                    <div className={`w-[1.5px] bg-[#4cd964] rounded-full transition-all duration-300 [animation-delay:0.3s] ${
                                        isRecording && !isPaused ? "h-3.5 animate-pulse" : "h-1 bg-zinc-700"
                                    }`} />
                                    <div className={`w-[1.5px] bg-[#4cd964] rounded-full transition-all duration-300 [animation-delay:0.4s] ${
                                        isRecording && !isPaused ? "h-2 animate-pulse" : "h-1 bg-zinc-700"
                                    }`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controller Action buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                        {isRecording ? (
                            <>
                                {/* Discard/Delete */}
                                <button
                                    onClick={handleDeleteRecording}
                                    className="p-2 rounded-xl bg-white/5 text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                                    title="Discard"
                                >
                                    <Trash2 size={14} />
                                </button>
                                
                                {/* Pause/Resume */}
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="p-2 rounded-xl bg-white/5 text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                                    title={isPaused ? "Resume" : "Pause"}
                                >
                                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                                </button>
                                
                                {/* Send/Ingest note */}
                                <button
                                    onClick={handleSendVoiceNote}
                                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all cursor-pointer"
                                    title="Transcribe Voice Note"
                                >
                                    <ArrowUp size={14} className="stroke-[2.5px]" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Add Task Shortcut */}
                                <button
                                    onClick={() => setShowAddDrawer(true)}
                                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-[var(--app-card-border)] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Schedule task"
                                >
                                    <CalendarPlus size={15} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <BottomNav />

            {/* Floating Toast Alert */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-neutral-900 border border-[var(--app-card-border)] px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl z-50 whitespace-nowrap min-w-[200px] justify-center font-outfit"
                    >
                        <Check size={12} className="text-emerald-400 stroke-[3px]" />
                        <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slide-Up Add Task Drawer */}
            <AnimatePresence>
                {showAddDrawer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[var(--app-header-bg)] backdrop-blur-sm z-50 flex flex-col justify-end"
                    >
                        {/* Backdrop close */}
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAddDrawer(false)} />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ translateY: "100%" }}
                            animate={{ translateY: "0%" }}
                            exit={{ translateY: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="bg-[#0c0d12] border-t border-[var(--app-card-border)] rounded-t-[32px] w-full max-h-[85dvh] flex flex-col z-10 overflow-hidden relative shadow-2xl text-gray-100 font-outfit"
                        >
                            {/* Handle bar */}
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />
                            
                            {/* Close icon */}
                            <button
                                onClick={() => setShowAddDrawer(false)}
                                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/15 text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4 space-y-6">
                                
                                {/* Header */}
                                <div className="space-y-1 text-center pb-2">
                                    <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block">
                                        Scheduler
                                    </span>
                                    <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                                        Add Tasks & Events
                                    </h3>
                                    <p className="text-[10.5px] text-[var(--app-text-muted)]">Insert custom work plans or system reports to your timeline.</p>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 pl-0.5">
                                            Task / Event Title
                                        </label>
                                        <input
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            className="h-[48px] w-full rounded-2xl border border-[var(--app-card-border)] bg-black/40 px-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="e.g., Dinner at Lucca"
                                            maxLength={50}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 pl-0.5">
                                                Time (HH:MM)
                                            </label>
                                            <input
                                                value={newTaskTime}
                                                onChange={(e) => setNewTaskTime(e.target.value)}
                                                className="h-[48px] w-full rounded-2xl border border-[var(--app-card-border)] bg-black/40 px-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                placeholder="e.g., 19:00"
                                                maxLength={5}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 pl-0.5">
                                                Category
                                            </label>
                                            <select
                                                value={newTaskCategory}
                                                onChange={(e) => setNewTaskCategory(e.target.value as any)}
                                                className="h-[48px] w-full rounded-2xl border border-[var(--app-card-border)] bg-[#0c0d12] px-3 text-xs font-semibold text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            >
                                                <option value="life">Life</option>
                                                <option value="work">Work</option>
                                                <option value="sync">Sync</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2.5 pt-4">
                                    <button
                                        onClick={handleAddNewTask}
                                        className="w-full h-[48px] rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                                    >
                                        Add Event <Check size={14} className="stroke-[2.5px]" />
                                    </button>

                                    <button
                                        onClick={() => setShowAddDrawer(false)}
                                        className="w-full h-[48px] rounded-full bg-white/5 border border-[var(--app-card-border)] hover:bg-white/10 text-xs font-bold text-[var(--app-text-secondary)] hover:text-white uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
