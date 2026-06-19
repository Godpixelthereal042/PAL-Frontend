"use client";

import React, { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Link as LinkIcon, 
    Share2, 
    Plus, 
    MoreHorizontal, 
    Edit2, 
    ChevronRight, 
    Check, 
    MessageSquare, 
    Info,
    Clock,
    Send,
    X,
    Lock,
    Phone
} from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectDetailsScreenProps {
    id: string;
}

interface Project {
    id: number | string;
    title: string;
    type: string;
    description: string;
    date: string;
    color: string;
    goal?: string;
    priority?: string;
    status?: string;
    due_date?: string;
    owner_id?: string;
}

const PROJECTS_DATA: Record<string, Project> = {
    "1": { id: "1", title: "The Base app", type: "Mobile app design", description: "Designing the new web & mobile layout for Base L2 blockchain dashboard.", date: "02/08/2025", color: "#3b82f6" },
    "2": { id: "2", title: "Onboard", type: "Web platform", description: "Simplifying user onboarding flow, signups, and keys setup.", date: "01/15/2025", color: "#0f172a" },
    "3": { id: "3", title: "Paypal AI", type: "Fintech integration", description: "Integrating conversational AI checkout to speed up transaction flows.", date: "12/20/2024", color: "#3b82f6" },
    "4": { id: "4", title: "Busy Easy", type: "Productivity tool", description: "All-in-one productivity tracker for teams and remote workers.", date: "11/05/2024", color: "#1e293b" },
    "5": { id: "5", title: "Crypto Wallet", type: "Mobile app", description: "Decentralized secure crypto wallet interface and biometric unlocks.", date: "10/20/2024", color: "#8b5cf6" },
    "6": { id: "6", title: "Health Tracker", type: "Wearable app", description: "Fitness tracking companion dashboard and sync with Apple Health.", date: "09/15/2024", color: "#10b981" }
};

interface Milestone {
    id: string | number;
    project_id: string;
    text: string;
    completed: boolean;
}

export default function ProjectDetailsScreen({ id }: ProjectDetailsScreenProps) {
    const router = useRouter();
    
    // Loaded Project details
    const [project, setProject] = useState<Project>({
        id: id,
        title: "Active Project Workspace",
        type: "Co-Founder Workspace",
        description: "AI-generated business folder containing design assets, code documents, and sync files.",
        date: "06/05/2026",
        color: "#3b82f6"
    });

    // Goals/Milestones list matching the Goals (3) section of IMG_2573.JPG
    // Goals/Tasks list matching the Tasks section
    interface Task {
        id: string;
        project_id: string;
        title: string;
        description: string;
        status: "not_started" | "next_action" | "blocked" | "done";
        priority: "high" | "medium" | "low";
        due_date?: string;
    }

    const [tasks, setTasks] = useState<Task[]>([]);
    const [decisions, setDecisions] = useState<any[]>([]);
    const [showAddDecisionModal, setShowAddDecisionModal] = useState(false);
    const [decisionTitle, setDecisionTitle] = useState("");
    const [decisionDesc, setDecisionDesc] = useState("");
    const [members, setMembers] = useState<any[]>([{ id: "1", name: "Emmanuel", email: "emmanuel@thebaseapp.com", role: "Owner" }]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedContributionMember, setSelectedContributionMember] = useState<any | null>(null);
    const [showChatDrawer, setShowChatDrawer] = useState(false);
    const [chatInputText, setChatInputText] = useState("");
    const [chatMessages, setChatMessages] = useState<any[]>([
        { id: "1", sender: "Pal AI", text: "Hi team! Welcome to the project sync room. I will coordinate tasks and progress updates here.", time: "10:00 AM", isPal: true },
        { id: "2", sender: "Emmanuel", text: "Thanks Pal! I've set up the core spec documents.", time: "10:02 AM" },
        { id: "3", sender: "Teammate", text: "Awesome, looking at the visual mockups today.", time: "10:15 AM" },
        { id: "4", sender: "Pal AI", text: "@Teammate, don't forget the sprint end is on 06/05/2026.", time: "10:20 AM", isPal: true }
    ]);
    const [isPalTyping, setIsPalTyping] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showChatDrawer && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, showChatDrawer, isPalTyping]);

    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskDescription, setEditTaskDescription] = useState("");
    const [editTaskStatus, setEditTaskStatus] = useState<string>("not_started");
    const [editTaskPriority, setEditTaskPriority] = useState<string>("medium");

    const handleStartEditTask = (task: any) => {
        setEditingTask(task);
        setEditTaskTitle(task.title);
        setEditTaskDescription(task.description || "");
        setEditTaskStatus(task.status);
        setEditTaskPriority(task.priority);
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !editTaskTitle.trim()) return;

        const updatedTask = {
            ...editingTask,
            title: editTaskTitle.trim(),
            description: editTaskDescription.trim(),
            status: editTaskStatus,
            priority: editTaskPriority
        };

        // Optimistic UI
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
        setEditingTask(null);

        try {
            await fetch(`/api/tasks`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask)
            });
        } catch (err) {
            console.error("Failed to save task", err);
        }
    };

    const handleSendChatMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInputText.trim()) return;

        const userMsg = {
            id: String(Date.now()),
            sender: currentUser?.name || "Emmanuel",
            text: chatInputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isPal: false
        };

        setChatMessages(prev => [...prev, userMsg]);
        const currentInput = chatInputText.trim().toLowerCase();
        setChatInputText("");

        // Trigger Pal AI mock response
        setTimeout(() => {
            setIsPalTyping(true);
            
            setTimeout(() => {
                setIsPalTyping(false);
                let responseText = "";

                if (currentInput.includes("status") || currentInput.includes("progress") || currentInput.includes("task")) {
                    responseText = "I checked the current tasks log. The first task establish core specs and PRD document is marked completed. Next items verify dashboard visual mockups and integrate database ledger connectors are pending.";
                } else if (currentInput.includes("remind") || currentInput.includes("meeting") || currentInput.includes("schedule")) {
                    responseText = "I will ping teammates to review their outstanding tasks. I can also set up a team sync schedule for tomorrow if you would like.";
                } else if (currentInput.includes("invite") || currentInput.includes("member") || currentInput.includes("teammate")) {
                    responseText = "Invitations have been sent out. Once new teammates join the workspace, I will auto-generate their onboarding checklist and display them in the team section.";
                } else {
                    responseText = "Got that! I have logged that update. Let me know if there is anything else I should coordinate for the team.";
                }

                setChatMessages(prev => [...prev, {
                    id: String(Date.now() + 1),
                    sender: "Pal AI",
                    text: responseText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isPal: true
                }]);
            }, 1500);
        }, 600);
    };

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2200);
    };

    const handleAddDecisionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!decisionTitle.trim()) return;

        const payload = {
            title: decisionTitle.trim(),
            description: decisionDesc.trim()
        };

        try {
            const res = await fetch(`/api/projects/${id}/decisions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newDec = await res.json();
                setDecisions(prev => [newDec, ...prev]);
                triggerToast("Decision logged");
            }
        } catch (err) {
            console.error("Error logging decision", err);
        }

        setDecisionTitle("");
        setDecisionDesc("");
        setShowAddDecisionModal(false);
    };

    // Contribution data helper matching habit-tracker aesthetic
    const getContributionData = (memberId: string, memberName: string) => {
        let hash = 0;
        const str = String(memberId || "") + String(memberName || "");
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const pseudoRandom = (seedOffset: number) => {
            const x = Math.sin(hash + seedOffset) * 10000;
            return x - Math.floor(x);
        };

        const totalDays = 112; // 16 weeks
        const grid: { date: string; value: number }[] = [];
        let totalRepetitions = 0;
        let currentStreak = 0;
        let longestStreak = 0;

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - totalDays);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek); // Align to Sunday

        for (let i = 0; i < totalDays; i++) {
            const dateObj = new Date(startDate);
            dateObj.setDate(startDate.getDate() + i);
            
            const rand = pseudoRandom(i);
            let val = 0;
            if (rand > 0.94) val = 3;
            else if (rand > 0.82) val = 2;
            else if (rand > 0.60) val = 1;

            if (dateObj > today) {
                val = 0;
            }

            grid.push({
                date: dateObj.toISOString().split("T")[0],
                value: val
            });

            if (val > 0) {
                totalRepetitions += val;
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        }

        const completionRate = Math.min(98, Math.max(65, Math.round(75 + (pseudoRandom(456) * 20))));
        return {
            totalRepetitions,
            completionRate,
            longestStreak,
            grid,
            joinDate: "Nov. 24th, 2023"
        };
    };


    useEffect(() => {
        async function fetchProjectDetails() {
            try {
                const resProj = await fetch(`/api/projects/${id}`);
                if (resProj.ok) {
                    const data = await resProj.json();
                    if (data.project) {
                        setProject(data.project);
                    }
                }
                
                const resTasks = await fetch(`/api/tasks?projectId=${id}`);
                if (resTasks.ok) {
                    const data = await resTasks.json();
                    setTasks(data);
                } else {
                    // Fallback to static mock data
                    setTasks([
                        { id: "1", project_id: id, title: "Establish core specs & PRD document", description: "", status: "done", priority: "high" },
                        { id: "2", project_id: id, title: "Verify dashboard visual mockups", description: "", status: "next_action", priority: "medium" },
                        { id: "3", project_id: id, title: "Integrate database ledger connectors", description: "", status: "not_started", priority: "high" }
                    ]);
                }

                const resMembers = await fetch(`/api/projects/${id}/members`);
                if (resMembers.ok) {
                    const data = await resMembers.json();
                    if (data && data.length > 0) {
                        setMembers(data);
                    }
                }

                const resDecisions = await fetch(`/api/projects/${id}/decisions`);
                if (resDecisions.ok) {
                    const data = await resDecisions.json();
                    setDecisions(data);
                }

                const resSession = await fetch("/api/auth/session");
                if (resSession.ok) {
                    const sessionData = await resSession.json();
                    if (sessionData.authenticated) {
                        setCurrentUser(sessionData.user);
                    }
                }
            } catch (err) {
                console.error("Error fetching project details", err);
                const matched = PROJECTS_DATA[id];
                if (matched) setProject(matched);
            }
        }
        fetchProjectDetails();
    }, [id]);

    useEffect(() => {
        if (currentUser) {
            setMembers(prev => {
                const exists = prev.some(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
                if (!exists) {
                    return [...prev, {
                        id: currentUser.id,
                        name: currentUser.name,
                        email: currentUser.email,
                        role: "Owner"
                    }];
                }
                return prev;
            });
        }
    }, [currentUser]);

    const canAddMembers = currentUser ? members.some(m => m.email.toLowerCase() === currentUser.email.toLowerCase() && m.role === "Owner") : true;
    const canSendReminder = members.length > 1;
    const isOwnerOrMember = (() => {
        if (!currentUser) return true; // Default true for testing
        const isMem = members.some(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
        const isOwn = project?.owner_id === currentUser.id;
        return isMem || isOwn;
    })();

    const toggleTaskStatus = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Cycle: not_started -> next_action -> blocked -> done -> not_started
        let nextStatus: Task["status"] = "not_started";
        if (task.status === "not_started") nextStatus = "next_action";
        else if (task.status === "next_action") nextStatus = "blocked";
        else if (task.status === "blocked") nextStatus = "done";
        else if (task.status === "done") nextStatus = "not_started";

        // Optimistic UI
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));

        try {
            await fetch(`/api/tasks`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: taskId,
                    status: nextStatus
                })
            });
        } catch (err) {
            console.error("Error toggling task status on server", err);
        }
    };

    const handleAddTask = async () => {
        const title = prompt("Enter new task title:");
        if (title && title.trim()) {
            const tempId = String(Date.now());
            const payload = {
                id: tempId,
                projectId: id,
                title: title.trim(),
                description: "",
                status: "not_started",
                priority: "medium",
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            // Optimistic UI
            setTasks(prev => [...prev, {
                id: tempId,
                project_id: id,
                title: payload.title,
                description: payload.description,
                status: "not_started",
                priority: "medium",
                due_date: payload.due_date
            }]);

            try {
                const res = await fetch(`/api/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const saved = await res.json();
                    setTasks(prev => prev.map(t => t.id === tempId ? saved : t));
                }
            } catch (err) {
                console.error("Error adding task to server", err);
            }
        }
    };

    const handleContinueToChat = () => {
        localStorage.setItem(
            "chat_incoming_prompt", 
            `I want to continue work on the "${project.title}" folder (${project.type}). Let's review the pending tasks:\n* ${tasks.filter(t => t.status !== "done").map(t => t.title).join("\n* ")}`
        );
        router.push("/chat");
    };

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError(null);
        if (!inviteEmail || !inviteEmail.trim()) {
            setInviteError("Email is required");
            return;
        }

        setInviteLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
            });

            if (res.ok) {
                const newMember = await res.json();
                setMembers(prev => {
                    if (prev.some(m => m.email.toLowerCase() === newMember.email.toLowerCase())) {
                        return prev;
                    }
                    return [...prev, newMember];
                });
                setInviteEmail("");
                triggerToast(`Teammate invited: ${newMember.name}`);
            } else {
                const err = await res.json();
                setInviteError(err.error || "Failed to invite teammate");
            }
        } catch (err) {
            console.error("Error inviting teammate:", err);
            setInviteError("Error inviting teammate. Please try again.");
        } finally {
            setInviteLoading(false);
        }
    };

    const [isReminding, setIsReminding] = useState(false);

    const handleSendMeetingReminder = async () => {
        if (!canSendReminder || isReminding) return;

        setIsReminding(true);
        try {
            const res = await fetch(`/api/projects/${id}/remind`, {
                method: "POST"
            });

            if (res.ok) {
                triggerToast("Meeting reminder sent to members!");
            } else {
                const err = await res.json();
                triggerToast(err.error || "Failed to send reminder");
            }
        } catch (err) {
            console.error("Error sending meeting reminder:", err);
            triggerToast("Error sending reminder");
        } finally {
            setIsReminding(false);
        }
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header (Adapting Planning Header layout) */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/projects")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#121419] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-colors cursor-pointer"
                    aria-label="Back to folders"
                >
                    <ArrowLeft size={18} />
                </button>
                
                <h1 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Planning</h1>

                {/* Done button on the right */}
                <button
                    onClick={() => router.push("/projects")}
                    className="text-[10px] font-bold text-white hover:opacity-85 uppercase tracking-wider bg-[#2d7fe0] px-3.5 py-1.5 rounded-full shadow-md cursor-pointer border-none"
                >
                    Done
                </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-5 scrollbar-hide relative">
                
                {/* Title, Date and Status row */}
                <div className="flex flex-col gap-2.5">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{project.title}</h2>
                        <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mt-1 block">
                            Sprint End: {project.date}
                        </span>
                    </div>

                    {/* Project Status Dropdown Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Status:
                        </span>
                        <select
                            value={project.status || "Planning"}
                            onChange={async (e) => {
                                const nextStatus = e.target.value;
                                setProject(prev => ({ ...prev, status: nextStatus }));
                                try {
                                    await fetch(`/api/projects/${id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: nextStatus })
                                    });
                                    triggerToast(`Project status: ${nextStatus}`);
                                } catch (err) {
                                    console.error("Failed to update status on server", err);
                                    triggerToast("Failed to update status");
                                }
                            }}
                            className="bg-[#111318] border border-[var(--app-card-border)] text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer font-semibold uppercase tracking-wider"
                        >
                            {["Idea", "Planning", "In Progress", "Review", "Completed", "Archived"].map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Schedule Card Grid (Adapting Date Card & Location Box from IMG_2573.JPG) */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                    
                    {/* Left Card: Date block */}
                    <div className="bg-[#2d7fe0] border-none rounded-[28px] p-4.5 flex flex-col justify-between h-[120px] relative overflow-hidden shadow-lg hover:rotate-[-1deg] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <span className="text-3.5xl font-black tracking-tight text-white leading-none">21</span>
                            <button className="text-blue-100 hover:text-white transition-colors cursor-pointer">
                                <LinkIcon size={14} />
                            </button>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-blue-100 block uppercase tracking-wider">November</span>
                            <span className="text-[9px] text-blue-200 block mt-0.5">10:00 AM Meeting</span>
                        </div>
                    </div>

                    {/* Right Card: Location block (Refined for Dark mode Co-Founder space) */}
                    <div className="bg-[#fbbf24] border-none rounded-[28px] p-4.5 flex flex-col justify-between h-[120px] shadow-lg hover:rotate-[1deg] transition-all duration-300">
                        <div>
                            <span className="text-[9px] font-bold text-amber-950 uppercase tracking-widest block">Location</span>
                            <span className="text-xs font-black text-amber-950 block mt-1 truncate">
                                zoom.us/j/pal-sync
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText("https://zoom.us/j/pal-sync");
                                setShowSuccessToast(true);
                                setTimeout(() => setShowSuccessToast(false), 2000);
                            }}
                            className="w-full py-2 rounded-full bg-amber-950/10 hover:bg-amber-950/20 text-[9px] font-bold text-amber-950 uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1 border-none"
                        >
                            <Share2 size={10} className="text-amber-950" />
                            <span>Share link</span>
                        </button>
                    </div>

                </div>

                {/* Members Section (Adapting Members (2) and Send meeting reminder) */}
                <div 
                    onClick={() => setShowMembersModal(true)}
                    className="bg-[#181922] border border-zinc-800 rounded-[28px] p-5 space-y-3 shrink-0 cursor-pointer hover:border-zinc-700 transition-colors shadow-lg"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Members ({members.length})</h3>
                        <button 
                            onClick={(e) => { 
                                if (canAddMembers) {
                                    e.stopPropagation(); 
                                    setShowMembersModal(true); 
                                }
                             }}
                             disabled={!canAddMembers}
                             className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-all border shrink-0 ${
                                 canAddMembers 
                                     ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer active:scale-95 shadow-md shadow-emerald-500/5" 
                                     : "bg-zinc-900/40 border-zinc-800/40 text-zinc-500 cursor-not-allowed"
                             }`}
                            aria-label="Invite teammate"
                        >
                            <Plus size={8} strokeWidth={3} />
                            <span>Add Members</span>
                        </button>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        {/* Avatars/Initials Stack */}
                        <div className="flex -space-x-2.5 items-center overflow-hidden">
                            {members.map((member, index) => {
                                const initial = member.name ? member.name.charAt(0).toUpperCase() : "?";
                                // Harmonious dark HSL colors for avatars
                                const colorIndex = (member.name || "").charCodeAt(0) % 5;
                                const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-indigo-500"];
                                return (
                                    <div 
                                        key={member.id || index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedContributionMember(member);
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 border-[#181922] flex items-center justify-center text-[9.5px] font-bold text-white shrink-0 uppercase cursor-pointer hover:scale-110 active:scale-95 hover:z-30 transition-all ${colors[colorIndex]}`}
                                        title={`${member.name} (${member.role || "Member"}) - View contribution history`}
                                    >
                                        {initial}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Send Meeting Reminder action pill */}
                        <button
                            onClick={handleSendMeetingReminder}
                            disabled={!canSendReminder || isReminding}
                            className={`px-3 py-1.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all shrink-0 ${
                                canSendReminder 
                                    ? "bg-amber-500/10 border-amber-500/35 text-amber-400 hover:bg-amber-500/20 cursor-pointer active:scale-95 shadow-md shadow-amber-500/5" 
                                    : "bg-zinc-900/40 border-zinc-800/40 text-zinc-500 cursor-not-allowed"
                            }`}
                        >
                            <span>{isReminding ? "Sending..." : "Send reminder"}</span>
                            <ChevronRight size={9} className={canSendReminder ? "text-amber-500" : "text-zinc-700"} />
                        </button>
                    </div>
                </div>

                {/* Goals List (Adapting Goals (3) numbered nodes section) */}
                <div className="bg-[#0b0c10] border border-zinc-900 rounded-[28px] p-5.5 space-y-4.5 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Tasks ({tasks.length})</h3>
                        <button 
                            onClick={handleAddTask}
                            className="w-7 h-7 rounded-full bg-[#121419] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer hover:scale-105 active:scale-95 transition-all"
                            aria-label="Add task"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Goal Row items */}
                    <div className="space-y-4">
                        {tasks.map((task, i) => {
                            const isDone = task.status === "done";
                            const isBlocked = task.status === "blocked";
                            const isNextAction = task.status === "next_action";

                            let badgeClass = "border border-amber-500/30 bg-amber-500/10 text-amber-400";
                            let statusLabel = "Pending";

                            if (isDone) {
                                badgeClass = "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
                                statusLabel = "Success";
                            } else if (isBlocked) {
                                badgeClass = "border border-red-500/30 bg-red-500/10 text-red-400";
                                statusLabel = "Failed";
                            } else if (isNextAction) {
                                badgeClass = "border border-blue-500/30 bg-blue-500/10 text-blue-400";
                                statusLabel = "Submitted";
                            }

                            return (
                                <div key={task.id} className="flex justify-between items-center gap-3 bg-zinc-950/40 border border-zinc-900/50 p-3.5 rounded-[18px] hover:border-zinc-800 transition-colors">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        {/* Status badge from Sample 4 */}
                                        <button
                                            onClick={() => toggleTaskStatus(task.id)}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer select-none active:scale-95 ${badgeClass}`}
                                            aria-label="Toggle task status"
                                        >
                                            {isDone && <Check size={8} strokeWidth={3} />}
                                            {isBlocked && <span className="text-[9px] font-black leading-none">×</span>}
                                            {isNextAction && <span className="text-[8px] font-black leading-none">▶</span>}
                                            {!isDone && !isBlocked && !isNextAction && <span className="text-[8px] font-black leading-none">●</span>}
                                            <span>{statusLabel}</span>
                                        </button>

                                        <div className="min-w-0">
                                            <span className={`text-[11px] font-bold mt-0.5 block truncate leading-snug ${
                                                isDone ? "text-zinc-500 line-through font-normal" : "text-white"
                                            }`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span className="text-[9px] text-zinc-500 block truncate mt-0.5">{task.description}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Task controls */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button 
                                            onClick={() => handleStartEditTask(task)}
                                            className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 cursor-pointer active:scale-95 transition-all"
                                            aria-label="Edit task"
                                        >
                                            <Edit2 size={10} />
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Delete this task?")) {
                                                    setTasks(prev => prev.filter(t => t.id !== task.id));
                                                    await fetch(`/api/tasks?id=${task.id}`, { method: "DELETE" });
                                                }
                                            }}
                                            className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-zinc-700 cursor-pointer active:scale-95 transition-all"
                                            aria-label="Delete task"
                                        >
                                            <MoreHorizontal size={10} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Decisions Log Section */}
                <div className="bg-[#0b0c10] border border-zinc-900 rounded-[28px] p-5.5 space-y-4.5 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Decisions Log ({decisions.length})</h3>
                        <button 
                            onClick={() => setShowAddDecisionModal(true)}
                            className="w-7 h-7 rounded-full bg-[#121419] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer hover:scale-105 active:scale-95 transition-all"
                            aria-label="Add decision"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {decisions.length === 0 ? (
                            <p className="text-[10.5px] text-zinc-500 italic text-center py-4">No decisions logged yet. Chat with Pal to make startup decisions or click the plus button to add one manually.</p>
                        ) : (
                            decisions.map((dec) => (
                                <div key={dec.id} className="flex justify-between items-start gap-3 bg-zinc-950/40 border border-zinc-900/50 p-3.5 rounded-[18px]">
                                    <div className="min-w-0">
                                        <span className="text-[11px] font-bold text-white leading-snug block">
                                            {dec.title}
                                        </span>
                                        {dec.description && (
                                            <span className="text-[9.5px] text-zinc-400 block mt-1 leading-relaxed">{dec.description}</span>
                                        )}
                                        <span className="text-[8px] text-zinc-600 block mt-1">Logged on {new Date(Number(dec.created_at || Date.now())).toLocaleDateString()}</span>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (confirm("Delete this decision?")) {
                                                setDecisions(prev => prev.filter(d => d.id !== dec.id));
                                                await fetch(`/api/projects/${id}/decisions?id=${dec.id}`, { method: "DELETE" });
                                            }
                                        }}
                                        className="w-6.5 h-6.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-zinc-700 cursor-pointer active:scale-95 transition-all shrink-0"
                                        aria-label="Delete decision"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Co-founder chat helper container */}
                <div className="bg-[#181922] border border-zinc-800 rounded-[28px] p-5 flex gap-3.5 items-start shrink-0 shadow-lg hover:rotate-[-0.5deg] transition-all">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 shrink-0">
                        <MessageSquare size={16} />
                    </div>
                    <div className="flex-1">
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">Pal AI Co-Founder</span>
                        <p className="text-[10.5px] text-zinc-300 mt-1 leading-relaxed font-semibold">
                            Need help establishing database ledger connectors or coding core specs? Delegate this goal directly to your AI engineers.
                        </p>
                        <button
                            onClick={handleContinueToChat}
                            className="mt-3.5 text-[9px] font-bold text-white hover:scale-105 transition-all cursor-pointer bg-purple-600 px-4 py-2 rounded-full uppercase tracking-wider border-none shadow-md"
                        >
                            Delegate Pending Goals
                        </button>
                    </div>
                </div>

                {/* Project Team Chat Sync Card (Inspired by let's stay connected in IMG_2577.JPG) */}
                <div className="bg-gradient-to-br from-[#2d7fe0] to-[#7e22ce] text-white border-none rounded-[28px] p-5.5 flex gap-3.5 items-start shrink-0 shadow-lg hover:rotate-[0.5deg] transition-all">
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white shrink-0">
                        <MessageSquare size={16} />
                    </div>
                    <div className="flex-1">
                        <span className="text-[9px] font-extrabold text-blue-100 uppercase tracking-widest block">Team Workspace Sync</span>
                        <h4 className="text-sm font-bold text-white tracking-tight mt-1">Project Chat Sync</h4>
                        <p className="text-[10.5px] text-blue-100 mt-1 leading-relaxed">
                            Sync chat feeds with team members and receive automated status updates from Pal AI.
                        </p>
                        <button
                            onClick={() => {
                                if (isOwnerOrMember) setShowChatDrawer(true);
                            }}
                            disabled={!isOwnerOrMember}
                            className={`mt-3 text-[8.5px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider border-none transition-all ${
                                isOwnerOrMember
                                    ? "bg-white text-purple-900 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                                    : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed"
                            }`}
                        >
                            {isOwnerOrMember ? "Open Chat Room" : "Chat Locked"}
                        </button>
                    </div>
                </div>

            </div>

            {/* Success toast */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-28 left-4 right-4 z-50 bg-[var(--app-card)] border border-amber-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-black/80"
                    >
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <Check size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-bold text-white font-outfit">Meeting URL copied to clipboard!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Toast Alert */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-neutral-900 border border-[var(--app-card-border)] px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl z-50 whitespace-nowrap min-w-[200px] justify-center"
                    >
                        <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Members & Invitation Modal */}
            <AnimatePresence>
                {showMembersModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end justify-center"
                    >
                        <div 
                            className="absolute inset-0 cursor-pointer" 
                            onClick={() => { setShowMembersModal(false); setInviteError(null); }} 
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="relative w-full max-w-[430px] rounded-t-[28px] bg-[#0c0f14] border-t border-zinc-800 p-6 pt-5 pb-8 flex flex-col max-h-[82%] z-10"
                        >
                            {/* Drag Handle Bar */}
                            <div className="w-12 h-1 rounded-full bg-zinc-800 mx-auto mb-4" />

                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Project Members</h3>
                                <button 
                                    onClick={() => { setShowMembersModal(false); setInviteError(null); }}
                                    className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Members list */}
                            <div className="overflow-y-auto max-h-[220px] pr-1 scrollbar-hide space-y-2.5 my-3">
                                {members.map((member, index) => {
                                    const isOwner = member.role === "Owner";
                                    const isCurrentUser = currentUser && currentUser.email.toLowerCase() === member.email.toLowerCase();
                                    const initial = member.name ? member.name.charAt(0).toUpperCase() : "?";
                                    const colorIndex = (member.name || "").charCodeAt(0) % 5;
                                    const colors = ["bg-blue-600/80", "bg-purple-600/80", "bg-emerald-600/80", "bg-amber-600/80", "bg-indigo-600/80"];

                                    return (
                                        <div 
                                            key={member.id || index} 
                                            onClick={() => {
                                                setShowMembersModal(false);
                                                setSelectedContributionMember(member);
                                            }}
                                            className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 cursor-pointer hover:bg-[#1a1c24] transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 uppercase shrink-0 ${colors[colorIndex]}`}>
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-white block truncate">{member.name}</span>
                                                        {isCurrentUser && (
                                                            <span className="text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-zinc-500 block truncate mt-0.5">{member.email}</span>
                                                </div>
                                            </div>

                                            <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                                                isOwner 
                                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                                            }`}>
                                                {member.role || "Member"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-zinc-900 my-2" />

                            {/* Invite Form */}
                            <form onSubmit={handleInviteMember} className="space-y-4 mt-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Invite Teammate</h4>
                                
                                <div className="space-y-1.5">
                                    <label className="block text-[8.5px] text-zinc-500 uppercase font-bold text-left tracking-wider">
                                        Email Address
                                    </label>
                                    <input 
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="teammate@example.com"
                                        required
                                        className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[8.5px] text-zinc-500 uppercase font-bold text-left tracking-wider">
                                        Project Role
                                    </label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Owner">Owner</option>
                                    </select>
                                </div>

                                {inviteError && (
                                    <p className="text-[10px] text-red-400 font-bold text-left">{inviteError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={inviteLoading || !inviteEmail.trim()}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-none ${
                                        inviteEmail.trim() && !inviteLoading
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer active:scale-[0.97]"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    }`}
                                >
                                    {inviteLoading ? "Sending invite..." : "Send Invitation"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Teammate Work Rate / Contribution Grid Drawer */}
            <AnimatePresence>
                {selectedContributionMember && (() => {
                    const data = getContributionData(selectedContributionMember.id, selectedContributionMember.name);
                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end justify-center"
                        >
                            <div 
                                className="absolute inset-0 cursor-pointer" 
                                onClick={() => setSelectedContributionMember(null)} 
                            />

                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                className="relative w-full max-w-[430px] rounded-t-[32px] bg-[#FAF8F5] p-6 pt-5 pb-8 flex flex-col max-h-[90%] z-10 overflow-y-auto scrollbar-hide text-[#1C1A17] font-outfit"
                            >
                                {/* Drag Handle Bar */}
                                <div className="w-12 h-1 rounded-full bg-zinc-300 mx-auto mb-4" />

                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                                        Teammate Work Rate
                                    </span>
                                    <button 
                                        onClick={() => setSelectedContributionMember(null)}
                                        className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider bg-zinc-200/50 px-3.5 py-1.5 rounded-full cursor-pointer border-none"
                                    >
                                        Close
                                    </button>
                                </div>

                                {/* Main statement block inspired by Image 1 */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 uppercase">
                                            {selectedContributionMember.name ? selectedContributionMember.name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-zinc-900 block leading-tight">{selectedContributionMember.name}</span>
                                            <span className="text-[9px] text-zinc-500 block mt-0.5">{selectedContributionMember.email}</span>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold tracking-tight text-zinc-800 leading-snug">
                                        I will <span className="underline decoration-purple-500 decoration-2 underline-offset-4">commit high quality code</span>, <span className="underline decoration-purple-500 decoration-2 underline-offset-4 font-black">every sprint</span> so that I can <span className="underline decoration-purple-500 decoration-2 underline-offset-4">become a core contributor</span>
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-3 text-zinc-400">
                                        <Clock size={11} className="text-zinc-400" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Last action: today at 4:55PM</span>
                                    </div>
                                </div>

                                {/* Total repetitions card */}
                                <div className="bg-white rounded-[24px] border border-zinc-200/60 p-5 mb-4 shadow-sm">
                                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-0.5">Total repetitions</span>
                                    <span className="text-[9px] font-bold text-zinc-500 block mb-3">Since Nov. 24th, 2023</span>
                                    <span className="text-4xl font-black text-zinc-900 tracking-tight leading-none">{data.totalRepetitions}</span>
                                </div>

                                {/* Contribution map calendar grid */}
                                <div className="bg-white rounded-[24px] border border-zinc-200/60 p-5 mb-4 shadow-sm overflow-x-auto scrollbar-hide">
                                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-4">Contribution History</span>
                                    
                                    <div className="flex items-start min-w-[280px]">
                                        {/* Day labels on left */}
                                        <div className="flex flex-col justify-between text-[8px] font-bold text-zinc-400 pr-2 h-[115px] pt-1 select-none">
                                            <span>S</span>
                                            <span>M</span>
                                            <span>T</span>
                                            <span>W</span>
                                            <span>T</span>
                                            <span>F</span>
                                            <span>S</span>
                                        </div>

                                        {/* Columns of days */}
                                        <div className="flex gap-[3.5px]">
                                            {Array.from({ length: 16 }).map((_, colIdx) => (
                                                <div key={colIdx} className="flex flex-col gap-[3.5px]">
                                                    {Array.from({ length: 7 }).map((_, rowIdx) => {
                                                        const dayIdx = colIdx * 7 + rowIdx;
                                                        const dayData = data.grid[dayIdx];
                                                        if (!dayData) return null;
                                                        
                                                        let colorClass = "bg-[#EBECEF]"; // 0
                                                        if (dayData.value === 1) colorClass = "bg-[#d8b4fe]"; // light purple
                                                        if (dayData.value === 2) colorClass = "bg-[#c084fc]"; // medium purple
                                                        if (dayData.value >= 3) colorClass = "bg-[#a855f7]"; // dark purple
                                                        
                                                        return (
                                                            <div 
                                                                key={rowIdx} 
                                                                className={`w-3.5 h-3.5 rounded-[3.5px] ${colorClass} transition-colors duration-300 hover:scale-110 cursor-pointer`}
                                                                title={`${dayData.date}: ${dayData.value} repetitions`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Month labels under grid */}
                                    <div className="flex justify-between text-[9px] font-bold text-zinc-400 mt-2 pl-6 pr-2 select-none">
                                        <span>Jan</span>
                                        <span>Feb</span>
                                        <span>Mar</span>
                                        <span>Apr</span>
                                    </div>
                                </div>

                                {/* KPI Metrics Row (Completion rate & Longest streak) */}
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="bg-white rounded-[24px] border border-zinc-200/60 p-4.5 shadow-sm">
                                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-2">Completion rate</span>
                                        <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none block">{data.completionRate}%</span>
                                        <span className="text-[8.5px] font-bold text-zinc-500 block mt-2.5">Avg. this month</span>
                                    </div>

                                    <div className="bg-white rounded-[24px] border border-zinc-200/60 p-4.5 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-2">Longest streak</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none">{data.longestStreak}</span>
                                                <span className="text-2xl text-purple-600 leading-none">🔥</span>
                                            </div>
                                        </div>
                                        <span className="text-[8.5px] font-bold text-zinc-500 block mt-2.5">In March</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Project Team Chat Sync Drawer */}
            <AnimatePresence>
                {showChatDrawer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end justify-center"
                    >
                        <div 
                            className="absolute inset-0 cursor-pointer" 
                            onClick={() => setShowChatDrawer(false)} 
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="relative w-full max-w-[430px] rounded-t-[32px] bg-gradient-to-br from-[#1b1437] via-[#0b0c10] to-[#0a1e1e] p-6 pt-5 pb-8 flex flex-col h-[85%] max-h-[750px] z-10 text-white font-outfit border-t border-white/10"
                        >
                            {/* Drag Handle Bar */}
                            <div className="w-12 h-1 rounded-full bg-zinc-800 mx-auto mb-4" />

                            {/* Header (Matching Image 4 Chat UI) */}
                            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 select-none">
                                <button 
                                    onClick={() => setShowChatDrawer(false)}
                                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-xs font-black text-white uppercase relative">
                                        PAL
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-[#12141C]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xs font-bold text-white leading-tight">Pal AI Coordinator</h3>
                                        <span className="text-[8.5px] text-zinc-400 block mt-0.5">Online & Synced</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => alert("Starting call...")}
                                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-all border-none"
                                        aria-label="Phone call"
                                    >
                                        <Phone size={13} />
                                    </button>
                                    <button 
                                        onClick={() => alert("Project Workspace Info")}
                                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-all border-none"
                                        aria-label="Info"
                                    >
                                        <Info size={13} />
                                    </button>
                                </div>
                            </div>

                            {(() => {
                                const isOwnerOrMember = (() => {
                                    if (!currentUser) return true; // Default true for testing
                                    const isMem = members.some(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
                                    const isOwn = project?.owner_id === currentUser.id;
                                    return isMem || isOwn;
                                })();

                                if (!isOwnerOrMember) {
                                    return (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
                                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
                                                <Lock size={28} />
                                            </div>
                                            <h3 className="text-base font-bold text-white mb-2">Workspace Access Locked</h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px]">
                                                Only the project owner and invited teammates can view and participate in this sync workspace room.
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {/* Sub-header members stack */}
                                        <div className="flex items-center gap-2 mb-4 bg-white/5 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-white/10">
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Sync feed:</span>
                                            <div className="flex -space-x-1.5 items-center overflow-hidden">
                                                {members.map((member, index) => {
                                                    const initial = member.name ? member.name.charAt(0).toUpperCase() : "?";
                                                    const colorIndex = (member.name || "").charCodeAt(0) % 5;
                                                    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-indigo-500"];
                                                    return (
                                                        <div 
                                                            key={member.id || index}
                                                            className={`w-6 h-6 rounded-full border border-zinc-950 flex items-center justify-center text-[8px] font-bold text-white shrink-0 uppercase ${colors[colorIndex]}`}
                                                            title={member.name}
                                                        >
                                                            {initial}
                                                        </div>
                                                    );
                                                })}
                                                <div 
                                                    className="w-6 h-6 rounded-full border border-zinc-950 bg-purple-600 flex items-center justify-center text-[8px] font-black text-white shrink-0 uppercase tracking-tighter"
                                                    title="Pal AI Bot"
                                                >
                                                    PAL
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-zinc-400 font-medium ml-auto">
                                                {members.length + 1} online
                                            </span>
                                        </div>

                                        {/* Message container (Clean transparent list floating on drawer gradient background) */}
                                        <div className="flex-1 flex flex-col p-2 mb-4 overflow-y-auto scrollbar-hide space-y-4 relative">
                                            {chatMessages.map((msg) => {
                                                const isCurrentUser = msg.sender.toLowerCase() === (currentUser?.name || "Emmanuel").toLowerCase();
                                                return (
                                                    <div 
                                                        key={msg.id}
                                                        className={`flex flex-col ${isCurrentUser ? "items-end self-end" : "items-start self-start"} max-w-[85%]`}
                                                    >
                                                        <span className={`text-[9.5px] font-bold mb-1 ${isCurrentUser ? "text-blue-300" : "text-purple-400"}`}>
                                                            {msg.sender}
                                                        </span>
                                                        <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                                                            isCurrentUser 
                                                                ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 rounded-tr-none text-white shadow-lg shadow-purple-500/10 border border-purple-500/20" 
                                                                : "bg-white/10 backdrop-blur-md border border-white/5 rounded-tl-none text-zinc-100"
                                                        }`}>
                                                            {msg.text}
                                                            <span className={`text-[7.5px] block text-right mt-2 ${isCurrentUser ? "text-blue-200" : "text-zinc-500"}`}>
                                                                {msg.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {isPalTyping && (
                                                <div className="flex flex-col items-start self-start max-w-[85%]">
                                                    <span className="text-[9.5px] font-bold mb-1 text-purple-400">Pal AI</span>
                                                    <div className="bg-white/10 backdrop-blur-md border border-white/5 rounded-2xl rounded-tl-none px-4.5 py-3 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Input form */}
                                        <form onSubmit={handleSendChatMessage} className="relative mt-auto">
                                            <input 
                                                type="text"
                                                value={chatInputText}
                                                onChange={(e) => setChatInputText(e.target.value)}
                                                placeholder="Type a message or ask for status..."
                                                className="w-full bg-[#1A1D26]/60 backdrop-blur-sm border border-zinc-800 text-xs text-white rounded-full pl-4.5 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-600"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!chatInputText.trim()}
                                                className={`absolute right-1.5 top-1.5 w-9 h-9 rounded-full flex items-center justify-center transition-all border-none ${
                                                    chatInputText.trim()
                                                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white cursor-pointer active:scale-95 shadow-md shadow-purple-500/10"
                                                        : "bg-zinc-800 text-zinc-550 cursor-not-allowed"
                                                }`}
                                            >
                                                <Send size={12} />
                                            </button>
                                        </form>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Edit Task Drawer */}
            <AnimatePresence>
                {editingTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end justify-center"
                    >
                        <div 
                            className="absolute inset-0 cursor-pointer" 
                            onClick={() => setEditingTask(null)} 
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="relative w-full max-w-[430px] rounded-t-[32px] bg-[#0c0f14] border-t border-zinc-800 p-6 pt-5 pb-8 flex flex-col max-h-[90%] z-10 text-white font-outfit"
                        >
                            {/* Drag Handle Bar */}
                            <div className="w-12 h-1 rounded-full bg-zinc-800 mx-auto mb-4" />

                            <div className="flex justify-between items-center mb-5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                                    Edit Task Details
                                </span>
                                <button 
                                    onClick={() => setEditingTask(null)}
                                    className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-all border-none"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveTask} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[8.5px] text-zinc-500 uppercase font-bold text-left tracking-wider">
                                        Task Title
                                    </label>
                                    <input 
                                        type="text"
                                        value={editTaskTitle}
                                        onChange={(e) => setEditTaskTitle(e.target.value)}
                                        required
                                        placeholder="Task title"
                                        className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[8.5px] text-zinc-500 uppercase font-bold text-left tracking-wider">
                                        Description / Details
                                    </label>
                                    <textarea 
                                        value={editTaskDescription}
                                        onChange={(e) => setEditTaskDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Add descriptive details..."
                                        className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-700 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="block text-[8.5px] text-zinc-500 uppercase font-bold text-left tracking-wider">
                                            Status Badge
                                        </label>
                                        <select
                                            value={editTaskStatus}
                                            onChange={(e) => setEditTaskStatus(e.target.value)}
                                            className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 cursor-pointer"
                                        >
                                            <option value="not_started">Pending</option>
                                            <option value="next_action">Submitted</option>
                                            <option value="blocked">Failed</option>
                                            <option value="done">Success</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[8.5px] text-zinc-500 uppercase font-bold text-left tracking-wider">
                                            Priority Level
                                        </label>
                                        <select
                                            value={editTaskPriority}
                                            onChange={(e) => setEditTaskPriority(e.target.value)}
                                            className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 cursor-pointer"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!editTaskTitle.trim()}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-none ${
                                        editTaskTitle.trim()
                                            ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-[0.97] shadow-md shadow-purple-500/10"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    }`}
                                >
                                    Save Task Changes
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Add Decision Modal */}
            <AnimatePresence>
                {showAddDecisionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-50 flex items-end justify-center"
                    >
                        <div 
                            className="absolute inset-0 cursor-pointer" 
                            onClick={() => setShowAddDecisionModal(false)} 
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="relative w-full max-w-[430px] rounded-t-[28px] bg-[#0c0f14] border-t border-zinc-800 p-6 pt-5 pb-8 flex flex-col max-h-[82%] z-10 text-white font-outfit"
                        >
                            {/* Drag Handle Bar */}
                            <div className="w-12 h-1 rounded-full bg-zinc-800 mx-auto mb-4" />

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Log Startup Decision</h3>
                                <button 
                                    onClick={() => setShowAddDecisionModal(false)}
                                    className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>

                            <form onSubmit={handleAddDecisionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 pl-0.5 text-left text-zinc-400">
                                        Decision Title
                                    </label>
                                    <input
                                        value={decisionTitle}
                                        onChange={(e) => setDecisionTitle(e.target.value)}
                                        placeholder="e.g. Use local SQLite fallback"
                                        className="h-[44px] w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-700"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 pl-0.5 text-left text-zinc-400">
                                        Description / Rationale
                                    </label>
                                    <textarea
                                        value={decisionDesc}
                                        onChange={(e) => setDecisionDesc(e.target.value)}
                                        placeholder="Explain the rationale behind this decision..."
                                        rows={3}
                                        className="w-full bg-[#121419] border border-zinc-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-700 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-[46px] rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all mt-4 cursor-pointer border-none"
                                >
                                    <Check size={14} strokeWidth={2.5} />
                                    <span>Log Decision</span>
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav activePage="projects" />
        </div>
    );
}
