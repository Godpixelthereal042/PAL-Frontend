"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    Clock,
    Calendar as CalendarIcon,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Video,
    Send,
    Zap,
    Users,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { PalSparkleIcon, AvatarGroup } from "@/components/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ─── BRAND ICONS ──────────────────────────────────────────────

function GmailBadgeIcon({ className = "w-4 h-4" }: { className?: string }) {
    return <Mail className={`${className} text-red-400`} />;
}

function SlackBadgeIcon({ className = "w-4 h-4" }: { className?: string }) {
    return <MessageSquare className={`${className} text-emerald-400`} />;
}

function TeamsBadgeIcon({ className = "w-4 h-4" }: { className?: string }) {
    return <Users className={`${className} text-purple-400`} />;
}

function CalendarBadgeIcon({ className = "w-4 h-4" }: { className?: string }) {
    return <CalendarIcon className={`${className} text-blue-400`} />;
}

// ─── DATA MODELS ──────────────────────────────────────────────

export interface DecisionCardData {
    id: string;
    title: string;
    badge: string;
    badgeColor: string;
    source: string;
    sourceIcon: any;
    context: string;
    estimatedTime: string;
    actions: { label: string; actionPrompt: string; primary?: boolean }[];
}

export interface CalendarItemData {
    id: string;
    time: string;
    title: string;
    source: string;
    sourceColor: string;
    avatars: string[];
    hasVideoCall: boolean;
}

export interface ExtractedTaskData {
    id: string;
    title: string;
    due: string;
    priority: "HIGH" | "MEDIUM" | "NORMAL";
    source: string;
    sourceBadge: string;
}

// ─── MOCK EXECUTIVE BRIEFING DATA ──────────────────────────────

const DECISION_CARDS: DecisionCardData[] = [
    {
        id: "d1",
        title: "Approve Design Review",
        badge: "📩 Urgent Client",
        badgeColor: "text-red-400 bg-red-500/10 border-red-500/20",
        source: "Gmail • John from Base",
        sourceIcon: GmailBadgeIcon,
        context: "John from Base sent updated authentication mockups. Waiting for your final approval before engineering sprint cutoff at 5 PM.",
        estimatedTime: "30 seconds",
        actions: [
            { label: "Approve Design", actionPrompt: "Approve the Base App auth design review sent by John.", primary: true },
            { label: "Request Revisions", actionPrompt: "Draft a polite request for design revisions to John at Base.", primary: false },
            { label: "Ask PAL to Draft", actionPrompt: "Ask PAL to draft an executive sign-off email for the Base auth design.", primary: false },
        ]
    },
    {
        id: "d2",
        title: "Prepare Investor Appendix",
        badge: "📅 Upcoming Sync",
        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        source: "Google Calendar + Gmail",
        sourceIcon: CalendarBadgeIcon,
        context: "Investor sync scheduled with Sarah Jenkins for tomorrow at 10:00 AM. Q2 financial appendix is currently missing from the pitch deck.",
        estimatedTime: "2 minutes",
        actions: [
            { label: "Draft Pitch Appendix", actionPrompt: "Draft a 1-page financial appendix summary for Sarah Jenkins investor sync.", primary: true },
            { label: "Reschedule Meeting", actionPrompt: "Propose rescheduling tomorrow's investor meeting with Sarah to Friday.", primary: false },
        ]
    },
    {
        id: "d3",
        title: "Review Stripe Subscription",
        badge: "💳 Billing Alert",
        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        source: "Stripe + Gmail",
        sourceIcon: Mail,
        context: "Infrastructure subscription renews in 3 days ($240/mo). Cloud database bandwidth usage is up 12% following Sprint 7 deployment.",
        estimatedTime: "1 minute",
        actions: [
            { label: "Approve Renewal", actionPrompt: "Approve the Stripe $240/mo infrastructure subscription renewal.", primary: true },
            { label: "Optimize Cloud Budget", actionPrompt: "Run an AI cloud budget optimization scan on our database infrastructure.", primary: false },
        ]
    },
    {
        id: "d4",
        title: "Team Needs Feedback",
        badge: "⚠️ Slack Mention",
        badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        source: "Slack • #design channel",
        sourceIcon: SlackBadgeIcon,
        context: "The design team uploaded 3 logo icon variations in #design. Sarah and Mike are waiting for your choice to finalize brand guidelines.",
        estimatedTime: "45 seconds",
        actions: [
            { label: "Send Logo Choice", actionPrompt: "Post feedback in #design choosing Logo Variation A for the new brand.", primary: true },
            { label: "Auto-Summarize Thread", actionPrompt: "Summarize the latest 8 messages in the Slack #design channel.", primary: false },
        ]
    },
    {
        id: "d5",
        title: "Today's Executive Ingestion Summary",
        badge: "🤖 PAL Summary",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        source: "PAL Intelligence Engine",
        sourceIcon: PalSparkleIcon,
        context: "PAL ingested and processed 26 emails, 8 Slack mentions, 2 urgent messages, and 4 calendar updates today. Routine newsletters and spam were auto-archived.",
        estimatedTime: "Complete",
        actions: [
            { label: "View Daily Ingestion Log", actionPrompt: "Show me the detailed log of auto-archived communications for today.", primary: true },
            { label: "Ask PAL a Question", actionPrompt: "Help me review my communication priorities for today.", primary: false },
        ]
    }
];

const CALENDAR_ITEMS: CalendarItemData[] = [
    {
        id: "cal-1",
        time: "09:15 - 11:45 AM",
        title: "Sprint 8 Architecture Review",
        source: "Google Calendar",
        sourceColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        avatars: ["/assets/avatar_user.png", "/assets/avatar_member_1.png", "/assets/avatar_member_2.png"],
        hasVideoCall: true,
    },
    {
        id: "cal-2",
        time: "12:45 - 03:00 PM",
        title: "Base App Launch Strategy",
        source: "Outlook Calendar",
        sourceColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
        avatars: ["/assets/avatar_user.png", "/assets/avatar_member_1.png"],
        hasVideoCall: true,
    },
    {
        id: "cal-3",
        time: "04:30 - 05:30 PM",
        title: "Investor Pitch Alignment Call",
        source: "Apple Calendar",
        sourceColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        avatars: ["/assets/avatar_user.png", "/assets/avatar_member_2.png"],
        hasVideoCall: true,
    }
];

const EXTRACTED_TASKS: ExtractedTaskData[] = [
    { id: "t1", title: "Sign off Base App auth design review", due: "5:00 PM Today", priority: "HIGH", source: "Gmail", sourceBadge: "bg-red-500/10 text-red-400 border-red-500/20" },
    { id: "t2", title: "Review #design logo icon mockups", due: "6:30 PM Today", priority: "MEDIUM", source: "Slack", sourceBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { id: "t3", title: "Prepare Q2 financial appendix for pitch deck", due: "Tomorrow 10:00 AM", priority: "HIGH", source: "Calendar", sourceBadge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
];

const AI_RECOMMENDED_ACTIONS = [
    { label: "Reply to John", prompt: "Draft a quick reply to John at Base regarding the auth mockups." },
    { label: "Approve Design", prompt: "Approve the Base App auth design review." },
    { label: "Pay Stripe Invoice", prompt: "Review and confirm Stripe subscription payment." },
    { label: "Reschedule Sprint", prompt: "Propose rescheduling tomorrow's sprint call." },
    { label: "Generate Draft Response", prompt: "Generate an executive draft response for all unread client emails." }
];

// ─── 1. DAILY EXECUTIVE BRIEF HEADER ─────────────────────────

function DailyExecutiveBriefHeader() {
    return (
        <div className="bg-gradient-to-r from-[#0C121E] via-[#101726] to-[#0A0F1A] border border-blue-500/20 rounded-[24px] p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 inline-block mb-1.5">
                        Executive AI Briefing
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight">Good morning, Emmanuel.</h2>
                </div>
                <div className="w-9 h-9 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] flex items-center justify-center shrink-0">
                    <PalSparkleIcon size={18} animate={true} />
                </div>
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-300 leading-relaxed font-medium">
                <p>• You have <strong className="text-white font-bold">3 meetings</strong> scheduled today.</p>
                <p>• <strong className="text-white font-bold">2 clients</strong> need urgent email replies.</p>
                <p>• One invoice expires tomorrow. Design team is waiting for approval.</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase tracking-wider">Estimated time to clear:</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    ⏱ 18 minutes
                </span>
            </div>
        </div>
    );
}

// ─── 2. EXECUTIVE DECISION CAROUSEL (3D STACKED DEPTH) ────────

function ExecutiveDecisionCarousel({ onSelectAction }: { onSelectAction: (prompt: string) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeCard = DECISION_CARDS[currentIndex];
    const CardIcon = activeCard.sourceIcon;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % DECISION_CARDS.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + DECISION_CARDS.length) % DECISION_CARDS.length);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
                    AI Decision Briefings ({currentIndex + 1} / {DECISION_CARDS.length})
                </span>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handlePrev}
                        className="w-7 h-7 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Previous Briefing"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-7 h-7 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Next Briefing"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* 3D Stacked Container */}
            <div className="relative w-full min-h-[260px] flex items-center justify-center">

                {/* Back Stack Layer 2 */}
                <div className="absolute inset-x-4 top-4 bottom-0 bg-[#0B0F17] border border-white/5 rounded-[28px] opacity-40 scale-[0.92] translate-y-3 pointer-events-none" />

                {/* Back Stack Layer 1 */}
                <div className="absolute inset-x-2 top-2 bottom-0 bg-[#101622] border border-white/10 rounded-[28px] opacity-70 scale-[0.96] translate-y-1.5 pointer-events-none" />

                {/* Active Active Stack Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCard.id}
                        initial={{ opacity: 0, x: 40, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -40, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="relative z-10 w-full bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 shadow-2xl space-y-4"
                    >
                        {/* Top Badge & Source Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CardIcon className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="text-[11px] font-bold text-[var(--app-text-secondary)]">{activeCard.source}</span>
                            </div>
                            <span className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeCard.badgeColor}`}>
                                {activeCard.badge}
                            </span>
                        </div>

                        {/* Decision Title */}
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">{activeCard.title}</h3>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                                {activeCard.context}
                            </p>
                        </div>

                        {/* Estimated Time Badge */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--app-text-muted)] pt-1">
                            <Clock size={12} className="text-blue-400" />
                            <span>Estimated review time: <strong className="text-white">{activeCard.estimatedTime}</strong></span>
                        </div>

                        {/* Action Buttons Stack */}
                        <div className="space-y-2 pt-2 border-t border-[var(--app-card-border)]">
                            {activeCard.actions.map((act, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => onSelectAction(act.actionPrompt)}
                                    className={`w-full py-2.5 px-4 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                                        act.primary
                                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-[var(--app-card-alt)] border border-[var(--app-card-border)] hover:border-zinc-500 text-zinc-200"
                                    }`}
                                >
                                    <span>{act.label}</span>
                                    <Send size={12} className="shrink-0" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Pager Dots */}
            <div className="flex justify-center items-center gap-1.5 pt-1">
                {DECISION_CARDS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentIndex === i ? "w-6 bg-blue-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                        }`}
                        aria-label={`Go to briefing ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── 3. UNIVERSAL CALENDAR TIMELINE (INSPIRED BY REF 1) ───────

function UniversalCalendarTimeline() {
    const [selectedDate, setSelectedDate] = useState("Thu 15");
    const dates = [
        { day: "Tue", num: "13" },
        { day: "Wed", num: "14" },
        { day: "Thu", num: "15", active: true },
        { day: "Fri", num: "16" },
        { day: "Sun", num: "17" },
    ];

    return (
        <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Universal Executive Calendar</h3>
                </div>
                <span className="text-[9.5px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    Aggregated Schedule
                </span>
            </div>

            {/* Horizontal Month & Date Strip */}
            <div className="space-y-2">
                <div className="text-center text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
                    ‹ January 2026 ›
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {dates.map((d, i) => {
                        const isSelected = selectedDate === `${d.day} ${d.num}`;
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(`${d.day} ${d.num}`)}
                                className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-white text-black font-black shadow-lg shadow-white/10 scale-105"
                                        : "bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-zinc-400 hover:text-white"
                                }`}
                            >
                                <span className="text-[9px] font-bold uppercase tracking-wider">{d.day}</span>
                                <span className="text-base font-black mt-0.5">{d.num}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Integrated Time-Block Schedule Timeline */}
            <div className="space-y-3 pt-2">
                <span className="text-[9.5px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest block">
                    Schedule for {selectedDate}
                </span>

                <div className="space-y-3 relative pl-3 border-l-2 border-zinc-800">
                    {CALENDAR_ITEMS.map((item) => (
                        <div key={item.id} className="relative space-y-1">
                            {/* Time badge */}
                            <span className="text-[10px] font-bold text-blue-400 block">{item.time}</span>

                            {/* Meeting Card */}
                            <div className="bg-[var(--app-card-alt)] border border-[var(--app-card-border)] rounded-2xl p-3.5 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                                    {item.hasVideoCall && (
                                        <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                                            <Video size={12} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    {/* Source badge */}
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${item.sourceColor}`}>
                                        {item.source}
                                    </span>

                                    {/* Avatars */}
                                    <AvatarGroup avatars={item.avatars.map((a) => ({ src: a, name: "Team Member" }))} size={22} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── 4. EXTRACTED TASK LIST ───────────────────────────────────

function ExtractedTaskList({ onSelectTask }: { onSelectTask: (prompt: string) => void }) {
    return (
        <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 space-y-3.5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Extracted Action Tasks</h3>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    3 Pending
                </span>
            </div>

            <div className="space-y-2.5">
                {EXTRACTED_TASKS.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => onSelectTask(`Act on extracted task: ${task.title}`)}
                        className="bg-[var(--app-card-alt)] border border-[var(--app-card-border)] hover:border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                    >
                        <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-[var(--app-text-muted)] font-medium">Due: {task.due}</span>
                                <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${task.sourceBadge}`}>
                                    {task.source}
                                </span>
                            </div>
                        </div>

                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            task.priority === "HIGH" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}>
                            {task.priority}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── 5. AI RECOMMENDATION SECTION ─────────────────────────────

function AIRecommendationSection({ onSelectAction }: { onSelectAction: (prompt: string) => void }) {
    return (
        <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest pl-1 block">
                PAL AI Recommended Actions
            </span>

            <div className="flex flex-wrap gap-2">
                {AI_RECOMMENDED_ACTIONS.map((rec, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onSelectAction(rec.prompt)}
                        className="px-3.5 py-2 rounded-full bg-[var(--app-card)] border border-[var(--app-card-border)] hover:border-blue-400 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                        <Zap size={12} className="text-blue-400" />
                        <span>{rec.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── MAIN COMMUNICATION WORKSPACE COMPONENT ───────────────────

interface CommunicationWorkspaceProps {
    provider?: string;
    initialTab?: string;
}

export default function CommunicationWorkspace({ provider = "gmail" }: CommunicationWorkspaceProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSelectAction = (prompt: string) => {
        localStorage.setItem("chat_incoming_prompt", prompt);
        router.push("/chat");
    };

    return (
        <div className="w-full max-w-[430px] mx-auto space-y-5 px-1">
            {/* 1. Daily Executive Brief Header */}
            <DailyExecutiveBriefHeader />

            {/* 2. Executive Decision Carousel (Stacked 3D Depth Cards) */}
            <ExecutiveDecisionCarousel onSelectAction={handleSelectAction} />

            {/* 3. Swipe Up / Expand Workspace Trigger */}
            <div className="flex justify-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-xs font-bold text-blue-400 hover:text-white transition-colors cursor-pointer"
                >
                    <span>{isExpanded ? "Collapse Expanded Workspace" : "Expand Full Universal Workspace"}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Expanded Content Section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-5 overflow-hidden"
                    >
                        {/* 4. Universal Executive Calendar & Timeline */}
                        <UniversalCalendarTimeline />

                        {/* 5. Extracted Task List */}
                        <ExtractedTaskList onSelectTask={handleSelectAction} />

                        {/* 6. AI Recommended Actions */}
                        <AIRecommendationSection onSelectAction={handleSelectAction} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
