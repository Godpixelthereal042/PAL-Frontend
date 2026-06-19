"use client";

import React, { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Sparkles, 
    AlertCircle, 
    RefreshCw, 
    BarChart2, 
    ShieldCheck, 
    ToggleLeft, 
    ToggleRight, 
    X, 
    Check, 
    Settings2, 
    Info 
} from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

// Inline brand SVGs - clean outline styles
function SlackIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(2, 2) scale(0.83)">
                <path d="M5.042 15.165a1.828 1.828 0 1 1-1.829-1.828h1.829v1.828zm0 1.22a1.828 1.828 0 0 1 1.828-1.828h5.485a1.828 1.828 0 1 1 0 3.656H8.09a1.828 1.828 0 0 1-1.828-1.828z" fill="#36C5F0"/>
                <path d="M8.87 5.042a1.828 1.828 0 1 1 1.829-1.829v1.829H8.87zm0 1.22a1.828 1.828 0 0 1 1.829 1.828v5.486a1.828 1.828 0 1 1-3.657 0V8.09a1.828 1.828 0 0 1 1.828-1.828z" fill="#2EB67D"/>
                <path d="M18.958 8.87a1.828 1.828 0 1 1 1.829 1.829h-1.829V8.87zm-1.22 0a1.828 1.828 0 0 1-1.828 1.829h-5.486a1.828 1.828 0 1 1 0-3.657h5.486a1.828 1.828 0 0 1 1.828 1.828z" fill="#E01E5A"/>
                <path d="M15.13 18.958a1.828 1.828 0 1 1-1.829 1.829v-1.829h1.829zm0-1.22a1.828 1.828 0 0 1-1.829-1.828v-5.486a1.828 1.828 0 1 1 3.657 0v5.486a1.828 1.828 0 0 1-1.828 1.828z" fill="#ECB22E"/>
            </g>
        </svg>
    );
}

interface ConnectScreenProps {
    source: string;
}

export default function ConnectScreen({ source }: ConnectScreenProps) {
    const router = useRouter();
    const [isSynced, setIsSynced] = useState(false);
    const [isAutoSync, setIsAutoSync] = useState(false);

    // States for Slack sync manager
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [isReminderSet, setIsReminderSet] = useState(false);
    const [syncedMessages, setSyncedMessages] = useState(0);

    // States for Google Calendar sync
    const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
    const [googleSyncSuccess, setGoogleSyncSuccess] = useState(false);

    const handleGoogleSync = async () => {
        setIsGoogleSyncing(true);
        setGoogleSyncSuccess(false);
        try {
            const res = await fetch("/api/integrations/google-calendar", {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                setGoogleSyncSuccess(true);
                alert(`${data.count} calendar events synced successfully!`);
            }
        } catch (err) {
            console.error("Google Calendar sync failed", err);
        } finally {
            setIsGoogleSyncing(false);
            setTimeout(() => setGoogleSyncSuccess(false), 2000);
        }
    };
    
    const currentSource = source.toLowerCase();

    // Fetch connection status on mount
    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch(`/api/integrations?source=${currentSource}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setIsSynced(data.isSynced === 1 || data.isSynced === true);
                        setIsAutoSync(data.isAutoSync === 1 || data.isAutoSync === true);
                        setSyncedMessages(data.syncedMessages);
                    }
                }
            } catch (err) {
                console.error("Failed to load integration status", err);
            }
        }
        fetchStatus();
    }, [currentSource]);

    const handleToggleSynced = async () => {
        const nextVal = !isSynced;
        setIsSynced(nextVal);
        try {
            await fetch("/api/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: currentSource, isSynced: nextVal })
            });
        } catch (err) {
            console.error("Error updating connection status", err);
        }
    };

    const handleToggleAutoSync = async () => {
        const nextVal = !isAutoSync;
        setIsAutoSync(nextVal);
        try {
            await fetch("/api/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: currentSource, isAutoSync: nextVal })
            });
        } catch (err) {
            console.error("Error updating auto-sync status", err);
        }
    };

    // Slack-specific Sync Action
    const handleSlackSync = () => {
        if (isSyncing) return;
        setIsSyncing(true);
        setSyncSuccess(false);
        
        setTimeout(async () => {
            setIsSyncing(false);
            setSyncSuccess(true);
            const nextCount = syncedMessages + 14;
            setSyncedMessages(nextCount); // Simulate 14 new messages ingested
            
            try {
                await fetch("/api/integrations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: currentSource, syncedMessages: nextCount })
                });
            } catch (err) {
                console.error("Error saving synced message count", err);
            }
            
            setTimeout(() => {
                setSyncSuccess(false);
            }, 3000);
        }, 1800);
    };

    // Source configurations for general view
    const sourceInfo: Record<string, { name: string; title: string; color: string; desc: string; stats: string; recommend: string; action: string }> = {
        gmail: {
            name: "Gmail Sync",
            title: "Google Mail",
            color: "text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/20",
            desc: "Extract key client emails, meeting requests, and project updates directly into the co-founder workspace.",
            stats: "Inbox connected, 142 client threads analyzed",
            recommend: "A client from AlphaCorp is requesting a pitch update. Shall we draft a project report to email back?",
            action: "Draft Email Response"
        },
        excel: {
            name: "Excel Database",
            title: "Microsoft Excel",
            color: "text-[#107C41] bg-[#107C41]/10 border-[#107C41]/20",
            desc: "Import spreadsheets, revenue figures, and inventory tables into the business analytics engine.",
            stats: "4 workbooks linked, 28 sheets active",
            recommend: "Q2 expense sheet indicates a 12% rise in infrastructure cost. Optimize cloud budget research?",
            action: "Optimize Cloud Budget"
        },
        google: {
            name: "Google Workspace",
            title: "Google Drive & Sheets",
            color: "text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20",
            desc: "Synchronize company documents, investor sheets, and product briefs securely.",
            stats: "Drive connected, 88 documents indexed",
            recommend: "Google Briefing Doc mentions competitor funding. Run research on competitor investment strategies?",
            action: "Run Competitor Research"
        },
        notion: {
            name: "Notion Workspace",
            title: "Notion Pages",
            color: "text-[#111] bg-white/10 border-white/20",
            desc: "Sync product roadmaps, meeting notes, and knowledge bases for conversational retrieval.",
            stats: "3 databases linked, 42 pages indexed",
            recommend: "Roadmap shows launch deadline is June 30th. Generate a milestone reminder alert for the team?",
            action: "Generate Alert"
        },
        x: {
            name: "X (Twitter) Channel",
            title: "X Analytics",
            color: "text-white bg-white/10 border-white/20",
            desc: "Track social impressions, schedule posts, and receive post recommendations for audience building.",
            stats: "Profile connected, 12K impressions tracked",
            recommend: "Your post on Web3 scalability performed 40% above benchmark. Auto-generate a follow-up thread?",
            action: "Generate X Thread"
        },
        facebook: {
            name: "Facebook Marketing",
            title: "Facebook Ads",
            color: "text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/20",
            desc: "Track ad performance, lead generation metrics, and schedule social media product marketing.",
            stats: "Ad Account connected, 3 active campaigns",
            recommend: "Campaign 'Base App Launch' has a 4.2% CTR. Allocate remaining budget to this ad set?",
            action: "Optimize Ad Budget"
        },
        apple: {
            name: "Apple Calendar",
            title: "iCloud Calendar",
            color: "text-white bg-white/10 border-white/20",
            desc: "Sync meeting blocks, client calls, and schedule events into the controlled calendar layout.",
            stats: "iCloud synced, 12 calendars monitored",
            recommend: "You have a product launch review tomorrow at 18:00. Generate notes templates?",
            action: "Generate Meeting Notes"
        }
    };

    // RENDER 1: Specialized Slack Sync Manager (Adapting HoPOn Ride Share Timeline)
    if (currentSource === "slack") {
        return (
            <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
                
                {/* Header (Adapting top logo/dismiss row) */}
                <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                    <button
                        onClick={() => router.push("/")}
                        className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-all cursor-pointer"
                        aria-label="Back to home"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    
                    {/* App Branding */}
                    <div className="flex items-center gap-1.5">
                        <SlackIcon className="w-5 h-5" />
                        <span className="text-sm font-black tracking-wider text-white">Slack Sync</span>
                    </div>

                    <button
                        onClick={() => router.push("/")}
                        className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[var(--app-text-secondary)] hover:text-white transition-all cursor-pointer"
                        aria-label="Close Sync Manager"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Main Scrollable Workspace Container */}
                <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 space-y-5 scrollbar-hide relative">
                    
                    {/* Top grabbed-bar visual indicator */}
                    <div className="flex justify-center -mt-1 mb-2">
                        <div className="w-12 h-1 bg-zinc-800 rounded-full opacity-60" />
                    </div>

                    {/* Workspace Status Card (Adapting Lara Larsson Driver card layout) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-4 relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                        {/* Top Info Section */}
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-center">
                                {/* Slack Logo inside Avatar circle */}
                                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#1b1c24] to-[#121318] border border-[var(--app-card-border)] flex items-center justify-center shadow-md shrink-0">
                                    <SlackIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white tracking-wide">Pal HQ Workspace</h2>
                                    <span className="text-[10px] text-[var(--app-text-secondary)] mt-0.5 block">pal-hq.slack.com</span>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs justify-end">
                                    <span className="text-[#3b82f6]">★</span> 4.9 <span className="text-[9px] text-[var(--app-text-muted)] font-normal ml-0.5">(active)</span>
                                </div>
                                <span className="text-[10px] text-[var(--app-text-muted)] mt-1 block">API Version: v2</span>
                            </div>
                        </div>

                        {/* Badges block */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--app-card-border)]">
                            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck size={11} className="text-blue-400" /> Verified API
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real-time active
                            </div>
                        </div>
                    </motion.div>

                    {/* Sync Logs Timeline (Adapting Passenger timeline layout) */}
                    <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]">Sync Timeline</h3>
                            <span className="text-[10px] text-blue-400 font-semibold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">Active Channels</span>
                        </div>

                        {/* Vertical Timeline Nodes */}
                        <div className="relative pl-7 pr-1 py-1 space-y-6">
                            
                            {/* Vertical connecting line */}
                            <div className="absolute left-[9px] top-3 bottom-3 w-[1.5px] bg-zinc-800" />
                            
                            {/* Glowing Active Track Line */}
                            <motion.div 
                                className="absolute left-[9px] top-3 w-[1.5px] bg-gradient-to-b from-[#3b82f6] via-[#E01E5A] to-transparent"
                                animate={isSyncing ? { height: ["25%", "85%", "25%"] } : { height: "45%" }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            />                            {syncedMessages === 0 ? (
                                <div className="text-xs text-[var(--app-text-secondary)] py-6 text-center pr-4 leading-relaxed">
                                    No channel logs active. Click "Sync Now" below to download team logs.
                                </div>
                            ) : (
                                <>
                                    {/* Node 1: #engineering (Active Pickup Style Node) */}
                                    <div className="relative flex justify-between items-start">
                                        {/* Dot indicator */}
                                        <div className="absolute -left-7 top-1">
                                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-[#07080a] flex items-center justify-center shadow-[0_0_8px_#3b82f6]">
                                                <motion.div 
                                                    className="w-2.5 h-2.5 rounded-full bg-blue-500" 
                                                    animate={isSyncing ? { scale: [1, 1.25, 1] } : {}}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="pr-4">
                                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Primary Channel</span>
                                            <span className="text-xs font-bold text-white mt-0.5 block">#engineering</span>
                                            <span className="text-[11px] text-[var(--app-text-secondary)] mt-1 block leading-relaxed italic bg-zinc-900/40 p-1.5 rounded border border-[var(--app-card-border)]">
                                                "Deploying staging v1.9.3 for final verification tests."
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-bold text-zinc-300">02:14 AM</span>
                                            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5 uppercase tracking-wider">(in sync)</span>
                                        </div>
                                    </div>

                                    {/* Node 2: #general (Passenger 2 Style Node) */}
                                    <div className="relative flex justify-between items-start">
                                        {/* Dot indicator */}
                                        <div className="absolute -left-7 top-1">
                                            <div className="w-5 h-5 rounded-full border-2 border-[#E01E5A] bg-[#07080a] flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-[#E01E5A]/80" />
                                            </div>
                                        </div>
                                        <div className="pr-4">
                                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Channel Sync</span>
                                            <span className="text-xs font-bold text-white mt-0.5 block">#general</span>
                                            <span className="text-[11px] text-[var(--app-text-secondary)] mt-0.5 block">
                                                "All Hands agenda is updated in Google Docs."
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-semibold text-[var(--app-text-secondary)]">02:10 AM</span>
                                        </div>
                                    </div>

                                    {/* Node 3: #design (Passenger 3 Style Node) */}
                                    <div className="relative flex justify-between items-start">
                                        {/* Dot indicator */}
                                        <div className="absolute -left-7 top-1">
                                            <div className="w-5 h-5 rounded-full border-2 border-[#ECB22E] bg-[#07080a] flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-[#ECB22E]/80" />
                                            </div>
                                        </div>
                                        <div className="pr-4">
                                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Channel Sync</span>
                                            <span className="text-xs font-bold text-white mt-0.5 block">#design</span>
                                            <span className="text-[11px] text-[var(--app-text-secondary)] mt-0.5 block">
                                                "Reviewed Figma mockups for co-founder workspace."
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-semibold text-[var(--app-text-secondary)]">01:55 AM</span>
                                        </div>
                                    </div>

                                    {/* Node 4: #random (Dropoff Style Node) */}
                                    <div className="relative flex justify-between items-start">
                                        {/* Dot indicator */}
                                        <div className="absolute -left-7 top-1">
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                            </div>
                                        </div>
                                        <div className="pr-4">
                                            <span className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Channel Sync</span>
                                            <span className="text-xs font-bold text-white mt-0.5 block">#random</span>
                                            <span className="text-[11px] text-[var(--app-text-muted)] mt-0.5 block">
                                                "Found this hilarious productivity meme!"
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-semibold text-[var(--app-text-muted)]">Yesterday</span>
                                            <span className="text-[9px] text-[var(--app-text-muted)] block mt-0.5 uppercase tracking-wider">(Archived)</span>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                    {/* Sync Stats Card (Adapting Mint/Green Fare Split Card) */}
                    <div className="bg-gradient-to-br from-[#0a231d] to-[#04100c] border border-emerald-500/20 rounded-[24px] p-5 relative overflow-hidden flex flex-col items-center justify-center text-center">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Synced Data Volume</span>
                        
                        {/* Messages Counter (Increments dynamically upon successful sync!) */}
                        <div className="text-2xl font-black tracking-tight text-white mt-1.5 flex items-baseline gap-1">
                            <span>{syncedMessages.toLocaleString()}</span>
                            <span className="text-xs font-normal text-[var(--app-text-secondary)]">messages</span>
                        </div>

                        {/* Stats Breakdown Sub-badge */}
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-0.5 rounded-full mt-2">
                            x 14 channels connected
                        </span>

                        {/* Extra latency details from Fare Split breakdown */}
                        <div className="grid grid-cols-2 gap-6 w-full mt-4 pt-3 border-t border-[#10b981]/10 text-left">
                            <div>
                                <span className="text-[9px] font-semibold text-[var(--app-text-muted)] uppercase block">Bandwidth</span>
                                <span className="text-xs font-bold text-zinc-300 mt-0.5 block">14.2 MB</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-semibold text-[var(--app-text-muted)] uppercase block">Latency</span>
                                <span className="text-xs font-bold text-zinc-300 mt-0.5 block">180ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Set Reminder Row (Adapting Set Reminder Row layout) */}
                    <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[22px] p-4 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-white block">Auto-Sync Intervals</span>
                            <span className="text-[10px] text-[var(--app-text-muted)] mt-0.5 block">Trigger workspace ingestion automatically.</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsReminderSet(prev => !prev)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isReminderSet 
                                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                                    : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                            }`}
                        >
                            {isReminderSet ? "10m Active" : "Set Interval"}
                        </button>
                    </div>

                    {/* Action row at bottom */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => router.push("/analytics")}
                            className="w-[52px] h-[52px] rounded-full border border-[var(--app-card-border)] bg-[#121419] text-[var(--app-text-secondary)] hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Analytics & Details"
                        >
                            <BarChart2 size={20} />
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleSlackSync}
                            className={`flex-1 h-[52px] rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                isSyncing 
                                    ? "bg-zinc-800 text-[var(--app-text-muted)] border border-zinc-700 cursor-not-allowed" 
                                    : syncSuccess
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-white text-black hover:bg-zinc-200 shadow-lg"
                            }`}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin text-[var(--app-text-muted)]" />
                                    <span>Syncing Workspace...</span>
                                </>
                            ) : syncSuccess ? (
                                <>
                                    <Check size={14} className="text-white font-bold" />
                                    <span>Sync Complete!</span>
                                </>
                            ) : (
                                <span>Sync Now</span>
                            )}
                        </button>
                    </div>

                </div>

                <BottomNav activePage="home" />
            </div>
        );
    }

    // RENDER 2: General View (for all other sources)
    const getDynamicConfig = () => {
        const base = sourceInfo[currentSource] || {
            name: `${source.toUpperCase()} Connection`,
            title: source.toUpperCase(),
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
            desc: "Connect and sync your database records and project brief channels.",
            stats: "Database connected, sync status online",
            recommend: "Channel synced successfully. Review logs in the chat workspace.",
            action: "Open Chat"
        };

        if (!isSynced) {
            return {
                ...base,
                stats: "Not connected",
                recommend: `Connect ${base.title} to analyze data patterns and surface co-founder recommendations.`,
                action: "Connect Node"
            };
        }

        switch (currentSource) {
            case "gmail":
                return {
                    ...base,
                    stats: "Inbox connected, 0 client threads analyzed",
                    recommend: "Connected successfully. Monitoring inbox for key updates.",
                    action: "Check Inbox"
                };
            case "excel":
                return {
                    ...base,
                    stats: "Excel linked, 0 sheets active",
                    recommend: "Connected successfully. Waiting to import sheets...",
                    action: "Link Sheets"
                };
            case "google":
                return {
                    ...base,
                    stats: "Drive connected, 0 documents indexed",
                    recommend: "Connected successfully. Synchronizing Drive documents...",
                    action: "Analyze Drive"
                };
            case "notion":
                return {
                    ...base,
                    stats: "Notion connected, 0 pages indexed",
                    recommend: "Connected successfully. Synchronizing Notion databases...",
                    action: "Sync Notion"
                };
            case "x":
                return {
                    ...base,
                    stats: "Profile connected, 0 impressions tracked",
                    recommend: "Connected successfully. Tracking social media impressions...",
                    action: "Check Analytics"
                };
            case "facebook":
                return {
                    ...base,
                    stats: "Ad Account connected, 0 active campaigns",
                    recommend: "Connected successfully. Tracking marketing campaigns...",
                    action: "Link Ad Account"
                };
            case "apple":
                return {
                    ...base,
                    stats: "iCloud connected, 0 calendars monitored",
                    recommend: "Connected successfully. Syncing calendar blocks...",
                    action: "View Calendar"
                };
            default:
                return base;
        }
    };

    const config = getDynamicConfig();

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#161616] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-base font-bold text-white tracking-wide">Sync Manager</h1>
                <div className="w-[44px]" />
            </div>

            {/* Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-6 scrollbar-hide">
                
                {/* Sync Header Info Card */}
                <div className="bg-[#111720] border border-[var(--app-card-border)] rounded-[24px] p-5 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className={`p-4 rounded-full border mb-4 shrink-0 ${config.color} shadow-lg shadow-black/30`}>
                        <BarChart2 size={32} />
                    </div>
                    
                    <h2 className="text-lg font-bold text-white">{config.name}</h2>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#51d4ff] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10 mt-1">
                        {config.title}
                    </span>
                    
                    <p className="text-xs text-[var(--app-text-secondary)] mt-4 leading-relaxed max-w-[320px]">
                        {config.desc}
                    </p>
                </div>

                {/* Connection Status & Sync Preferences */}
                <div className="bg-[#111720] border border-[var(--app-card-border)] rounded-[22px] p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]">Connection Settings</h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-1.5 border-b border-[var(--app-card-border)] last:border-0">
                            <div>
                                <span className="text-xs font-semibold text-white block">Connection Status</span>
                                <span className="text-[10px] text-[var(--app-text-muted)]">Enable or disable this sync node</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleSynced}
                                className="text-blue-400 hover:text-white transition-colors cursor-pointer"
                            >
                                {isSynced ? (
                                    <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                        <ShieldCheck size={12} /> Sync On
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                        <AlertCircle size={12} /> Synced Off
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b border-[var(--app-card-border)] last:border-0">
                            <div>
                                <span className="text-xs font-semibold text-white block">Real-time Auto Sync</span>
                                <span className="text-[10px] text-[var(--app-text-muted)]">Fetch changes instantly</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleAutoSync}
                                className="text-[var(--app-text-secondary)] cursor-pointer"
                            >
                                {isAutoSync ? <ToggleRight size={32} className="text-[#51d4ff]" /> : <ToggleLeft size={32} className="text-gray-600" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sync stats card */}
                <div className="bg-[#111720] border border-[var(--app-card-border)] rounded-[22px] p-5 flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Database Sync Volume</span>
                        <div className="text-xs font-semibold text-white mt-1">{config.stats}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold bg-blue-500/5 border border-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        <RefreshCw size={11} className="animate-spin text-blue-400" /> Active
                    </div>
                </div>

                {/* AI growth engine recommendations */}
                <div className="bg-gradient-to-br from-[#0c244a] to-[#041126] border border-blue-500/20 rounded-[24px] p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#51d4ff]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Co-Founder Insights</h3>
                    </div>
                    
                    <p className="text-xs text-blue-200/90 leading-relaxed">
                        {config.recommend}
                    </p>

                    {currentSource === "google" ? (
                        <button
                            type="button"
                            onClick={handleGoogleSync}
                            className="w-full h-[42px] rounded-full bg-gradient-to-r from-[#2d7fe0] to-[#1a6ecf] text-xs font-bold text-white shadow-lg shadow-blue-500/20 uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                            disabled={isGoogleSyncing}
                        >
                            {isGoogleSyncing ? (
                                <>
                                    <RefreshCw size={12} className="animate-spin text-white" />
                                    <span>Syncing Calendar...</span>
                                </>
                            ) : googleSyncSuccess ? (
                                <>
                                    <Check size={12} className="text-white" />
                                    <span>Sync Complete!</span>
                                </>
                            ) : (
                                <span>Sync Google Calendar Now</span>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.setItem("chat_incoming_prompt", `Let's work on ${config.action} for my connected data:\n\n* ${config.recommend}`);
                                router.push("/chat");
                            }}
                            className="w-full h-[42px] rounded-full bg-gradient-to-r from-[#2d7fe0] to-[#1a6ecf] text-xs font-bold text-white shadow-lg shadow-blue-500/20 uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {config.action}
                        </button>
                    )}
                </div>
            </div>

            <BottomNav activePage="home" />
        </div>
    );
}
