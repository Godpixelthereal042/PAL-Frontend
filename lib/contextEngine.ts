/**
 * Business Context Engine
 *
 * PAL Milestone 2A — Business Context Engine
 *
 * This module provides the central intelligence layer that gathers, normalizes,
 * and structures everything PAL knows about a founder and their business from
 * all data sources (Business Brain, Profile, Projects, Tasks, Calendar, Notifications, Invoices)
 * into a single unified context object before any AI request is processed.
 *
 * NOTE: This engine ONLY collects and structures data. It does NOT call Gemini or generate AI responses.
 *
 * Reference: PAL-DOC-003 (AI Architecture) §03, PAL-DOC-002 (MVP) §04
 */

import { getDB } from "./db.ts";
import { getBusinessBrain, type BusinessBrainSnapshot } from "./businessBrain.ts";
import { getActiveDecisions } from "./decisionMemory.ts";
import { relationshipEngine } from "./relationships/relationshipEngine.ts";
import type { RelationshipContext } from "./relationships/types.ts";

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface FounderContext {
    id: string;
    name: string;
    email: string;
    role: string;
    persona: string;
    company: string | null;
}

export interface BusinessBrainGoalContext {
    id: string;
    title: string;
    description: string | null;
    timeframe: string | null;
    status: string;
}

export interface BusinessBrainOfferContext {
    id: string;
    name: string;
    description: string | null;
    type: string | null;
    price: string | null;
    status: string;
}

export interface BusinessBrainCustomerSegmentContext {
    id: string;
    name: string;
    description: string | null;
}

export interface BusinessBrainChallengeContext {
    id: string;
    title: string;
    description: string | null;
    severity: string;
    status: string;
}

export interface BusinessBrainNoteContext {
    id: string;
    content: string;
    category: string | null;
}

export interface BusinessBrainDetailsContext {
    name: string | null;
    description: string | null;
    industry: string | null;
    stage: string | null;
    targetMarket: string | null;
    priorities: string | null;
    goals: BusinessBrainGoalContext[];
    offers: BusinessBrainOfferContext[];
    customerSegments: BusinessBrainCustomerSegmentContext[];
    challenges: BusinessBrainChallengeContext[];
    notes: BusinessBrainNoteContext[];
}

export interface MilestoneContext {
    id: string;
    text: string;
    completed: boolean;
}

export interface ProjectContext {
    id: string;
    title: string;
    type: string;
    description: string | null;
    goal: string | null;
    priority: string;
    status: string;
    dueDate: string | null;
    milestones: MilestoneContext[];
}

export interface TaskContext {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
}

export interface CalendarEventContext {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    status: string | null;
}

export interface NotificationContext {
    id: string;
    title: string;
    text: string;
    time: string;
    isUnread: boolean;
    section: string;
}

export interface InvoiceContext {
    id: string;
    client: string;
    amount: string;
    service: string;
    date: string;
    status: string;
}

export interface DecisionContext {
    id: string;
    projectId: string | null;
    title: string;
    description: string | null;
    rationale: string | null;
    impactArea: string | null;
    status: string;
    confirmedAt: number | null;
    createdAt: number;
}

export interface ContextSummary {
    activeProjects: number;
    overdueItems: number;
    highPriorityItems: number;
}

export interface BusinessContext {
    founder: FounderContext;
    business: BusinessBrainDetailsContext | null;
    projects: ProjectContext[];
    tasks: TaskContext[];
    calendar: CalendarEventContext[];
    notifications: NotificationContext[];
    invoices: InvoiceContext[];
    decisions: DecisionContext[];
    relationships?: RelationshipContext;
    summary: ContextSummary;
}

// ---------------------------------------------------------------------------
// Private Helper Data Fetchers
// ---------------------------------------------------------------------------

/**
 * Fetch and assemble Founder context from users and profile tables.
 */
async function fetchFounderContext(db: any, userId: string): Promise<FounderContext> {
    const userRow = await db.get("SELECT id, name, email, role FROM users WHERE id = ?", [userId]);
    const profileRow = (await db.get("SELECT * FROM profile WHERE id = ?", [userId])) ||
                       (await db.get("SELECT * FROM profile WHERE id = 'current_user'"));

    return {
        id: userId,
        name: userRow?.name || profileRow?.fullName || "Founder",
        email: userRow?.email || profileRow?.email || "",
        role: userRow?.role || "Business Owner",
        persona: profileRow?.selectedPersona || "growth",
        company: profileRow?.companyName || null,
    };
}

/**
 * Fetch and map Business Brain data if available.
 */
async function fetchBusinessBrainContext(userId: string): Promise<BusinessBrainDetailsContext | null> {
    try {
        const snapshot: BusinessBrainSnapshot | null = await getBusinessBrain(userId);
        if (!snapshot || !snapshot.brain) {
            return null;
        }

        const { brain, goals, offers, customerSegments, challenges, notes } = snapshot;

        return {
            name: brain.business_name || null,
            description: brain.business_description || null,
            industry: brain.industry || null,
            stage: brain.business_stage || null,
            targetMarket: brain.target_market || null,
            priorities: brain.priorities || null,
            goals: goals.map((g) => ({
                id: g.id,
                title: g.title,
                description: g.description || null,
                timeframe: g.timeframe || null,
                status: g.status || "active",
            })),
            offers: offers.map((o) => ({
                id: o.id,
                name: o.name,
                description: o.description || null,
                type: o.offer_type || null,
                price: o.price || null,
                status: o.status || "active",
            })),
            customerSegments: customerSegments.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description || null,
            })),
            challenges: challenges.map((c) => ({
                id: c.id,
                title: c.title,
                description: c.description || null,
                severity: c.severity || "medium",
                status: c.status || "active",
            })),
            notes: notes.map((n) => ({
                id: n.id,
                content: n.content,
                category: n.category || null,
            })),
        };
    } catch (err) {
        console.warn("ContextEngine: Failed to load Business Brain context:", err);
        return null;
    }
}

/**
 * Fetch active projects and associated milestones.
 */
async function fetchProjectsContext(db: any, userId: string): Promise<ProjectContext[]> {
    try {
        const projects = (await db.all("SELECT * FROM projects WHERE owner_id = ? OR owner_id IS NULL", [userId])) || [];
        const allMilestones = (await db.all("SELECT * FROM milestones")) || [];

        return projects.map((p: any) => {
            const projectMilestones = allMilestones
                .filter((m: any) => m.project_id === p.id)
                .map((m: any) => ({
                    id: m.id,
                    text: m.text,
                    completed: Boolean(m.completed),
                }));

            return {
                id: p.id,
                title: p.title,
                type: p.type || "General",
                description: p.description || null,
                goal: p.goal || null,
                priority: p.priority || "medium",
                status: p.status || "Planning",
                dueDate: p.due_date || p.date || null,
                milestones: projectMilestones,
            };
        });
    } catch (err) {
        console.warn("ContextEngine: Failed to load Projects context:", err);
        return [];
    }
}

/**
 * Fetch tasks.
 */
async function fetchTasksContext(db: any, userId: string): Promise<TaskContext[]> {
    try {
        const tasks = (await db.all("SELECT * FROM tasks WHERE assignee_id = ? OR assignee_id IS NULL", [userId])) || [];

        return tasks.map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            description: t.description || null,
            status: t.status || "not_started",
            priority: t.priority || "medium",
            dueDate: t.due_date || null,
        }));
    } catch (err) {
        console.warn("ContextEngine: Failed to load Tasks context:", err);
        return [];
    }
}

/**
 * Fetch calendar events and schedules.
 */
async function fetchCalendarContext(db: any, userId: string): Promise<CalendarEventContext[]> {
    try {
        const calendarEvents = (await db.all(
            "SELECT * FROM calendar_events WHERE user_id = ? OR user_id = 'current_user' ORDER BY starts_at ASC",
            [userId]
        )) || [];

        if (calendarEvents.length > 0) {
            return calendarEvents.map((c: any) => ({
                id: c.id,
                title: c.title,
                startsAt: c.starts_at,
                endsAt: c.ends_at,
                status: c.status || null,
            }));
        }

        // Fallback to schedules table
        const schedules = (await db.all("SELECT * FROM schedules WHERE user_id = ? OR user_id IS NULL ORDER BY date ASC, time ASC", [userId])) || [];
        return schedules.map((s: any) => ({
            id: s.id,
            title: s.title,
            startsAt: `${s.date}T${s.time}`,
            endsAt: `${s.date}T${s.time}`,
            status: null,
        }));
    } catch (err) {
        console.warn("ContextEngine: Failed to load Calendar context:", err);
        return [];
    }
}

/**
 * Fetch user notifications.
 */
async function fetchNotificationsContext(db: any, userId: string): Promise<NotificationContext[]> {
    try {
        const notifications = (await db.all("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL OR user_id = 'current_user'", [userId])) || [];

        return notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            text: n.text,
            time: n.time,
            isUnread: Boolean(n.isUnread),
            section: n.section || "general",
        }));
    } catch (err) {
        console.warn("ContextEngine: Failed to load Notifications context:", err);
        return [];
    }
}

/**
 * Fetch invoices.
 */
async function fetchInvoicesContext(db: any, userId: string): Promise<InvoiceContext[]> {
    try {
        const invoices = (await db.all("SELECT * FROM invoices WHERE user_id = ? OR user_id IS NULL OR user_id = 'current_user' ORDER BY id DESC", [userId])) || [];

        return invoices.map((i: any) => ({
            id: i.id,
            client: i.client,
            amount: i.amount,
            service: i.service,
            date: i.date,
            status: i.status,
        }));
    } catch (err) {
        console.warn("ContextEngine: Failed to load Invoices context:", err);
        return [];
    }
}

/**
 * Fetch active strategic decisions.
 */
async function fetchDecisionsContext(userId: string): Promise<DecisionContext[]> {
    try {
        const records = await getActiveDecisions(userId);
        return records.map((d) => ({
            id: d.id,
            projectId: d.project_id,
            title: d.title,
            description: d.description,
            rationale: d.rationale,
            impactArea: d.impact_area,
            status: d.status,
            confirmedAt: d.confirmed_at,
            createdAt: d.created_at,
        }));
    } catch (err) {
        console.warn("ContextEngine: Failed to load Decisions context:", err);
        return [];
    }
}

/**
 * Calculate high-level summary metrics across gathered contexts.
 */
function computeContextSummary(
    projects: ProjectContext[],
    tasks: TaskContext[],
    business: BusinessBrainDetailsContext | null,
    invoices: InvoiceContext[]
): ContextSummary {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Active projects count (status not completed / done)
    const activeProjects = projects.filter((p) => {
        const status = p.status.toLowerCase();
        return status !== "completed" && status !== "done";
    }).length;

    // 2. Overdue items count (projects past due date, tasks past due date, overdue invoices)
    let overdueItems = 0;

    for (const p of projects) {
        if (p.dueDate && p.dueDate < todayStr && p.status.toLowerCase() !== "completed") {
            overdueItems++;
        }
    }

    for (const t of tasks) {
        if (t.dueDate && t.dueDate < todayStr && t.status.toLowerCase() !== "done") {
            overdueItems++;
        }
    }

    for (const i of invoices) {
        if (i.status.toLowerCase() === "overdue") {
            overdueItems++;
        }
    }

    // 3. High priority items count (high priority projects, tasks, or challenges)
    let highPriorityItems = 0;

    for (const p of projects) {
        if (p.priority.toLowerCase() === "high") {
            highPriorityItems++;
        }
    }

    for (const t of tasks) {
        if (t.priority.toLowerCase() === "high") {
            highPriorityItems++;
        }
    }

    if (business && business.challenges) {
        for (const c of business.challenges) {
            if (c.severity.toLowerCase() === "high" && c.status.toLowerCase() === "active") {
                highPriorityItems++;
            }
        }
    }

    return {
        activeProjects,
        overdueItems,
        highPriorityItems,
    };
}

// ---------------------------------------------------------------------------
// Public API Function
// ---------------------------------------------------------------------------

/**
 * Builds the complete Business Context for a given user.
 *
 * This function serves as PAL's Context Engine, aggregating all data sources
 * (Founder Profile, Business Brain, Projects, Tasks, Calendar, Notifications, Invoices, Decisions)
 * into a single structured object.
 *
 * @param userId - Unique identifier of the authenticated user
 * @returns Promise resolving to the structured BusinessContext object
 */
export async function buildBusinessContext(userId: string): Promise<BusinessContext> {
    const db = await getDB();

    // Execute independent data fetches concurrently for optimal performance
    const [founder, business, projects, tasks, calendar, notifications, invoices, decisions, relationships] = await Promise.all([
        fetchFounderContext(db, userId),
        fetchBusinessBrainContext(userId),
        fetchProjectsContext(db, userId),
        fetchTasksContext(db, userId),
        fetchCalendarContext(db, userId),
        fetchNotificationsContext(db, userId),
        fetchInvoicesContext(db, userId),
        fetchDecisionsContext(userId),
        relationshipEngine.getRelationshipContext(userId).catch(() => undefined),
    ]);

    const summary = computeContextSummary(projects, tasks, business, invoices);

    return {
        founder,
        business,
        projects,
        tasks,
        calendar,
        notifications,
        invoices,
        decisions,
        relationships,
        summary,
    };
}
