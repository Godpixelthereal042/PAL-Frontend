"use client";

import { Bell, Camera, Plus, Zap } from "lucide-react";
import CalendarWidget from "./CalendarWidget";
import BottomNav from "./BottomNav";
import MascotAvatar from "./MascotAvatar";
import AddScheduleModal from "./AddScheduleModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Inline brand SVGs - clean outline styles
function GmailIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(4.5, 6.5)">
                <path d="M13 1H2C1.45 1 1 1.45 1 2V10C1 10.55 1.45 11 2 11H13C13.55 11 14 10.55 14 10V2C14 1.45 13.55 1 13 1Z" fill="white" />
                <path d="M1 2.5L7.5 7L14 2.5" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M1 10V2L7.5 6.5L14 2V10" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
        </svg>
    );
}

// Slack icon
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

// Apple Icon
function AppleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(-0.25, -0.75)">
                <path
                    d="M17.05 13.9c-.03-1.95 1.59-2.88 1.66-2.93-1.07-1.57-2.73-1.78-3.32-1.83-1.42-.15-2.77.83-3.49.83-.72 0-1.85-.82-3.05-.8-1.58.02-3.04.93-3.85 2.34-1.64 2.85-.42 7.06 1.17 9.35.78 1.12 1.69 2.37 2.9 2.33 1.18-.05 1.63-.76 3.05-.76 1.42 0 1.83.76 3.07.74 1.25-.02 2.06-1.13 2.82-2.24.89-1.28 1.25-2.52 1.27-2.58-.03-.01-2.45-.94-2.48-3.73zM15.42 7.15c.63-.76 1.05-1.82.93-2.87-.9.04-1.99.6-2.63 1.35-.58.67-.99 1.74-.87 2.78.99.08 2.0-.51 2.57-1.26"
                    fill="white"
                />
            </g>
        </svg>
    );
}

// Excel Icon
function ExcelIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(2, 2) scale(0.83)">
                <path d="M16.2 2H7.8C6.8 2 6 2.8 6 3.8v16.4c0 1 .8 1.8 1.8 1.8h8.4c1 0 1.8-.8 1.8-1.8V3.8c0-1-.8-1.8-1.8-1.8z" fill="#107C41" />
                <path d="M2.5 6.5h8v11h-8z" fill="#0F5A2C" />
                <path d="M9.5 8l-2 3-2-3H3.8l3 4.5-3 4.5h1.7l2-3 2 3h1.7l-3-4.5 3-4.5H9.5z" fill="#FFF" />
            </g>
        </svg>
    );
}

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(2, 2) scale(0.83)">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.24-.63-.37-1.3-.37-1.99c0-.73.13-1.43.37-2.09c-.87 2.6-3.3 4.53-6.16 4.53z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </g>
        </svg>
    );
}

// Notion Icon
function NotionIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(2, 2) scale(0.83)">
                <rect width="24" height="24" rx="5" fill="#FFFFFF" />
                <path d="M5.5 5.5v13h2.6v-7.1l5.4 7.1h2.5v-13h-2.6v6.9l-5.3-6.9H5.5z" fill="#000000" />
            </g>
        </svg>
    );
}

// Twitter Icon
function TwitterXIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(2.5, 2.5) scale(0.79)">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#FFF" />
            </g>
        </svg>
    );
}

// Facebook Icon
function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <g transform="translate(2, 2) scale(0.83)">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                <path d="M16.671 14.073l.532-3.47h-3.328V8.353c0-.949.465-1.874 1.956-1.874h1.514V3.526s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.047v8.385a12.09 12.09 0 001.875.146c.636 0 1.26-.048 1.875-.146v-8.385h2.796z" fill="#FFF" />
            </g>
        </svg>
    );
}

// Custom wireframe card SVGs
function QuickInvoiceGraphic({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M25 20 H65 V70 H25 Z" />
            <path d="M25 70 C25 75, 30 78, 35 78 H65" />
            <path d="M35 35 H55 M35 45 H45" />
            <path d="M48 53 C48 50, 52 50, 52 53 C52 56, 48 56, 48 59 C48 62, 52 62, 52 59 M50 49 V63" />
            <circle cx="70" cy="25" r="8" fill="#18191f" />
            <path d="M70 21 V25 M70 28 H70.1" strokeWidth={2} />
        </svg>
    );
}

function LogHistoryGraphic({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="25" y="35" width="45" height="30" rx="6" />
            <path d="M70 42 H60 V58 H70 Z" />
            <path d="M45 45 C45 43, 49 43, 49 45 C49 47, 45 47, 45 49 C45 51, 49 51, 49 49 M47 40 V54" />
            <circle cx="28" cy="28" r="8" fill="#18191f" />
            <path d="M28 24 V28 M28 31 H28.1" strokeWidth={2} />
        </svg>
    );
}

function WeeklyDataGraphic({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M30 45 L55 35 V65 L30 55 Z" />
            <path d="M55 35 C62 38, 62 62, 55 65" />
            <path d="M30 45 H20 V55 H30 Z" />
            <path d="M68 40 C73 45, 73 55, 68 60" />
            <path d="M75 32 C83 40, 83 60, 75 68" />
        </svg>
    );
}

const quickCards = [
    { top: "Quick", bottom: "Invoice", Graphic: QuickInvoiceGraphic, href: "/quick-invoice" },
    { top: "Log", bottom: "History", Graphic: LogHistoryGraphic, href: "/log-history" },
    { top: "Weekly", bottom: "Data", Graphic: WeeklyDataGraphic, href: "/weekly-data" }
];

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    time: string;
    title: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
    { id: "1", date: "2026-06-05", time: "18:00", title: "Sync with Slack team" },
    { id: "2", date: "2026-06-08", time: "17:45", title: "Log Weekly History" }
];

function StatusBar({ tone }: { tone: "light" | "dark" }) {
    return (
        <div className={`status-bar ${tone === "dark" ? "status-dark" : ""}`}>
            <span>9:41</span>
            {tone === "light" && <span className="dynamic-island" aria-hidden="true" />}
            <div className="status-icons" aria-hidden="true">
                <span className="signal">
                    <span />
                    <span />
                    <span />
                    <span />
                </span>
                <span className="wifi">
                    <span className="wifi-dot" />
                </span>
                <span className="battery" />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [username, setUsername] = useState("Emmanuel");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch("/api/auth/session");
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        setUsername(data.user.name);
                        const storedProfile = localStorage.getItem("pal_user_profile");
                        if (!storedProfile) {
                            localStorage.setItem("pal_user_profile", JSON.stringify({
                                fullName: data.user.name,
                                email: data.user.email,
                                role: data.user.role,
                                onboardingCompleted: true,
                                companyName: "Pal AI",
                                selectedPersona: "growth"
                            }));
                        }
                    } else {
                        router.push("/onboarding");
                    }
                } else {
                    router.push("/onboarding");
                }
            } catch (err) {
                console.error("Session verification failed", err);
                const storedProfile = localStorage.getItem("pal_user_profile");
                if (!storedProfile) {
                    router.push("/onboarding");
                }
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, [router]);

    // States for complete features
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1));
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    // Load initial schedules from local database API
    useEffect(() => {
        if (!loading) {
            fetch("/api/schedules")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setEvents(data);
                    }
                })
                .catch(err => console.error("Error loading schedules:", err));
        }
    }, [loading]);
    
    // Connected channels toggles
    const [connectedSources, setConnectedSources] = useState<string[]>([]);
    const [connectedSchedules, setConnectedSchedules] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/integrations")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const syncedIds = data
                        .filter(item => item.isSynced === 1 || item.isSynced === true)
                        .map(item => item.id);
                    
                    const sourcesList = ["excel", "google", "slack", "x", "facebook"];
                    const schedulesList = ["gmail", "slack", "apple"];
                    
                    setConnectedSources(syncedIds.filter(id => sourcesList.includes(id)));
                    setConnectedSchedules(syncedIds.filter(id => schedulesList.includes(id)));
                }
            })
            .catch(err => console.error("Error loading integrations:", err));
    }, []);

    const handleAddSchedule = (newSched: { title: string; date: string; time: string }) => {
        fetch("/api/schedules", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newSched)
        })
            .then(res => res.json())
            .then(savedEvent => {
                if (savedEvent && savedEvent.id) {
                    setEvents(prev => [...prev, savedEvent]);
                    const eventDate = new Date(savedEvent.date);
                    setSelectedDate(eventDate);
                    setSelectedTime(savedEvent.time);
                    setCurrentMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
                    alert(`Schedule "${savedEvent.title}" added to database!`);
                } else {
                    alert("Failed to save schedule to database.");
                }
            })
            .catch(err => {
                console.error("Error saving event:", err);
                alert("Error saving schedule to database.");
            });
    };

    return (
        <div className="h-dvh bg-black text-white w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col">

            {/* iOS Status Bar */}
            <StatusBar tone="dark" />

            {/* Header (Fixed at top) */}
            <div className="flex justify-between items-center p-4 pt-2 pb-2 shrink-0 z-30 bg-transparent">
                <button
                    onClick={() => router.push("/analytics")}
                    style={{ 
                        backgroundColor: '#061830', 
                        borderColor: '#1d4f8a',
                        borderStyle: 'solid',
                        borderWidth: '1.5px',
                        color: '#ffffff'
                    }}
                    className="grid h-[55px] w-[55px] place-items-center rounded-full transition active:scale-95 cursor-pointer hover:opacity-90 shadow-md"
                    aria-label="Zap menu"
                >
                    <Zap size={22} className="fill-current" style={{ color: '#ffffff' }} />
                </button>
                
                <div className="flex items-center gap-[10px]">
                    <button 
                        onClick={() => router.push("/camera")}
                        style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.12)', 
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            color: '#ffffff'
                        }}
                        className="grid h-[55px] w-[55px] place-items-center rounded-full active:scale-95 transition-all cursor-pointer hover:opacity-80 shadow-md"
                        aria-label="Camera"
                    >
                        <Camera size={20} style={{ color: '#ffffff' }} />
                    </button>
                    <button 
                        onClick={() => router.push("/notifications")}
                        style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.12)', 
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            color: '#ffffff'
                        }}
                        className="grid h-[55px] w-[55px] place-items-center rounded-full active:scale-95 transition-all cursor-pointer hover:opacity-80 shadow-md"
                        aria-label="Notifications"
                    >
                        <Bell size={20} style={{ color: '#ffffff' }} />
                    </button>
                    {/* Mascot Avatar */}
                    <button
                        onClick={() => router.push("/profile")}
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderStyle: 'solid',
                            borderWidth: '1px'
                        }}
                        className="w-[55px] h-[55px] rounded-full overflow-hidden relative active:scale-95 transition-all cursor-pointer text-left shrink-0 shadow-md"
                    >
                        <MascotAvatar className="w-full h-full" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 scrollbar-hide">

            {/* Greeting */}
            <div className="mt-6 font-outfit px-1 shrink-0">
                <span className="text-zinc-500 text-[15px] font-semibold block">Welcome back</span>
                <h1 className="text-[32px] font-extrabold text-white mt-1 leading-[1.05] tracking-tight">
                    {username} ⚡
                </h1>
            </div>

            {/* Action Row (Schedules) */}
            <div className="mt-5 flex items-center gap-[8px] mb-4">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    style={{ backgroundColor: '#0a2f5c', color: '#ffffff' }}
                    className="flex h-[44px] flex-1 items-center justify-center gap-[10px] rounded-full text-[13px] font-semibold transition active:scale-[0.98] cursor-pointer hover:opacity-90 shadow-md"
                >
                    Add Schedules <Plus size={16} style={{ color: '#ffffff' }} />
                </button>
                
                {/* Gmail icon */}
                <button
                    type="button"
                    onClick={() => router.push("/connect/gmail")}
                    style={{ 
                        backgroundColor: '#1c1c1e',
                        borderColor: connectedSchedules.includes("gmail") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        opacity: connectedSchedules.includes("gmail") ? 1 : 0.35
                    }}
                    className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                >
                    <GmailIcon className="w-[20px] h-[20px]" />
                </button>

                {/* Slack icon */}
                <button
                    type="button"
                    onClick={() => router.push("/connect/slack")}
                    style={{ 
                        backgroundColor: '#1c1c1e',
                        borderColor: connectedSchedules.includes("slack") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        opacity: connectedSchedules.includes("slack") ? 1 : 0.35
                    }}
                    className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                >
                    <SlackIcon className="w-[20px] h-[20px]" />
                </button>
                
                {/* Plus button inside schedules */}
                <button
                    type="button"
                    onClick={() => router.push("/connect/new")}
                    style={{ 
                        backgroundColor: '#062447', 
                        borderColor: '#1d4f8a',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        color: '#ffffff'
                    }}
                    className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer shadow-md"
                >
                    <Plus size={18} style={{ color: '#ffffff' }} />
                </button>
            </div>

            {/* Calendar Widget or Empty State */}
            {events.length === 0 ? (
                <div className="rounded-[24px] border border-white/5 bg-[#0a0b0d] p-6 text-center text-zinc-400 font-outfit mb-4">
                    <span className="text-[14px] font-semibold text-zinc-500 block mb-3">You have no schedule at the moment</span>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#0a2f5c', color: '#ffffff' }}
                        className="mx-auto flex h-[40px] px-6 items-center justify-center gap-[8px] rounded-full text-[12px] font-bold transition active:scale-[0.98] cursor-pointer hover:opacity-90 shadow-md"
                    >
                        Add Schedule <Plus size={14} style={{ color: '#ffffff' }} />
                    </button>
                </div>
            ) : (
                <div className="mb-4">
                    <CalendarWidget 
                        events={events}
                        selectedDate={selectedDate}
                        setSelectedDate={handleSelectDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                    />
                </div>
            )}

            {/* Connect Data */}
            <div className="mb-2">
                <h2 className="mt-[17px] text-[21px] font-bold text-[#51d4ff] pl-1 font-outfit">Connect Data</h2>
                <div className="mt-[12px] flex gap-[9px] overflow-x-auto py-2 px-1 scrollbar-hide">
                    {/* Excel */}
                    <button
                        type="button"
                        onClick={() => router.push("/connect/excel")}
                        style={{ 
                            backgroundColor: '#1c1c1e',
                            borderColor: connectedSources.includes("excel") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            opacity: connectedSources.includes("excel") ? 1 : 0.35
                        }}
                        className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                    >
                        <ExcelIcon className="w-[20px] h-[20px]" />
                    </button>
                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => router.push("/connect/google")}
                        style={{ 
                            backgroundColor: '#1c1c1e',
                            borderColor: connectedSources.includes("google") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            opacity: connectedSources.includes("google") ? 1 : 0.35
                        }}
                        className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                    >
                        <GoogleIcon className="w-[20px] h-[20px]" />
                    </button>
                    {/* Slack in Connect Data */}
                    <button
                        type="button"
                        onClick={() => router.push("/connect/slack")}
                        style={{ 
                            backgroundColor: '#1c1c1e',
                            borderColor: connectedSources.includes("slack") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            opacity: connectedSources.includes("slack") ? 1 : 0.35
                        }}
                        className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                    >
                        <SlackIcon className="w-[20px] h-[20px]" />
                    </button>
                    {/* X */}
                    <button
                        type="button"
                        onClick={() => router.push("/connect/x")}
                        style={{ 
                            backgroundColor: '#1c1c1e',
                            borderColor: connectedSources.includes("x") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            opacity: connectedSources.includes("x") ? 1 : 0.35
                        }}
                        className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                    >
                        <TwitterXIcon className="w-[20px] h-[20px]" />
                    </button>
                    {/* Facebook */}
                    <button
                        type="button"
                        onClick={() => router.push("/connect/facebook")}
                        style={{ 
                            backgroundColor: '#1c1c1e',
                            borderColor: connectedSources.includes("facebook") ? '#2d7fe0' : 'rgba(255, 255, 255, 0.08)',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            opacity: connectedSources.includes("facebook") ? 1 : 0.35
                        }}
                        className="relative flex items-center justify-center h-[43px] w-[43px] rounded-full transition active:scale-95 shrink-0 cursor-pointer hover:opacity-95 shadow-md"
                    >
                        <FacebookIcon className="w-[20px] h-[20px]" />
                    </button>
 
                    <button 
                        type="button" 
                        onClick={() => router.push("/connect/new")}
                        style={{ 
                            borderColor: '#1d4f8a', 
                            backgroundColor: '#062447',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            color: '#ffffff'
                        }}
                        className="grid h-[43px] w-[62px] place-items-center rounded-full text-white shrink-0 hover:opacity-90 transition active:scale-95 cursor-pointer shadow-md"
                    >
                        <Plus size={19} style={{ color: '#ffffff' }} />
                    </button>
                </div>
            </div>
 
            {/* Quick Actions Scroll */}
            <div className="mt-[10px] flex gap-[12px] overflow-x-auto scrollbar-hide w-full pl-0.5 pb-4">
                {quickCards.map(({ top, bottom, Graphic, href }) => (
                    <Link
                        key={top}
                        href={href}
                        style={{ backgroundColor: '#111318' }}
                        className="relative h-[86px] min-w-[156px] shrink-0 overflow-hidden rounded-[20px] px-5 py-5 text-left text-sm font-semibold leading-[1.05] text-white hover:opacity-90 transition-all cursor-pointer border border-white/5 shadow-md"
                    >
                        {top}
                        <br />
                        {bottom}
                        <Graphic className="absolute right-1 top-0 text-white/5 w-[86px] h-[86px]" />
                    </Link>
                ))}
            </div>

            </div>

            <BottomNav activePage="home" />

            <AddScheduleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddSchedule}
                initialDate={selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : ""}
                initialTime={selectedTime || ""}
            />
        </div>
    );
}
