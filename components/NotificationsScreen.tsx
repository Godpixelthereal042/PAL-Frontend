"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Bell, 
    Trash2, 
    Search, 
    Check, 
    X, 
    Smartphone, 
    Sparkles, 
    CheckCircle2, 
    ChevronRight, 
    Volume2, 
    Moon, 
    Sun,
    Heart,
    Grid,
    Navigation,
    UserPlus,
    Clock,
    ArrowUpRight,
    Sparkle
} from "lucide-react";
import BottomNav from "./BottomNav";

// Custom Icon Box components matching the premium aesthetics
function IconBox({ type }: { type: "heart" | "grid" | "verified" | "map" }) {
    if (type === "heart") {
        return (
            <div className="w-[50px] h-[50px] bg-[#121212] rounded-[14px] flex items-center justify-center shrink-0 shadow-md border border-[var(--app-card-border)]">
                <Heart className="w-5 h-5 text-[#FF3B30] fill-[#FF3B30]" />
            </div>
        );
    }
    if (type === "grid") {
        return (
            <div className="w-[50px] h-[50px] bg-[#121212] rounded-[14px] flex items-center justify-center shrink-0 shadow-md border border-[var(--app-card-border)]">
                <div className="grid grid-cols-2 gap-[3px]">
                    <div className="w-2 h-2 rounded-[2px] bg-[#4CD964]" />
                    <div className="w-2 h-2 rounded-[2px] bg-[#4CD964]" />
                    <div className="w-2 h-2 rounded-[2px] bg-[#4CD964]" />
                    <div className="w-2 h-2 rounded-[2px] bg-[#4CD964]" />
                </div>
            </div>
        );
    }
    if (type === "map") {
        return (
            <div className="w-[50px] h-[50px] bg-[#121212] rounded-[14px] flex items-center justify-center shrink-0 shadow-md border border-[var(--app-card-border)]">
                <div className="w-5 h-5 rounded-full border-[3.5px] border-[#4CD964] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#4CD964]" />
                </div>
            </div>
        );
    }
    // Verified checkmark
    return (
        <div className="w-[50px] h-[50px] bg-[#121212] rounded-[14px] flex items-center justify-center shrink-0 shadow-md border border-[var(--app-card-border)]">
            <div className="w-[22px] h-[22px] bg-[#34A853] rounded-full flex items-center justify-center border-2 border-[#121212]">
                <Check className="w-[12px] h-[12px] text-white stroke-[3px]" />
            </div>
        </div>
    );
}

// Brand SVG helpers
function GoogleAssistantIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="12" r="2" fill="#4285F4" />
            <circle cx="11.5" cy="11.5" r="3" fill="#EA4335" />
            <circle cx="17.5" cy="10.5" r="2.5" fill="#FBBC05" />
            <circle cx="21" cy="8" r="1.2" fill="#34A853" />
        </svg>
    );
}

function AlexaIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#00CAFF" strokeWidth="2" />
            <path d="M9 11.5c1-1.5 2.5-2 3-2s2 .5 3 2c0 0-1 1-3 1s-3-1-3-1z" fill="#00CAFF" />
        </svg>
    );
}

function AppleLogoIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 13.9c-.03-1.95 1.59-2.88 1.66-2.93-1.07-1.57-2.73-1.78-3.32-1.83-1.42-.15-2.77.83-3.49.83-.72 0-1.85-.82-3.05-.8-1.58.02-3.04.93-3.85 2.34-1.64 2.85-.42 7.06 1.17 9.35.78 1.12 1.69 2.37 2.9 2.33 1.18-.05 1.63-.76 3.05-.76 1.42 0 1.83.76 3.07.74 1.25-.02 2.06-1.13 2.82-2.24.89-1.28 1.25-2.52 1.27-2.58-.03-.01-2.45-.94-2.48-3.73zM15.42 7.15c.63-.76 1.05-1.82.93-2.87-.9.04-1.99.6-2.63 1.35-.58.67-.99 1.74-.87 2.78.99.08 2.0-.51 2.57-1.26" />
        </svg>
    );
}

interface NotificationItem {
    id: string;
    title: string;
    text: string;
    time: string;
    isUnread: boolean;
    section: "Today" | "This week";
    iconType: "heart" | "grid" | "verified" | "map";
    actionLabel?: string;
    actionRoute?: string;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"inbox" | "customise">("inbox");

    // Product-aligned notifications (Pal AI Co-founder)
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (err) {
                console.error("Failed to load notifications", err);
            }
        }
        fetchNotifications();
    }, []);

    // Customisation Tab State
    const [customiseSettings, setCustomiseSettings] = useState({
        lockScreen: true,
        badge: true,
        popUp: true,
        projectUpdates: true,
        dailyMotives: false,
        achievements: false
    });

    const [activeAssistant, setActiveAssistant] = useState<"google" | "apple" | "alexa" | null>("google");
    const [showInviteModal, setShowInviteModal] = useState(false);
    
    // Notification Detail States
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Click handler for opening a notification
    const handleNotificationClick = async (item: NotificationItem) => {
        // Mark as read immediately in UI
        setNotifications(prev =>
            prev.map(n => (n.id === item.id ? { ...n, isUnread: false } : n))
        );
        setSelectedNotification(item);
        setShowDetailModal(true);

        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id })
            });
        } catch (err) {
            console.error("Error marking notification as read", err);
        }
    };

    // Delete a notification from detail view
    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setShowDetailModal(false);
        setSelectedNotification(null);

        try {
            await fetch(`/api/notifications?id=${id}`, {
                method: "DELETE"
            });
        } catch (err) {
            console.error("Error deleting notification", err);
        }
    };

    // Clear all alerts
    const clearAll = async () => {
        setNotifications([]);
        try {
            await fetch("/api/notifications", {
                method: "DELETE"
            });
        } catch (err) {
            console.error("Error clearing all notifications", err);
        }
    };

    const toggleSetting = (key: keyof typeof customiseSettings) => {
        setCustomiseSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const unreadCount = notifications.filter(n => n.isUnread).length;

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-5 pb-3 shrink-0 z-30 bg-[#0d0f14]/80 backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#161616] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <h1 className="text-base font-bold text-white tracking-wide">Alerts Center</h1>
                
                {activeTab === "inbox" && notifications.length > 0 ? (
                    <button
                        onClick={clearAll}
                        className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#161616] text-[var(--app-text-muted)] hover:text-red-400 transition-all cursor-pointer"
                        aria-label="Clear all notifications"
                    >
                        <Trash2 size={16} />
                    </button>
                ) : (
                    <div className="w-[44px]" />
                )}
            </div>

            {/* Sliding Custom Tabs Switcher */}
            <div className="px-4 py-3 bg-[#0d0f14] shrink-0 border-b border-[var(--app-card-border)] flex items-center justify-between">
                <div className="relative flex p-1 bg-[var(--app-card)] rounded-full w-[240px] border border-[var(--app-card-border)]">
                    {/* Active Sliding Pill */}
                    <div 
                        className="absolute top-1 bottom-1 rounded-full bg-[#3b82f6] transition-all duration-300"
                        style={{
                            left: activeTab === "inbox" ? "4px" : "118px",
                            width: "118px"
                        }}
                    />
                    <button
                        onClick={() => setActiveTab("inbox")}
                        className={`relative z-10 w-[118px] text-center py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            activeTab === "inbox" ? "text-white" : "text-[var(--app-text-secondary)] hover:text-gray-200"
                        }`}
                    >
                        Inbox {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                    <button
                        onClick={() => setActiveTab("customise")}
                        className={`relative z-10 w-[118px] text-center py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            activeTab === "customise" ? "text-white" : "text-[var(--app-text-secondary)] hover:text-gray-200"
                        }`}
                    >
                        Customize
                    </button>
                </div>

                {/* Boosters Preview Trigger (Only visible in Customise tab) */}
                {activeTab === "customise" && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-[10px] uppercase font-bold tracking-wider text-white shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                        <Smartphone size={11} /> Boosters UI
                    </button>
                )}
            </div>

            {/* Scrollable Content Workspace */}
            <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-[#090a0f]">
                <AnimatePresence mode="wait">
                    
                    {/* INBOX TAB */}
                    {activeTab === "inbox" && (
                        <motion.div
                            key="inbox-tab"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-full pb-28 pt-2 px-1 bg-[#090a0f] text-gray-100"
                        >
                            {/* Header details */}
                            <div className="px-4 py-4 flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-white">
                                        Notifications
                                    </h2>
                                    {unreadCount > 0 && (
                                        <span className="w-6 h-6 rounded-full bg-[#FF3B30] text-white text-[12px] font-bold flex items-center justify-center shadow-sm animate-pulse-glow">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {notifications.length > 0 ? (
                                <div className="space-y-6">
                                    
                                    {/* Today Section */}
                                    {notifications.filter(n => n.section === "Today").length > 0 && (
                                        <div>
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider px-4 mb-2 text-[var(--app-text-muted)]">
                                                Today
                                            </h3>
                                            <div className="divide-y divide-current/5">
                                                {notifications.filter(n => n.section === "Today").map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleNotificationClick(item)}
                                                        className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors relative border-b border-[var(--app-card-border)]"
                                                    >
                                                        <IconBox type={item.iconType} />
                                                        <div className="flex-1 pr-6">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#51d4ff]">{item.title}</span>
                                                                <span className="text-[9px] text-[var(--app-text-muted)]">• {item.time}</span>
                                                            </div>
                                                            <p className="text-[13px] leading-snug font-medium mt-1 text-gray-200">
                                                                {item.text}
                                                            </p>
                                                        </div>
                                                        {item.isUnread && (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] absolute right-4 shadow-sm" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* This Week Section */}
                                    {notifications.filter(n => n.section === "This week").length > 0 && (
                                        <div>
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider px-4 mb-2 text-[var(--app-text-muted)]">
                                                This week
                                            </h3>
                                            <div className="divide-y divide-current/5">
                                                {notifications.filter(n => n.section === "This week").map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleNotificationClick(item)}
                                                        className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors relative border-b border-[var(--app-card-border)]"
                                                    >
                                                        <IconBox type={item.iconType} />
                                                        <div className="flex-1 pr-6">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#51d4ff]">{item.title}</span>
                                                                <span className="text-[9px] text-[var(--app-text-muted)]">• {item.time}</span>
                                                            </div>
                                                            <p className="text-[13px] leading-snug font-medium mt-1 text-gray-200">
                                                                {item.text}
                                                            </p>
                                                        </div>
                                                        {item.isUnread && (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] absolute right-4 shadow-sm" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 mb-4 bg-white/5 border-[var(--app-card-border)] text-[var(--app-text-secondary)]">
                                        <Bell className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-base font-bold">Inbox is empty</h4>
                                    <p className="text-xs mt-1.5 max-w-[220px] leading-relaxed text-[var(--app-text-secondary)]">
                                        You don't have any notifications right now. Enjoy your peace!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* CUSTOMISE TAB */}
                    {activeTab === "customise" && (
                        <motion.div
                            key="customise-tab"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 space-y-6 pb-28 text-gray-200"
                        >
                            {/* Part A: Choice to Customise Display */}
                            <div className="space-y-3">
                                <div>
                                    <h2 className="text-xl font-extrabold text-white leading-tight">
                                        Choice To Customise Notification Display
                                    </h2>
                                    <p className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-widest font-bold mt-1">
                                        LockScreen, Badge, Pop Ups
                                    </p>
                                </div>

                                <div className="bg-[#111720] border border-[var(--app-card-border)] rounded-[22px] p-4 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[var(--app-card-border)] pb-2">
                                        <span className="text-[11px] uppercase tracking-wider text-[var(--app-text-secondary)] font-bold">Previews & Placement</span>
                                        <span className="text-[10px] text-blue-400 font-medium">Auto-Syncs with System</span>
                                    </div>

                                    {/* Previews cards grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        
                                        {/* LockScreen Option */}
                                        <div 
                                            onClick={() => toggleSetting("lockScreen")}
                                            className={`relative overflow-hidden rounded-[16px] border p-3 flex flex-col justify-between h-[96px] cursor-pointer transition-all ${
                                                customiseSettings.lockScreen 
                                                    ? "bg-blue-500/10 border-blue-500/40 text-white" 
                                                    : "bg-[var(--app-card)] border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-gray-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current/40" />
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                    customiseSettings.lockScreen ? "bg-emerald-500 border-emerald-400" : "border-gray-600 bg-transparent"
                                                }`}>
                                                    {customiseSettings.lockScreen && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[11px] font-bold block">LockScreen</span>
                                                <span className="text-[8px] opacity-60 block mt-0.5">Secure View</span>
                                            </div>
                                        </div>

                                        {/* Badge Option */}
                                        <div 
                                            onClick={() => toggleSetting("badge")}
                                            className={`relative overflow-hidden rounded-[16px] border p-3 flex flex-col justify-between h-[96px] cursor-pointer transition-all ${
                                                customiseSettings.badge 
                                                    ? "bg-blue-500/10 border-blue-500/40 text-white" 
                                                    : "bg-[var(--app-card)] border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-gray-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[7px] font-extrabold text-white">3</div>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                    customiseSettings.badge ? "bg-emerald-500 border-emerald-400" : "border-gray-600 bg-transparent"
                                                }`}>
                                                    {customiseSettings.badge && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[11px] font-bold block">Badge</span>
                                                <span className="text-[8px] opacity-60 block mt-0.5">Icon Dots</span>
                                            </div>
                                        </div>

                                        {/* Pop Up Option */}
                                        <div 
                                            onClick={() => toggleSetting("popUp")}
                                            className={`relative overflow-hidden rounded-[16px] border p-3 flex flex-col justify-between h-[96px] cursor-pointer transition-all ${
                                                customiseSettings.popUp 
                                                    ? "bg-blue-500/10 border-blue-500/40 text-white" 
                                                    : "bg-[var(--app-card)] border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-gray-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="w-6 h-1.5 rounded-full bg-current/30" />
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                    customiseSettings.popUp ? "bg-emerald-500 border-emerald-400" : "border-gray-600 bg-transparent"
                                                }`}>
                                                    {customiseSettings.popUp && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[11px] font-bold block">Pop Up</span>
                                                <span className="text-[8px] opacity-60 block mt-0.5">Top Banner</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Part B: Settings List */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] px-1">Alert Categories</h3>
                                <div className="bg-[#111720] border border-[var(--app-card-border)] rounded-[22px] divide-y divide-white/5">
                                    
                                    {/* Project Updates toggle */}
                                    <div className="flex items-center justify-between p-4">
                                        <div>
                                            <span className="text-xs font-semibold text-white block">Project Updates</span>
                                            <span className="text-[9px] text-[#4CD964] font-bold uppercase tracking-wide">Connected</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleSetting("projectUpdates")}
                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                customiseSettings.projectUpdates ? "bg-[#34C759]" : "bg-gray-800"
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-md transition-all ${
                                                customiseSettings.projectUpdates ? "left-5.5" : "left-0.5"
                                            }`} />
                                        </button>
                                    </div>

                                    {/* Daily Motives toggle */}
                                    <div className="flex items-center justify-between p-4">
                                        <div>
                                            <span className="text-xs font-semibold text-white block">Daily Motives</span>
                                            <span className="text-[9px] text-[var(--app-text-muted)]">Inspiring daily push summaries</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleSetting("dailyMotives")}
                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                customiseSettings.dailyMotives ? "bg-[#34C759]" : "bg-gray-800"
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-md transition-all ${
                                                customiseSettings.dailyMotives ? "left-5.5" : "left-0.5"
                                            }`} />
                                        </button>
                                    </div>

                                    {/* Achievements toggle */}
                                    <div className="flex items-center justify-between p-4">
                                        <div>
                                            <span className="text-xs font-semibold text-white block">Achievements</span>
                                            <span className="text-[9px] text-[var(--app-text-muted)]">Milestone awards & streak claims</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleSetting("achievements")}
                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                customiseSettings.achievements ? "bg-[#34C759]" : "bg-gray-800"
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-md transition-all ${
                                                customiseSettings.achievements ? "left-5.5" : "left-0.5"
                                            }`} />
                                        </button>
                                    </div>

                                </div>
                            </div>

                            {/* Part C: Voice Assistance Sync */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Voice Assistance</h3>
                                    <span className="text-[9px] text-gray-600 font-bold">SYNC ACTIONS</span>
                                </div>

                                <div className="bg-[#111720] border border-[var(--app-card-border)] rounded-[22px] p-5 space-y-4">
                                    <div className="text-center max-w-[280px] mx-auto">
                                        <span className="text-xs font-semibold text-white block">Sync your activities</span>
                                        <span className="text-[9.5px] text-[var(--app-text-secondary)] mt-1 block">Connect your system logs to broadcast updates using ambient assistants</span>
                                    </div>

                                    {/* Assistant Icons Selectors */}
                                    <div className="flex items-center justify-center gap-6 py-2">
                                        
                                        {/* Apple Voice */}
                                        <button
                                            onClick={() => setActiveAssistant(activeAssistant === "apple" ? null : "apple")}
                                            className={`w-[52px] h-[52px] rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                                activeAssistant === "apple"
                                                    ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                                                    : "bg-[var(--app-card)] border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-gray-300"
                                            }`}
                                        >
                                            <AppleLogoIcon className="w-[22px] h-[22px]" />
                                        </button>

                                        {/* Google Assistant */}
                                        <button
                                            onClick={() => setActiveAssistant(activeAssistant === "google" ? null : "google")}
                                            className={`w-[52px] h-[52px] rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                                activeAssistant === "google"
                                                    ? "bg-[#4285F4]/10 border-[#4285F4]/40 shadow-[0_0_12px_rgba(66,133,244,0.3)]"
                                                    : "bg-[var(--app-card)] border-[var(--app-card-border)] opacity-40 hover:opacity-100"
                                            }`}
                                        >
                                            <GoogleAssistantIcon className="w-[28px] h-[28px]" />
                                        </button>

                                        {/* Alexa */}
                                        <button
                                            onClick={() => setActiveAssistant(activeAssistant === "alexa" ? null : "alexa")}
                                            className={`w-[52px] h-[52px] rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                                activeAssistant === "alexa"
                                                    ? "bg-[#00CAFF]/10 border-[#00CAFF]/40 shadow-[0_0_12px_rgba(0,202,255,0.3)]"
                                                    : "bg-[var(--app-card)] border-[var(--app-card-border)] opacity-40 hover:opacity-100"
                                            }`}
                                        >
                                            <AlexaIcon className="w-[26px] h-[26px]" />
                                        </button>

                                    </div>

                                    {/* Connection Status Text */}
                                    <div className="text-center border-t border-[var(--app-card-border)] pt-3">
                                        {activeAssistant ? (
                                            <span className="text-[10px] font-bold text-[#4CD964] uppercase tracking-wider bg-[#4CD964]/10 border border-[#4CD964]/15 px-3 py-1 rounded-full">
                                                Connected to {activeAssistant.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                                                No voice assistant connected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Part D: Invite Boosters Modal Overlay */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end"
                    >
                        {/* Semi-transparent Backdrop click */}
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setShowInviteModal(false)} />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ translateY: "100%" }}
                            animate={{ translateY: "0%" }}
                            exit={{ translateY: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="bg-[#090a0f] border-t border-[var(--app-card-border)] rounded-t-[32px] w-full max-h-[90dvh] flex flex-col z-10 overflow-hidden relative shadow-2xl"
                        >
                            {/* Grab handle bar */}
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />
                            
                            {/* Close icon */}
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/15 text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>

                            {/* Modal Content (Invite Boosters layout from IMG_2574.JPG) */}
                            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2 space-y-6">
                                
                                {/* Card Graphic */}
                                <div className="bg-[#121212] border border-[var(--app-card-border)] rounded-[24px] p-6 text-center relative overflow-hidden shadow-inner shadow-white/5">
                                    <div className="absolute top-2 right-4 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        3
                                    </div>

                                    {/* Shining cross hair icon */}
                                    <div className="w-24 h-24 bg-[#1e1e1e] rounded-full border border-[var(--app-card-border)] mx-auto flex items-center justify-center shadow-lg relative my-4">
                                        <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)]" />
                                        {/* Crosshair lines */}
                                        <div className="absolute w-12 h-[1px] bg-white/30" />
                                        <div className="absolute h-12 w-[1px] bg-white/30" />
                                    </div>

                                    <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">Hello 675!</span>
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">Invite Boosters</h3>
                                    <span className="text-[9px] text-[var(--app-text-muted)] uppercase tracking-widest font-bold block mt-2">Design Boosted</span>
                                </div>

                                {/* Main details list */}
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">3 Invites Left</span>
                                    </div>

                                    {/* Search contact input */}
                                    <div className="relative flex items-center">
                                        <Search size={16} className="text-[var(--app-text-muted)] absolute left-4 pointer-events-none" />
                                        <input 
                                            type="text"
                                            placeholder="Search contacts..."
                                            className="w-full h-[46px] rounded-full bg-[var(--app-card)] border border-[var(--app-card-border)] pl-12 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-500/50 text-white"
                                        />
                                    </div>

                                    {/* Contact Rows */}
                                    <div className="space-y-2">
                                        
                                        {/* Contact 1 */}
                                        <div className="flex items-center justify-between p-3.5 bg-[#121212] border border-[var(--app-card-border)] rounded-[18px] hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                {/* Profile Avatar placeholder */}
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                                                    JE
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-white block">Jack Ethan</span>
                                                    <span className="text-[9px] text-[var(--app-text-muted)] block mt-0.5">+01 98 67 234 787</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    Invite
                                                </span>
                                                <ChevronRight size={14} className="text-gray-600 group-hover:text-[var(--app-text-secondary)]" />
                                            </div>
                                        </div>

                                        {/* Contact 2 */}
                                        <div className="flex items-center justify-between p-3.5 bg-[#121212] border border-[var(--app-card-border)] rounded-[18px] hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                {/* Profile Avatar placeholder */}
                                                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                                                    OL
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-white block">Oliva Liam</span>
                                                    <span className="text-[9px] text-[var(--app-text-muted)] block mt-0.5">+01 08 67 342 346</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    Invite
                                                </span>
                                                <ChevronRight size={14} className="text-gray-600 group-hover:text-[var(--app-text-secondary)]" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Detail Modal (Drawer) */}
            <AnimatePresence>
                {showDetailModal && selectedNotification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[var(--app-header-bg)] backdrop-blur-sm z-50 flex flex-col justify-end"
                    >
                        {/* Semi-transparent Backdrop click */}
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setShowDetailModal(false)} />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ translateY: "100%" }}
                            animate={{ translateY: "0%" }}
                            exit={{ translateY: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="bg-[#0f111a] border-t border-[var(--app-card-border)] rounded-t-[32px] w-full max-h-[85dvh] flex flex-col z-10 overflow-hidden relative shadow-2xl text-gray-100"
                        >
                            {/* Grab handle bar */}
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />
                            
                            {/* Close icon */}
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/15 text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4 space-y-6">
                                
                                {/* Icon & Header block */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <IconBox type={selectedNotification.iconType} />
                                    
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block">
                                            {selectedNotification.title}
                                        </span>
                                        <h3 className="text-xl font-extrabold text-white tracking-tight px-4 leading-tight">
                                            Notification Details
                                        </h3>
                                    </div>
                                </div>

                                {/* Body Description */}
                                <div className="bg-[#181a24] border border-[var(--app-card-border)] rounded-[22px] p-5 shadow-inner">
                                    <p className="text-[13.5px] leading-relaxed text-gray-200">
                                        {selectedNotification.text}
                                    </p>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#181a24] border border-[var(--app-card-border)] p-3 rounded-[16px] flex items-center gap-2.5">
                                        <Clock size={15} className="text-[var(--app-text-muted)]" />
                                        <div>
                                            <span className="text-[9px] text-[var(--app-text-muted)] uppercase block font-bold">Received</span>
                                            <span className="text-xs text-gray-300 font-semibold">{selectedNotification.time}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#181a24] border border-[var(--app-card-border)] p-3 rounded-[16px] flex items-center gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-500" />
                                        <div>
                                            <span className="text-[9px] text-[var(--app-text-muted)] uppercase block font-bold">Status</span>
                                            <span className="text-xs text-emerald-400 font-semibold">Read</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions list */}
                                <div className="space-y-2 pt-2">
                                    {selectedNotification.actionLabel && (
                                        <button
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                router.push(selectedNotification.actionRoute || "/chat");
                                            }}
                                            className="w-full h-[48px] rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            {selectedNotification.actionLabel} <ArrowUpRight size={14} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteNotification(selectedNotification.id)}
                                        className="w-full h-[48px] rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400 uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        Delete Notification
                                    </button>

                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="w-full h-[48px] rounded-full bg-white/5 border border-[var(--app-card-border)] hover:bg-white/10 text-xs font-bold text-[var(--app-text-secondary)] hover:text-white uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        Close Details
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav activePage="home" />
        </div>
    );
}
