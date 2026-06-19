"use client";

import React, { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Zap, 
    Sparkles, 
    TrendingUp, 
    Users, 
    MessageSquare, 
    Briefcase,
    Search,
    Plus,
    X,
    Sliders,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    ArrowDown,
    Activity,
    Check,
    LayoutGrid,
    Database,
    Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface MetricRow {
    category: string;
    value: string;
    change: string;
    type: "up" | "down" | "neutral";
}

const DEFAULT_CHART_DATA = {
    "7d": {
        total: "0",
        growth: "0%",
        newUsers: "0",
        bounceRate: "0%",
        tooltipText: "No data",
        path: "M 10 100 L 410 100",
        fillPath: "M 10 100 L 410 100 L 410 110 L 10 110 Z",
        labels: ["-", "-", "-"],
        dotX: 410,
        dotY: 100
    },
    "12d": {
        total: "0",
        growth: "0%",
        newUsers: "0",
        bounceRate: "0%",
        tooltipText: "No data",
        path: "M 10 100 L 410 100",
        fillPath: "M 10 100 L 410 100 L 410 110 L 10 110 Z",
        labels: ["-", "-", "-"],
        dotX: 410,
        dotY: 100
    },
    "30d": {
        total: "0",
        growth: "0%",
        newUsers: "0",
        bounceRate: "0%",
        tooltipText: "No data",
        path: "M 10 100 L 410 100",
        fillPath: "M 10 100 L 410 100 L 410 110 L 10 110 Z",
        labels: ["-", "-", "-"],
        dotX: 410,
        dotY: 100
    }
};

export default function AnalyticsScreen() {
    const router = useRouter();

    // Navigation, search, and filter chip states
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeChips, setActiveChips] = useState(["Social", "Ingestions", "Recommendations"]);
    const [showAddMetricModal, setShowAddMetricModal] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Active chart intervals (7d, 12d, 30d)
    const [activeChartInterval, setActiveChartInterval] = useState<"7d" | "12d" | "30d">("12d");

    // Dynamic metrics based on time interval
    const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
    const [healthIndex, setHealthIndex] = useState(0);
    const [growthRate, setGrowthRate] = useState(0.0);
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalIngestions, setTotalIngestions] = useState(0);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch("/api/analytics");
                if (res.ok) {
                    const data = await res.json();
                    if (data.chartData) setChartData(data.chartData);
                    if (data.healthIndex !== undefined) setHealthIndex(data.healthIndex);
                    if (data.totalProjects !== undefined) setTotalProjects(data.totalProjects);
                    if (data.totalIngestions !== undefined) setTotalIngestions(data.totalIngestions);
                    // Compute a dynamic growth rate matching total messages synced
                    if (data.totalIngestions) {
                        const calculatedGrowth = (data.totalIngestions / 200).toFixed(1);
                        setGrowthRate(parseFloat(calculatedGrowth));
                    }
                }
            } catch (err) {
                console.error("Error loading analytics data", err);
            }
        }
        fetchAnalytics();
    }, []);

    const currentChart = chartData[activeChartInterval];

    // AI Suggestions from original layout or dynamic setup recommendations
    const suggestions = (totalProjects === 0 && totalIngestions === 0) ? [
        {
            id: 1,
            title: "Setup Calendar Sync",
            desc: "No events are currently scheduled. Connect Google Calendar to automatically synchronize project deadlines, syncs, and availabilities.",
            action: "Sync Calendar",
            icon: Briefcase,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
        },
        {
            id: 2,
            title: "Create Your First Project",
            desc: "Break down your first business idea or goal into priorities, milestones, and actionable tasks automatically.",
            action: "Create Project",
            icon: Sparkles,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
        },
        {
            id: 3,
            title: "Start Slack Sync Node",
            desc: "Monitor development or stakeholder chat threads to surface automated co-founder feedback, actions, and summaries.",
            action: "Connect Slack",
            icon: MessageSquare,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        }
    ] : [
        {
            id: 1,
            title: "Competitor Intelligence",
            desc: "Competitor X just launched a conversational checkout system. Run a deep dive analysis?",
            action: "Analyze checkout",
            icon: Briefcase,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
        },
        {
            id: 2,
            title: "Social Growth Recommendation",
            desc: "Your thread on Ethereum gas optimizations gained 40% more impressions than average. Generate a follow-up series?",
            action: "Generate thread",
            icon: Sparkles,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
        },
        {
            id: 3,
            title: "Team Alignment Alert",
            desc: "The Slack dev channel has 8 unreviewed design assets. Auto-summarize feedback?",
            action: "Summarize feedback",
            icon: MessageSquare,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        }
    ];

    const filteredSuggestions = suggestions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleChip = (chip: string) => {
        if (activeChips.includes(chip)) {
            setActiveChips(activeChips.filter(c => c !== chip));
        } else {
            setActiveChips([...activeChips, chip]);
        }
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header Area (Adapting top logo/bell/search layout) */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 backdrop-blur-md border-b border-[var(--app-card-border)]" style={{ backgroundColor: 'var(--app-header-bg)' }}>
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[var(--app-accent)] hover:bg-[var(--app-accent-soft)] transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>
                
                {/* Branding text or search box */}
                <AnimatePresence mode="wait">
                    {isSearching ? (
                        <motion.input
                            key="search-input"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "180px", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter insights..."
                            className="bg-[var(--app-input-bg)] border border-[var(--app-input-border)] text-[var(--app-text)] rounded-full px-3 py-1 text-xs outline-none focus:border-blue-500/50"
                            autoFocus
                        />
                    ) : (
                        <motion.h1 
                            key="title-header"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-base font-bold text-[var(--app-text)] tracking-wide"
                        >
                            Insights & Analytics
                        </motion.h1>
                    )}
                </AnimatePresence>

                {/* Right side items: Search button toggler, PRO Badge & User Avatar */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setIsSearching(prev => !prev);
                            if (isSearching) setSearchQuery("");
                        }}
                        className={`grid h-[40px] w-[40px] place-items-center rounded-full border transition-all cursor-pointer ${
                            isSearching 
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-400" 
                                : "border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                        }`}
                        aria-label="Search widgets"
                    >
                        {isSearching ? <X size={16} /> : <Search size={16} />}
                    </button>
                    
                    {/* PRO badge from original screen */}
                    <div className="flex items-center gap-1 bg-[#0a1f40] px-2.5 py-1 rounded-full border border-blue-500/20 shrink-0">
                        <Zap size={10} className="text-blue-400 fill-current" />
                        <span className="text-[9px] font-bold text-blue-100 uppercase tracking-wider">PRO</span>
                    </div>

                    <div className="w-8 h-8 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] overflow-hidden relative shrink-0">
                        <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" 
                            alt="User Profile" 
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--app-bg)]" />
                    </div>
                </div>
            </div>

            {/* Filter Chips row (Adapting active filter pills row) */}
            <div className="px-4 py-2 bg-[var(--app-surface)] border-b border-[var(--app-card-border)] flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
                <button
                    onClick={() => setActiveChips(["Social", "Ingestions", "Recommendations"])}
                    className="h-8 w-8 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] shrink-0 relative transition-all"
                >
                    <Sliders size={13} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">2</span>
                </button>

                {["Social", "Ingestions", "Recommendations"].map((chip) => {
                    const isActive = activeChips.includes(chip);
                    return (
                        <button
                            key={chip}
                            onClick={() => toggleChip(chip)}
                            className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
                                isActive 
                                    ? "bg-[var(--app-text)] text-[var(--app-bg)] border-[var(--app-text)]" 
                                    : "bg-[var(--app-card-alt)] text-[var(--app-text-muted)] border-[var(--app-card-border)] hover:border-[var(--app-text-muted)]"
                            }`}
                        >
                            <span>{chip}</span>
                            {isActive && <X size={10} className="text-[var(--app-bg)] opacity-60 hover:opacity-100" />}
                        </button>
                    );
                })}
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-5 scrollbar-hide relative">
                
                {/* Hero Card: Co-Founder Audit (Adapting Sales Performance widget stack) */}
                {activeChips.includes("Social") && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 relative overflow-hidden"
                    >
                        {/* Overlay subtle color blot */}
                        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                        {/* Top stack: User Avatars overlap & Option Dots */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center -space-x-2">
                                <div className="w-7 h-7 rounded-full border-2 border-[var(--app-card)] bg-[var(--app-card-alt)] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=60&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-7 h-7 rounded-full border-2 border-[var(--app-card)] bg-[var(--app-card-alt)] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=60&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-7 h-7 rounded-full border-2 border-[var(--app-card)] bg-[var(--app-card-alt)] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=60&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-7 h-7 rounded-full border-2 border-[var(--app-card)] bg-[var(--app-card-alt)] text-blue-300 font-bold text-[9px] flex items-center justify-center">
                                    +3
                                </div>
                            </div>

                            <button 
                                className="w-8 h-8 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                                aria-label="More options"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                        </div>

                        {/* Middle Header and metrics badge */}
                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <span className="text-[10px] text-[var(--app-text-muted)] block">Updated 2h ago</span>
                                <h3 className="text-base font-bold text-[var(--app-text)] mt-1 leading-tight">Business Health Performance</h3>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-[var(--app-text)] block">8</span>
                                <span className="text-[9px] text-[var(--app-text-muted)] uppercase tracking-wider block mt-0.5">Widgets</span>
                            </div>
                        </div>

                        {/* Split KPI sub-cards & overlapping plus button */}
                        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[var(--app-card-border)] relative">
                            
                            {/* Card 1: Co-Founder Score */}
                            <div className="bg-[var(--app-card-alt)] border border-[var(--app-card-border)] rounded-[20px] p-4 flex flex-col justify-between">
                                <div className="flex items-center gap-1.5 text-[var(--app-text-muted)]">
                                    <Sparkles size={13} className="text-blue-400" />
                                    <span className="text-[9.5px] uppercase tracking-wider font-semibold">Health Index</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-2xl font-black tracking-tight text-[var(--app-text)]">{healthIndex}</span>
                                    <span className="text-[10px] text-[var(--app-text-muted)] font-bold">/ 100</span>
                                </div>
                            </div>

                            {/* Card 2: Growth Rate */}
                            <div className="bg-[var(--app-card-alt)] border border-[var(--app-card-border)] rounded-[20px] p-4 flex flex-col justify-between">
                                <div className="flex items-center gap-1.5 text-[var(--app-text-muted)]">
                                    <TrendingUp size={13} className="text-emerald-400" />
                                    <span className="text-[9.5px] uppercase tracking-wider font-semibold">Growth Rate</span>
                                </div>
                                <span className="text-2xl font-black tracking-tight text-emerald-400 mt-3 block">+{growthRate}%</span>
                            </div>

                            {/* Floating overlapping plus button right on the border line */}
                            <button
                                onClick={() => setShowAddMetricModal(true)}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[15px] w-9 h-9 rounded-full bg-[var(--app-text)] text-[var(--app-bg)] border-[3.5px] border-[var(--app-card)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg z-20 cursor-pointer" style={{ boxShadow: 'var(--app-shadow-lg)' }}
                                title="Add Custom Widget"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Users Ingestion Widget Card (Adapting Users line chart layout from IMG_2567.JPG) */}
                {activeChips.includes("Ingestions") && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 space-y-4"
                    >
                        {/* Title and active interval toggle switcher */}
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Workspace Users</span>
                            
                            {/* Standard 3-pill button interval picker */}
                            <div className="flex bg-[var(--app-card-alt)] border border-[var(--app-card-border)] p-0.5 rounded-full">
                                {["7d", "12d", "30d"].map((interval) => (
                                    <button
                                        key={interval}
                                        onClick={() => setActiveChartInterval(interval as "7d" | "12d" | "30d")}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                            activeChartInterval === interval
                                                ? "bg-[var(--app-text)] text-[var(--app-bg)] shadow-sm"
                                                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                        }`}
                                    >
                                        {interval}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main statistics header */}
                        <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-3xl font-black tracking-tight text-[var(--app-text)]">{currentChart.total}</span>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                {currentChart.growth}
                            </span>
                        </div>

                        {/* Interactive Neon-Green Line Chart SVG */}
                        <div className="h-[120px] w-full mt-2 relative">
                            {/* Chart Canvas */}
                            <svg className="w-full h-full" viewBox="0 0 420 110" preserveAspectRatio="none">
                                <defs>
                                    {/* Emerald-green gradient fill */}
                                    <linearGradient id="chart-fill-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                    {/* Muted gridline filter */}
                                    <linearGradient id="gridline-gradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.01)" />
                                        <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                                    </linearGradient>
                                </defs>

                                {/* Gridlines */}
                                <line x1="0" y1="30" x2="420" y2="30" stroke="url(#gridline-gradient)" strokeWidth="1" strokeDasharray="4,4" />
                                <line x1="0" y1="70" x2="420" y2="70" stroke="url(#gridline-gradient)" strokeWidth="1" strokeDasharray="4,4" />

                                {/* Filled Gradient Area under path */}
                                <motion.path
                                    key={`fill-${activeChartInterval}`}
                                    initial={{ d: "M 10 100 L 410 100 Z", opacity: 0 }}
                                    animate={{ d: currentChart.fillPath, opacity: 1 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    fill="url(#chart-fill-gradient)"
                                />

                                {/* Line Path */}
                                <motion.path
                                    key={`path-${activeChartInterval}`}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    d={currentChart.path}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />

                                {/* Active Highlight Glowing Point */}
                                <motion.circle
                                    key={`dot-${activeChartInterval}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    cx={currentChart.dotX}
                                    cy={currentChart.dotY}
                                    r="5"
                                    fill="#10b981"
                                    stroke="var(--app-card)"
                                    strokeWidth="1.5"
                                    className="shadow-glow"
                                />
                            </svg>

                            {/* Chart Tooltip bubble pinned above dot */}
                            <motion.div 
                                key={`tooltip-${activeChartInterval}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{ left: `${(currentChart.dotX / 420) * 100 - 14}%`, top: `${(currentChart.dotY / 110) * 100 - 32}%` }}
                                className="absolute bg-white text-zinc-950 font-extrabold text-[9px] px-2 py-0.5 rounded shadow-lg shadow-black/80 uppercase tracking-wide border border-zinc-200 pointer-events-none w-max z-10"
                            >
                                {currentChart.tooltipText}
                            </motion.div>

                            {/* X-Axis Labels */}
                            <div className="flex justify-between items-center text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider px-2 mt-2">
                                <span>{currentChart.labels[0]}</span>
                                <span>{currentChart.labels[1]}</span>
                                <span>{currentChart.labels[2]}</span>
                            </div>
                        </div>

                        {/* Breakdown Metrics rows */}
                        <div className="pt-4 border-t border-[var(--app-card-border)] space-y-2.5">
                            
                            {/* Row 1: Active Leads */}
                            <div className="flex justify-between items-center py-0.5">
                                <div className="flex items-center gap-2 text-[var(--app-text-secondary)]">
                                    <div className="p-1 rounded-md bg-[var(--app-card-alt)] border border-[var(--app-card-border)]">
                                        <Users size={12} className="text-blue-400" />
                                    </div>
                                    <span className="text-xs font-semibold">Active Leads</span>
                                </div>
                                <span className="text-xs font-bold text-[var(--app-text)]">{currentChart.newUsers}</span>
                            </div>

                            {/* Row 2: Bounce Rate */}
                            <div className="flex justify-between items-center py-0.5">
                                <div className="flex items-center gap-2 text-[var(--app-text-secondary)]">
                                    <div className="p-1 rounded-md bg-[var(--app-card-alt)] border border-[var(--app-card-border)]">
                                        <ArrowDown size={12} className="text-zinc-500" />
                                    </div>
                                    <span className="text-xs font-semibold">Bounce Rate</span>
                                </div>
                                <span className="text-xs font-bold text-[var(--app-text)]">{currentChart.bounceRate}</span>
                            </div>

                        </div>

                        {/* Card Detail expander button */}
                        <button
                            onClick={() => setIsDetailOpen(true)}
                            className="w-full py-2.5 rounded-full border border-[var(--app-card-border)] hover:bg-[var(--app-card-alt)] text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-secondary)] hover:text-[var(--app-text)] flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer"
                        >
                            <span>View Details</span>
                            <ArrowUpRight size={12} />
                        </button>
                    </motion.div>
                )}

                {/* AI Suggestions / Recommendations (from original screen but redesigned) */}
                {activeChips.includes("Recommendations") && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)] pl-1">Co-Founder Recommendations</h3>
                        
                        <div className="space-y-3">
                            {filteredSuggestions.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={item.id} 
                                        className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[22px] p-4 flex gap-3.5 items-start relative overflow-hidden"
                                    >
                                        <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                                            <IconComponent size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-[var(--app-text)] leading-snug">{item.title}</h4>
                                            <p className="text-[11px] text-[var(--app-text-secondary)] mt-1 leading-relaxed">{item.desc}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (item.action === "Sync Calendar") {
                                                        router.push("/connect/google");
                                                    } else if (item.action === "Create Project") {
                                                        router.push("/projects");
                                                    } else if (item.action === "Connect Slack") {
                                                        router.push("/connect/slack");
                                                    } else {
                                                        localStorage.setItem("chat_incoming_prompt", `Let's work on ${item.title}:\n\n* ${item.desc}`);
                                                        router.push("/chat");
                                                    }
                                                }}
                                                className="mt-3 text-[10px] font-bold text-[var(--app-accent)] hover:text-[var(--app-text)] transition-colors cursor-pointer bg-[var(--app-card-alt)] border border-[var(--app-card-border)] px-3.5 py-1.5 rounded-full uppercase tracking-wider"
                                            >
                                                {item.action}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {filteredSuggestions.length === 0 && (
                                <div className="text-center py-6 text-[var(--app-text-muted)] text-xs">
                                    No recommendations match your search.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-Up Drawer for ADD CUSTOM METRIC Modal */}
            <AnimatePresence>
                {showAddMetricModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddMetricModal(false)}
                            className="absolute inset-0 bg-black z-40"
                        />

                        {/* Modal container */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="absolute bottom-0 left-0 right-0 max-h-[70%] bg-[var(--app-card)] border-t border-[var(--app-card-border)] rounded-t-[32px] p-6 z-50 overflow-y-auto"
                        >
                            {/* Drag bar visual */}
                            <div className="flex justify-center -mt-2 mb-4">
                                <div className="w-10 h-1 bg-[var(--app-divider)] rounded-full" />
                            </div>

                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-sm font-bold text-[var(--app-text)] uppercase tracking-wider">Add Custom Metric</h3>
                                <button
                                    onClick={() => setShowAddMetricModal(false)}
                                    className="p-1 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4 pb-6">
                                <span className="text-[10px] text-[var(--app-text-muted)] uppercase font-bold tracking-wider block">Available Widgets</span>
                                
                                <div className="space-y-2">
                                    {[
                                        { title: "Database Ingestion Volume", type: "Database", icon: <Database size={15} className="text-amber-400" /> },
                                        { title: "Engagement Rate Widgets", type: "Social", icon: <LayoutGrid size={15} className="text-blue-400" /> },
                                        { title: "Server Infrastructure Burn", type: "Infrastructure", icon: <Activity size={15} className="text-emerald-400" /> }
                                    ].map((widget, i) => {
                                        const isAlreadyActive = activeChips.includes(widget.type);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    toggleChip(widget.type);
                                                    setShowAddMetricModal(false);
                                                }}
                                                className="w-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] hover:border-[var(--app-text-muted)] p-3.5 rounded-2xl flex justify-between items-center text-left hover:bg-[var(--app-surface)] transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-card-border)] shrink-0">
                                                        {widget.icon}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-[var(--app-text)] block">{widget.title}</span>
                                                        <span className="text-[10px] text-[var(--app-text-muted)] mt-0.5 block">Category: {widget.type}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {isAlreadyActive ? (
                                                        <div className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">Active</div>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border border-[var(--app-card-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                                                            <Plus size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Slide-Up Drawer for VIEW DETAILS Modal */}
            <AnimatePresence>
                {isDetailOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute inset-0 bg-black z-40"
                        />

                        {/* Modal container */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="absolute bottom-0 left-0 right-0 max-h-[80%] bg-[var(--app-card)] border-t border-[var(--app-card-border)] rounded-t-[32px] p-6 z-50 overflow-y-auto"
                        >
                            {/* Drag bar visual */}
                            <div className="flex justify-center -mt-2 mb-4">
                                <div className="w-10 h-1 bg-[var(--app-divider)] rounded-full" />
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-[var(--app-text)] uppercase tracking-wider">In-depth User Acquisition</h3>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="p-1 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4 pb-6">
                                <p className="text-xs text-[var(--app-text-secondary)] leading-relaxed">
                                    Analytics reports show a total of **{chartData[activeChartInterval].total}** active workspace ingestions. This represents a healthy **{chartData[activeChartInterval].growth}** lift in the current time-window.
                                </p>
                                
                                <div className="bg-[var(--app-card-alt)] border border-[var(--app-card-border)] rounded-2xl p-4 space-y-3">
                                    <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase tracking-wider block">Cohort Performance</span>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] text-[var(--app-text-secondary)] block">Active Co-Founders</span>
                                            <span className="text-sm font-bold text-[var(--app-text)] mt-1 block">8 active accounts</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-[var(--app-text-secondary)] block">Avg. Session Latency</span>
                                            <span className="text-sm font-bold text-[var(--app-text)] mt-1 block">182ms</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-2">
                                    <button
                                        onClick={() => setIsDetailOpen(false)}
                                        className="flex-1 h-[44px] rounded-full bg-[var(--app-text)] text-[var(--app-bg)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:opacity-90 cursor-pointer"
                                    >
                                        <Check size={14} /> Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav activePage="home" />
        </div>
    );
}
