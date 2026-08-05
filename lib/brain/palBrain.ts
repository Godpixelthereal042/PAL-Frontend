/**
 * PAL BRAIN — Central Business Operating System Intelligence
 * Shared Memory & Context Architecture across Projects, Chat, Calendar, Research, Analytics, Communication & Invoices.
 */

export interface ProjectContext {
    id: string;
    name: string;
    description: string;
    bio: string;
    status: "In Progress" | "Completed" | "Planning";
    dueDate: string;
    owner: string;
    sprint: string;
    team: { name: string; role: string; avatar?: string }[];
    deadlines: { title: string; due: string; priority: "HIGH" | "MEDIUM" }[];
    milestones: { title: string; completed: boolean }[];
    analytics: { metric: string; value: string; trend: string }[];
    connectedAccounts: string[];
    invoices: { id: string; amount: string; status: string }[];
    prdSummary?: string;
    researchSummary?: string;
    latestDecisions: string[];
}

export interface SharedMemoryItem {
    id: string;
    source: "RESEARCH" | "ANALYTICS" | "CALENDAR" | "GMAIL" | "SLACK" | "PROJECT" | "INVOICE" | "CHAT";
    title: string;
    content: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface UniversalCalendarEvent {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    source: "Google Calendar" | "Outlook" | "Apple Calendar" | "PAL Task" | "Milestone";
    attendees: string[];
    hasVideoCall?: boolean;
}

class PalBrainEngine {
    private activeProjectId: string | null = "base-app";
    private projects: Record<string, ProjectContext> = {
        "base-app": {
            id: "base-app",
            name: "The Base App",
            description: "AI-powered mobile application built for Base users to onboard, save, and manage digital assets.",
            bio: "AI-powered mobile application built for Base users to onboard, save, and manage digital assets.",
            status: "In Progress",
            dueDate: "Oct 24, 2026",
            owner: "Emmanuel (Lead)",
            sprint: "Sprint 8",
            team: [
                { name: "Emmanuel", role: "Product Lead", avatar: "/assets/avatar_user.png" },
                { name: "Sarah J.", role: "Lead Designer", avatar: "/assets/avatar_member_1.png" },
                { name: "Mike T.", role: "Fullstack Eng", avatar: "/assets/avatar_member_2.png" }
            ],
            deadlines: [
                { title: "Sign off Base App auth design review", due: "5:00 PM Today", priority: "HIGH" },
                { title: "Review #design logo icon mockups", due: "6:30 PM Today", priority: "MEDIUM" },
                { title: "Prepare Q2 financial appendix for pitch deck", due: "Tomorrow 10:00 AM", priority: "HIGH" }
            ],
            milestones: [
                { title: "User Onboarding & Auth Flow", completed: true },
                { title: "Wallet & Digital Asset Vault Sync", completed: true },
                { title: "Sprint 8 Executive Review", completed: false }
            ],
            analytics: [
                { metric: "Active Users", value: "18.4K", trend: "+24.8%" },
                { metric: "Vault Transactions", value: "$142.5K", trend: "+18.2%" },
                { metric: "Health Score", value: "92/100", trend: "+4.1%" }
            ],
            connectedAccounts: ["Google Workspace", "Slack", "GitHub", "Stripe", "X"],
            invoices: [
                { id: "INV-2026-004", amount: "$2,400.00", status: "PAID" },
                { id: "INV-2026-005", amount: "$1,850.00", status: "PENDING" }
            ],
            prdSummary: "Base App PRD v2.4: Focus on frictionless 1-tap Google OAuth onboarding, encrypted key vaulting, and automatic yield savings routines.",
            researchSummary: "Competitor Research (July 2026): Base App onboarding conversion is 34% higher than traditional Web3 wallets due to social auth flow.",
            latestDecisions: [
                "Approved dark theme UI palette v3.1",
                "Selected Logo Option A for brand launch",
                "Scheduled Series A Pitch Deck appendix for Friday"
            ]
        }
    };

    private memoryItems: SharedMemoryItem[] = [
        {
            id: "mem-1",
            source: "RESEARCH",
            title: "Competitor Pricing & Onboarding Benchmark",
            content: "Analyzed top 5 Web3 fintech apps. Base App pricing ($9.99/mo) is 15% below market average while offering 2.5x faster onboarding.",
            timestamp: Date.now() - 86400000
        },
        {
            id: "mem-2",
            source: "ANALYTICS",
            title: "Weekly Organic Growth Surge",
            content: "CTR on X campaign increased 18% this week. PAL recommends increasing social ad budget by 10%.",
            timestamp: Date.now() - 43200000
        },
        {
            id: "mem-3",
            source: "GMAIL",
            title: "Urgent Client Sign-off Request",
            content: "John from Base sent updated auth mockups. Needs sign-off before 5 PM today.",
            timestamp: Date.now() - 14400000
        }
    ];

    private calendarEvents: UniversalCalendarEvent[] = [
        {
            id: "cal-1",
            title: "Sprint 8 Architecture Review",
            startsAt: "09:15 AM",
            endsAt: "11:45 AM",
            source: "Google Calendar",
            attendees: ["Emmanuel", "Sarah", "Mike"],
            hasVideoCall: true
        },
        {
            id: "cal-2",
            title: "Base App Launch Strategy",
            startsAt: "12:45 PM",
            endsAt: "03:00 PM",
            source: "Outlook",
            attendees: ["Emmanuel", "Sarah"],
            hasVideoCall: true
        },
        {
            id: "cal-3",
            title: "Investor Pitch Alignment Call",
            startsAt: "04:30 PM",
            endsAt: "05:30 PM",
            source: "Apple Calendar",
            attendees: ["Emmanuel", "Sarah"],
            hasVideoCall: true
        }
    ];

    private listeners: Set<() => void> = new Set();

    public subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        this.listeners.forEach((l) => l());
    }

    public getActiveProject(): ProjectContext | null {
        if (!this.activeProjectId) return null;
        return this.projects[this.activeProjectId] || this.projects["base-app"];
    }

    public setActiveProject(id: string) {
        this.activeProjectId = id;
        this.notify();
    }

    public addMemory(item: Omit<SharedMemoryItem, "id" | "timestamp">) {
        const newItem: SharedMemoryItem = {
            ...item,
            id: `mem-${Date.now()}`,
            timestamp: Date.now()
        };
        this.memoryItems.unshift(newItem);
        this.notify();
        return newItem;
    }

    public getMemories(): SharedMemoryItem[] {
        return this.memoryItems;
    }

    public getCalendarEvents(): UniversalCalendarEvent[] {
        return this.calendarEvents;
    }

    public addCalendarEvent(event: Omit<UniversalCalendarEvent, "id">) {
        const newEvent: UniversalCalendarEvent = {
            ...event,
            id: `cal-${Date.now()}`
        };
        this.calendarEvents.push(newEvent);
        this.notify();
        return newEvent;
    }

    public updateContext(context: {
        businessName?: string;
        businessDescription?: string;
        teamSize?: string;
        industry?: string;
        country?: string;
        connectedServices?: string[];
    }) {
        const active = this.getActiveProject();
        if (active) {
            if (context.businessName) active.name = context.businessName;
            if (context.businessDescription) active.description = context.businessDescription;
            if (context.connectedServices) active.connectedAccounts = context.connectedServices;
        }
        this.addMemory({
            source: "PROJECT",
            title: `Business Brain Initialized: ${context.businessName || "New Business"}`,
            content: `Configured business brain for ${context.businessName || "Business"} (${context.industry || "General"} in ${context.country || "Nigeria"}). Team size: ${context.teamSize || "Solo"}.`
        });
        this.notify();
    }
}

export const palBrain = new PalBrainEngine();
