"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    Calendar,
    Clock,
    Users,
    Briefcase,
    BarChart3,
    Target,
    ArrowUpRight,
} from "lucide-react";
import { PalSparkleIcon, PalLogoIcon, AvatarGroup } from "@/components/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BottomNav from "./BottomNav";
import { motion } from "framer-motion";

// ─── Count-Up Hook ───────────────────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 300, decimals = 0) {
    const [value, setValue] = useState(0);
    const frameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const startTime = performance.now();
            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutQuart
                const eased = 1 - Math.pow(1 - progress, 4);
                setValue(parseFloat((eased * target).toFixed(decimals)));
                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                }
            };
            frameRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [target, duration, delay, decimals]);

    return value;
}

// ─── Stagger Container ──────────────────────────────────────
const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const fadeSlideUp = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
};

// ─── Chart Data ─────────────────────────────────────────────
const CHART_DATA: Record<string, { path: string; fillPath: string; values: number[]; labels: string[]; dotX: number; dotY: number; total: string; growth: string }> = {
    "7d": {
        path: "M 20 80 C 60 75, 100 60, 140 55 S 220 40, 260 35 S 340 28, 400 22",
        fillPath: "M 20 80 C 60 75, 100 60, 140 55 S 220 40, 260 35 S 340 28, 400 22 L 400 100 L 20 100 Z",
        values: [12, 15, 18, 22, 19, 25, 28],
        labels: ["Mon", "Wed", "Fri", "Sun"],
        dotX: 400, dotY: 22,
        total: "$4.2K", growth: "+8.3%"
    },
    "30d": {
        path: "M 20 70 C 70 65, 100 50, 150 55 S 200 35, 250 30 S 320 22, 400 18",
        fillPath: "M 20 70 C 70 65, 100 50, 150 55 S 200 35, 250 30 S 320 22, 400 18 L 400 100 L 20 100 Z",
        values: [8, 12, 10, 15, 18, 14, 22, 25, 20, 28, 32, 30],
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        dotX: 400, dotY: 18,
        total: "$24.5K", growth: "+12.4%"
    },
    "90d": {
        path: "M 20 85 C 80 78, 120 60, 180 50 S 260 30, 320 25 S 370 18, 400 12",
        fillPath: "M 20 85 C 80 78, 120 60, 180 50 S 260 30, 320 25 S 370 18, 400 12 L 400 100 L 20 100 Z",
        values: [5, 8, 12, 10, 18, 22, 20, 28, 32, 35, 38, 42],
        labels: ["Month 1", "Month 2", "Month 3"],
        dotX: 400, dotY: 12,
        total: "$68.2K", growth: "+18.2%"
    }
};

// ─── Weekly Bar Data ────────────────────────────────────────
const WEEKLY_BARS = [
    { day: "M", value: 65 },
    { day: "T", value: 80 },
    { day: "W", value: 45 },
    { day: "T", value: 90 },
    { day: "F", value: 70 },
    { day: "S", value: 30 },
    { day: "S", value: 20 },
];

export default function AnalyticsScreen() {
    const router = useRouter();
    const [activeInterval, setActiveInterval] = useState<"7d" | "30d" | "90d">("30d");
    const currentChart = CHART_DATA[activeInterval];

    // Count-up values
    const healthScore = useCountUp(87, 1400, 400);
    const revenue = useCountUp(24.5, 1200, 500, 1);
    const growth = useCountUp(18.2, 1200, 600, 1);
    const activeProjects = useCountUp(6, 800, 700);
    const tasksCompleted = useCountUp(24, 1000, 800);
    const tasksTotal = useCountUp(32, 1000, 800);
    const teamProductivity = useCountUp(92, 1200, 900);

    // Donut ring animation
    const circumference = 2 * Math.PI * 42;
    const healthOffset = circumference - (circumference * (87 / 100));

    const insights = [
        { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", text: "Revenue trending 12% above monthly target." },
        { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/15", text: "Design approval needed for Base App auth flow." },
        { icon: Lightbulb, color: "text-blue-400", bg: "bg-blue-500/15", text: "Consider automating weekly sprint reports." },
    ];

    const deadlines = [
        { project: "Base App", task: "Auth Flow Redesign", date: "Aug 3", color: "bg-blue-500" },
        { project: "Marketing Site", task: "Launch v2.0", date: "Aug 8", color: "bg-emerald-500" },
        { project: "Analytics API", task: "Endpoint Review", date: "Aug 12", color: "bg-amber-500" },
    ];

    const members = [
        { name: "Emmanuel", avatar: "/assets/avatar_user.png" },
        { name: "Sarah", avatar: "/assets/avatar_member_1.png" },
        { name: "Mike", avatar: "/assets/avatar_member_2.png" },
    ];

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative overflow-hidden flex flex-col font-outfit">

            {/* ─── Header ────────────────────────────────────── */}
            <div className="flex justify-between items-center px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0 z-30">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-sm font-bold text-[var(--app-text)] uppercase tracking-wider">Executive Dashboard</h1>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--app-card-border)] cursor-pointer hover:scale-105 transition-transform">
                    <Image src="/assets/avatar_user.png" alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* ─── Scrollable Dashboard ──────────────────────── */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto px-4 pb-28 pt-2 space-y-4 scrollbar-hide"
            >

                {/* ═══ Section 1: Business Health Hero ═══════════ */}
                <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-6 relative overflow-hidden">
                    {/* Subtle glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Business Health</span>
                            <div className="flex items-baseline gap-1.5 mt-2">
                                <span className="text-5xl font-black tracking-tight text-white">{healthScore}</span>
                                <span className="text-sm font-bold text-[var(--app-text-muted)]">/ 100</span>
                            </div>
                            <span className="text-[10px] text-[var(--app-text-muted)] mt-2 block">Updated 2h ago</span>
                        </div>

                        {/* Animated Donut Ring */}
                        <div className="relative w-24 h-24 shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--app-card-alt)" strokeWidth="6" />
                                <motion.circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="#2D7FE0"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: healthOffset }}
                                    transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <PalSparkleIcon size={20} className="text-blue-400" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ Section 2: Revenue & Growth Bento ═════════ */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[22px] p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                <TrendingUp size={12} className="text-emerald-400" />
                            </div>
                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Revenue</span>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-black tracking-tight text-white">${revenue}K</span>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowUpRight size={11} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400">+12.4%</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[22px] p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center">
                                <BarChart3 size={12} className="text-blue-400" />
                            </div>
                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Growth</span>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-black tracking-tight text-emerald-400">+{growth}%</span>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp size={11} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-[var(--app-text-muted)]">vs last month</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ═══ Section 3: Performance Trend Chart ════════ */}
                <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest block">Performance</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black tracking-tight text-white">{currentChart.total}</span>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15">
                                    {currentChart.growth}
                                </span>
                            </div>
                        </div>
                        {/* Interval Picker */}
                        <div className="flex bg-[var(--app-card-alt)] border border-[var(--app-card-border)] p-0.5 rounded-full">
                            {(["7d", "30d", "90d"] as const).map(interval => (
                                <button
                                    key={interval}
                                    onClick={() => setActiveInterval(interval)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                        activeInterval === interval
                                            ? "bg-white text-black shadow-sm"
                                            : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                    }`}
                                >
                                    {interval}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart SVG */}
                    <div className="h-[120px] w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 420 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="pal-chart-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2D7FE0" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#2D7FE0" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {/* Gradient Fill */}
                            <motion.path
                                key={`fill-${activeInterval}`}
                                d={currentChart.fillPath}
                                fill="url(#pal-chart-fill)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            />
                            {/* Line */}
                            <motion.path
                                key={`line-${activeInterval}`}
                                d={currentChart.path}
                                fill="none"
                                stroke="#2D7FE0"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            />
                            {/* Active Dot */}
                            <motion.circle
                                key={`dot-${activeInterval}`}
                                cx={currentChart.dotX} cy={currentChart.dotY} r="4.5"
                                fill="#2D7FE0"
                                stroke="var(--app-card)"
                                strokeWidth="2"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                            />
                        </svg>
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider px-1">
                        {currentChart.labels.map((label, i) => (
                            <span key={i}>{label}</span>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ Section 4: Projects & Tasks Bento ═════════ */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[22px] p-5">
                        <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center">
                                <Briefcase size={12} className="text-blue-400" />
                            </div>
                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Projects</span>
                        </div>
                        <span className="text-3xl font-black tracking-tight text-white block">{activeProjects}</span>
                        <span className="text-[10px] font-semibold text-[var(--app-text-muted)] mt-1 block">Active now</span>
                    </motion.div>

                    <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[22px] p-5">
                        <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                <Target size={12} className="text-emerald-400" />
                            </div>
                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Tasks</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tight text-white">{tasksCompleted}</span>
                            <span className="text-sm font-bold text-[var(--app-text-muted)]">/ {tasksTotal}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-[var(--app-card-alt)] rounded-full h-1.5 mt-3 overflow-hidden">
                            <motion.div
                                className="bg-emerald-500 h-full rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "75%" }}
                                transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* ═══ Section 5: Team Productivity ══════════════ */}
                <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest block">Team Productivity</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black tracking-tight text-white">{teamProductivity}%</span>
                                <span className="text-[10px] font-bold text-emerald-400">↑ 4%</span>
                            </div>
                        </div>
                        <div className="flex items-center -space-x-2">
                            {members.map((m, i) => (
                                <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--app-card)] shadow-sm" style={{ zIndex: members.length - i }}>
                                    <Image src={m.avatar} alt={m.name} width={32} height={32} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-[var(--app-card-alt)] border-2 border-[var(--app-card)] flex items-center justify-center text-[9px] font-bold text-blue-400">
                                +2
                            </div>
                        </div>
                    </div>

                    {/* Weekly Activity Mini Bars */}
                    <div className="flex items-end gap-2 h-16 mt-2">
                        {WEEKLY_BARS.map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                <motion.div
                                    className="w-full rounded-md bg-blue-500/80"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${bar.value}%` }}
                                    transition={{ duration: 0.4, delay: 1.0 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    style={{ minHeight: 4 }}
                                />
                                <span className="text-[8px] font-bold text-[var(--app-text-muted)] uppercase">{bar.day}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ Section 6: PAL Insights ═══════════════════ */}
                <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <PalSparkleIcon size={16} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">PAL Insights</span>
                    </div>
                    <div className="space-y-3.5">
                        {insights.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2 + i * 0.1 }}
                                className="flex items-start gap-3"
                            >
                                <div className={`w-6 h-6 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                    <item.icon size={12} strokeWidth={2.5} />
                                </div>
                                <span className="text-xs font-medium text-[var(--app-text-secondary)] leading-relaxed">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ Section 7: Upcoming Deadlines ═════════════ */}
                <motion.div variants={fadeSlideUp} className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={16} className="text-[var(--app-text-muted)]" />
                        <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Upcoming Deadlines</span>
                    </div>
                    <div className="space-y-3">
                        {deadlines.map((d, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 + i * 0.1 }}
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${d.color} shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-white block truncate group-hover:text-blue-400 transition-colors">{d.task}</span>
                                    <span className="text-[10px] text-[var(--app-text-muted)] font-semibold">{d.project}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Clock size={10} className="text-[var(--app-text-muted)]" />
                                    <span className="text-[10px] font-bold text-[var(--app-text-muted)]">{d.date}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </motion.div>

            <BottomNav activePage="home" />
        </div>
    );
}
