"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Check, 
    Flame, 
    Lightbulb, 
    Shield, 
    User, 
    Copy, 
    CheckCircle2, 
    ChevronRight, 
    Lock, 
    CreditCard, 
    Users, 
    Pencil, 
    X,
    ExternalLink,
    Sun,
    Moon,
    LogOut
} from "lucide-react";
import MascotAvatar from "./MascotAvatar";
import BottomNav from "./BottomNav";
import { useTheme } from "./ThemeProvider";

type PersonaType = "growth" | "creative" | "analytical";

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    
    // Core Profile States (to be preserved)
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [targetAudience, setTargetAudience] = useState("");
    const [primaryKPI, setPrimaryKPI] = useState("");
    const [selectedPersona, setSelectedPersona] = useState<PersonaType>("growth");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const profile = await res.json();
                    if (profile.fullName) setFullName(profile.fullName);
                    if (profile.email) setEmail(profile.email);
                    if (profile.companyName) setCompanyName(profile.companyName);
                    if (profile.targetAudience) setTargetAudience(profile.targetAudience);
                    if (profile.primaryKPI) setPrimaryKPI(profile.primaryKPI);
                    if (profile.selectedPersona) setSelectedPersona(profile.selectedPersona as PersonaType);
                } else {
                    // Fallback to localStorage if API fails
                    const storedProfile = localStorage.getItem("pal_user_profile");
                    if (storedProfile) {
                        const profile = JSON.parse(storedProfile);
                        if (profile.fullName) setFullName(profile.fullName);
                        if (profile.email) setEmail(profile.email);
                        if (profile.companyName) setCompanyName(profile.companyName);
                        if (profile.targetAudience) setTargetAudience(profile.targetAudience);
                        if (profile.primaryKPI) setPrimaryKPI(profile.primaryKPI);
                        if (profile.selectedPersona) setSelectedPersona(profile.selectedPersona as PersonaType);
                    }
                }
            } catch (e) {
                console.error("Error fetching user profile", e);
            }
        }
        fetchProfile();
    }, []);

    const handleSelectPersona = async (personaId: PersonaType) => {
        setSelectedPersona(personaId);
        triggerToast(`Persona switched to ${personas.find(p => p.id === personaId)?.name}`);
        
        try {
            await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedPersona: personaId })
            });
        } catch (e) {
            console.error("Failed to update persona on server", e);
        }

        // Update localStorage
        const storedProfile = localStorage.getItem("pal_user_profile");
        let profile = {};
        if (storedProfile) {
            try {
                profile = JSON.parse(storedProfile);
            } catch (e) {}
        }
        const updated = {
            ...profile,
            selectedPersona: personaId
        };
        localStorage.setItem("pal_user_profile", JSON.stringify(updated));
    };
    
    // Temporary drawer states
    const [tempCompanyName, setTempCompanyName] = useState(companyName);
    const [tempTargetAudience, setTempTargetAudience] = useState(targetAudience);
    const [tempPrimaryKPI, setTempPrimaryKPI] = useState(primaryKPI);
    
    // UI Feedback states
    const [isSaved, setIsSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const personas = [
        {
            id: "growth",
            name: "Growth Coach",
            desc: "Focuses on viral marketing, user acquisition, high-velocity campaigns, and scaling reach.",
            icon: Flame,
            color: "text-orange-400 border-orange-500/20 bg-orange-500/5",
            activeColor: "border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-orange-500/10"
        },
        {
            id: "creative",
            name: "Creative Partner",
            desc: "Brainstorms product features, suggests design improvements, UX changes, and messaging strategies.",
            icon: Lightbulb,
            color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
            activeColor: "border-yellow-400/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] bg-yellow-500/10"
        },
        {
            id: "analytical",
            name: "Risk Auditor",
            desc: "Focuses on financial stability, data compliance, security auditing, and code stability analysis.",
            icon: Shield,
            color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
            activeColor: "border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-500/10"
        }
    ];

    const settingsItems = [
        {
            id: "password",
            title: "Password",
            desc: "Change your password here.",
            icon: Lock,
            iconColor: "text-blue-400",
            iconBg: "bg-blue-500/10 border-blue-500/20"
        },
        {
            id: "cards",
            title: "Saved cards",
            desc: "See your saved cards here.",
            icon: CreditCard,
            iconColor: "text-amber-400",
            iconBg: "bg-amber-500/10 border-amber-500/20"
        },
        {
            id: "pin",
            title: "Transfer PIN",
            desc: "Click here to change your transfer PIN.",
            icon: Shield,
            iconColor: "text-purple-400",
            iconBg: "bg-purple-500/10 border-purple-500/20"
        },
        {
            id: "referral",
            title: "Refer & Earn",
            desc: "Refer your person and win money.",
            icon: Users,
            iconColor: "text-rose-400",
            iconBg: "bg-rose-500/10 border-rose-500/20"
        },
        {
            id: "logout",
            title: "Log out",
            desc: "Sign out of your PAL account.",
            icon: LogOut,
            iconColor: "text-red-400",
            iconBg: "bg-red-500/10 border-red-500/20"
        }
    ];

    // Trigger copy workspace id
    const handleCopyWorkspaceId = () => {
        navigator.clipboard.writeText("ws_base_0167819260");
        setCopied(true);
        triggerToast("Workspace ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Open Edit Drawer
    const handleOpenEditDrawer = () => {
        setTempCompanyName(companyName);
        setTempTargetAudience(targetAudience);
        setTempPrimaryKPI(primaryKPI);
        setShowEditDrawer(true);
    };

    // Save changes from drawer
    const handleSaveSettings = async () => {
        setCompanyName(tempCompanyName);
        setTargetAudience(tempTargetAudience);
        setPrimaryKPI(tempPrimaryKPI);

        try {
            await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName: tempCompanyName,
                    targetAudience: tempTargetAudience,
                    primaryKPI: tempPrimaryKPI
                })
            });
        } catch (e) {
            console.error("Failed to update profile details on server", e);
        }

        // Update localStorage
        const storedProfile = localStorage.getItem("pal_user_profile");
        let profile = {};
        if (storedProfile) {
            try {
                profile = JSON.parse(storedProfile);
            } catch (e) {}
        }
        const updated = {
            ...profile,
            companyName: tempCompanyName,
            targetAudience: tempTargetAudience,
            primaryKPI: tempPrimaryKPI
        };
        localStorage.setItem("pal_user_profile", JSON.stringify(updated));

        setShowEditDrawer(false);
        setIsSaved(true);
        triggerToast("Business Profile Saved!");
        setTimeout(() => setIsSaved(false), 2000);
    };

    // Helper to display floating alert messages
    const triggerToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 2200);
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-5 pb-3 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] text-[var(--app-text-secondary)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-base font-bold text-[var(--app-text)] tracking-wide">My profile</h1>
                
                {/* Translucent green pencil edit icon */}
                <button
                    onClick={handleOpenEditDrawer}
                    className="grid h-[44px] w-[44px] place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    aria-label="Edit Profile"
                >
                    <Pencil size={18} />
                </button>
            </div>

            {/* Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-5 space-y-6 scrollbar-hide">
                
                {/* User Card Card */}
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                    {/* Double-Ring Avatar Border */}
                    <div className="relative p-1 rounded-full border border-emerald-500/10">
                        <div className="relative p-1 rounded-full border border-emerald-500/20">
                            <div className="w-[88px] h-[88px] rounded-full border border-emerald-500/40 relative overflow-hidden shadow-lg shadow-emerald-500/10 bg-[var(--app-card-alt)]">
                                <MascotAvatar className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-bold tracking-tight text-[var(--app-text)]">{fullName}</h2>
                        <p className="text-xs text-[var(--app-text-secondary)] font-medium">{email}</p>
                        
                        <div className="pt-1.5 flex justify-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4CD964] bg-[#4CD964]/5 border border-[#4CD964]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                <Shield className="w-3 h-3 text-[#4CD964]" fill="currentColor" fillOpacity={0.1} /> Account tier 3
                            </span>
                        </div>
                    </div>
                </div>

                {/* Workspace Stats Card (Jelil Ajao Account Details layout) */}
                <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-5 shadow-lg relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--app-text-secondary)]">Workspace Stats</h3>
                        <button 
                            onClick={() => triggerToast("Directing to API logs...")}
                            className="text-xs font-bold text-[#4CD964] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                            API Logs <ExternalLink size={10} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between bg-[var(--app-card-alt)] border border-[var(--app-card-border)] rounded-xl p-3.5 mb-4">
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase block mb-0.5">Active Workspace</span>
                            <span className="text-xs text-[var(--app-text)] font-bold block truncate">{companyName} (Active)</span>
                        </div>
                        <button
                            onClick={handleCopyWorkspaceId}
                            className="p-2.5 rounded-lg bg-white/5 border border-[var(--app-card-border)] text-[var(--app-text-secondary)] hover:text-[var(--app-text)] transition-colors cursor-pointer shrink-0 ml-3"
                            title="Copy Workspace ID"
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="border-r border-[var(--app-card-border)] pr-2">
                            <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase block mb-1">Compute Balance</span>
                            <span className="text-base font-extrabold text-[var(--app-text)]">76,000 <span className="text-[11px] font-medium text-[var(--app-text-secondary)]">credits</span></span>
                        </div>
                        <div className="pl-2">
                            <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase block mb-1">Credits Saved</span>
                            <span className="text-base font-extrabold text-[#4CD964]">20,000 <span className="text-[11px] font-medium text-[var(--app-text-secondary)]">credits</span></span>
                        </div>
                    </div>
                </div>

                {/* Settings Rows Card Container */}
                <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] overflow-hidden divide-y divide-[var(--app-divider)] shadow-lg">
                    {settingsItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={async () => {
                                    if (item.id === "logout") {
                                        try {
                                            const res = await fetch("/api/auth/session", {
                                                method: "DELETE"
                                            });
                                            if (res.ok) {
                                                localStorage.removeItem("pal_user_profile");
                                                router.push("/onboarding");
                                            } else {
                                                triggerToast("Failed to log out");
                                            }
                                        } catch (e) {
                                            triggerToast("Logout failed");
                                        }
                                    } else {
                                        triggerToast(`Navigating to ${item.title}...`);
                                    }
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center border shrink-0 ${item.iconBg}`}>
                                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[var(--app-text)] leading-snug">{item.title}</h4>
                                        <p className="text-[10px] text-[var(--app-text-secondary)] leading-snug">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-[var(--app-text-muted)]" />
                            </button>
                        );
                    })}
                </div>


                {/* Persona selector (preserved and refined) */}
                <div className="space-y-3.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--app-text-secondary)] pl-1">Co-Founder Persona</h3>
                    
                    <div className="space-y-3">
                        {personas.map((p) => {
                            const IconComponent = p.icon;
                            const isSelected = selectedPersona === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectPersona(p.id as PersonaType)}
                                    className={`w-full text-left rounded-[22px] border p-4 flex gap-4 transition-all duration-300 cursor-pointer ${
                                        isSelected ? p.activeColor : `border-[var(--app-card-border)] bg-[var(--app-card)] hover:border-[var(--app-card-border)]`
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${p.color}`}>
                                        <IconComponent size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-bold text-[var(--app-text)]">{p.name}</h4>
                                            {isSelected && (
                                                <span className="text-[8px] font-extrabold bg-[#4CD964]/10 text-[#4CD964] px-2 py-0.5 rounded-full border border-[#4CD964]/20 uppercase tracking-wider">Active</span>
                                            )}
                                        </div>
                                        <p className="text-[10.5px] text-[var(--app-text-secondary)] mt-1 leading-relaxed">{p.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Bottom Nav */}
            <BottomNav />

            {/* Float Toast Alert */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-neutral-900 border border-[var(--app-card-border)] px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl z-50 whitespace-nowrap min-w-[200px] justify-center"
                    >
                        <CheckCircle2 size={14} className="text-[#4CD964]" />
                        <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slide-Up Business Settings Drawer */}
            <AnimatePresence>
                {showEditDrawer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[var(--app-header-bg)] backdrop-blur-sm z-50 flex flex-col justify-end"
                    >
                        {/* Semi-transparent Backdrop click */}
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setShowEditDrawer(false)} />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ translateY: "100%" }}
                            animate={{ translateY: "0%" }}
                            exit={{ translateY: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="bg-[var(--app-surface)] border-t border-[var(--app-card-border)] rounded-t-[32px] w-full max-h-[85dvh] flex flex-col z-10 overflow-hidden relative shadow-2xl text-[var(--app-text)]"
                        >
                            {/* Grab handle bar */}
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />
                            
                            {/* Close icon */}
                            <button
                                onClick={() => setShowEditDrawer(false)}
                                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/15 text-[var(--app-text-secondary)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4 space-y-6">
                                
                                {/* Header */}
                                <div className="space-y-1 text-center pb-2">
                                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                                        Configuration
                                    </span>
                                    <h3 className="text-lg font-bold text-[var(--app-text)] tracking-tight leading-tight">
                                        Edit Business Settings
                                    </h3>
                                    <p className="text-[10.5px] text-[var(--app-text-muted)]">Update workspace metadata to customize your co-founder's context.</p>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-extrabold text-[#4CD964] uppercase tracking-widest mb-2 pl-0.5">
                                            Company Name
                                        </label>
                                        <input
                                            value={tempCompanyName}
                                            onChange={(e) => setTempCompanyName(e.target.value)}
                                            className="h-[48px] w-full rounded-2xl border border-[var(--app-card-border)] bg-[var(--app-input-bg)] px-4 text-xs font-semibold text-[var(--app-text)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                            placeholder="Enter company name"
                                            maxLength={50}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-extrabold text-[#4CD964] uppercase tracking-widest mb-2 pl-0.5">
                                            Target Audience
                                        </label>
                                        <input
                                            value={tempTargetAudience}
                                            onChange={(e) => setTempTargetAudience(e.target.value)}
                                            className="h-[48px] w-full rounded-2xl border border-[var(--app-card-border)] bg-[var(--app-input-bg)] px-4 text-xs font-semibold text-[var(--app-text)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                            placeholder="Enter target audience"
                                            maxLength={50}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-extrabold text-[#4CD964] uppercase tracking-widest mb-2 pl-0.5">
                                            Primary Business KPI
                                        </label>
                                        <input
                                            value={tempPrimaryKPI}
                                            onChange={(e) => setTempPrimaryKPI(e.target.value)}
                                            className="h-[48px] w-full rounded-2xl border border-[var(--app-card-border)] bg-[var(--app-input-bg)] px-4 text-xs font-semibold text-[var(--app-text)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                            placeholder="Enter primary KPI"
                                            maxLength={50}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2.5 pt-4">
                                    <button
                                        onClick={handleSaveSettings}
                                        className="w-full h-[48px] rounded-full bg-[#4CD964] hover:bg-[#43c45a] text-xs font-bold text-black uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        Save Changes <Check size={14} className="stroke-[2.5px]" />
                                    </button>

                                    <button
                                        onClick={() => setShowEditDrawer(false)}
                                        className="w-full h-[48px] rounded-full bg-white/5 border border-[var(--app-card-border)] hover:bg-white/10 text-xs font-bold text-[var(--app-text-secondary)] hover:text-[var(--app-text)] uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
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
