import type { Database } from "./db";

type TaskStatus = "next_action" | "blocked" | "done";
type TaskPriority = "high" | "medium" | "low";

export interface IdeaTaskInput {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
}

export interface IdeaRoadmapInput {
    title: string;
    description: string;
    goal: string;
    priority: string;
    due_date: string;
    tasks: IdeaTaskInput[];
}

export interface CreateProjectFromIdeaInput {
    idea: string;
    industry?: string;
    country?: string;
    language?: string;
}

export interface IdeaEngineResult {
    project: Record<string, unknown>;
    tasks: Record<string, unknown>[];
}

const PROJECT_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"];
const TASK_STATUSES: TaskStatus[] = ["next_action", "blocked", "done"];
const PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

export class IdeaEngineError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = "IdeaEngineError";
        this.status = status;
    }
}

export function validateIdeaInput(input: Partial<CreateProjectFromIdeaInput>): CreateProjectFromIdeaInput {
    const idea = typeof input.idea === "string" ? input.idea.trim() : "";

    if (!idea) {
        throw new IdeaEngineError("Tell PAL the idea you want to turn into a project.", 400);
    }

    if (idea.length < 8) {
        throw new IdeaEngineError("Add a little more detail so PAL can create useful tasks.", 400);
    }

    if (idea.length > 2000) {
        throw new IdeaEngineError("That idea is too long. Shorten it to under 2,000 characters and try again.", 400);
    }

    return {
        idea,
        industry: cleanOptional(input.industry),
        country: cleanOptional(input.country),
        language: cleanOptional(input.language)
    };
}

export function buildFallbackRoadmap(idea: string, industry = "General"): IdeaRoadmapInput {
    const cleanIdea = idea.trim();
    const title = titleFromIdea(cleanIdea);
    const dueDate = daysFromNow(30);

    return {
        title,
        description: `Turn this idea into a focused first project: ${cleanIdea}`,
        goal: `Validate, package, and launch the first useful version of ${title}.`,
        priority: "High",
        due_date: dueDate,
        tasks: [
            {
                title: "Clarify the first user and outcome",
                description: `Define who needs this ${industry.toLowerCase()} idea most and what success looks like for them.`,
                status: "next_action",
                priority: "high",
                due_date: daysFromNow(2)
            },
            {
                title: "List assumptions and blockers",
                description: "Capture unknowns, constraints, risks, and decisions needed before building.",
                status: "blocked",
                priority: "high",
                due_date: daysFromNow(4)
            },
            {
                title: "Draft the simplest project brief",
                description: "Write the offer, scope, target user, and first measurable deliverable.",
                status: "next_action",
                priority: "medium",
                due_date: daysFromNow(7)
            },
            {
                title: "Create the first execution checklist",
                description: "Break the launch into small actions PAL can track daily.",
                status: "next_action",
                priority: "medium",
                due_date: daysFromNow(10)
            },
            {
                title: "Save the original idea",
                description: "Keep the raw idea attached to the project for future review.",
                status: "done",
                priority: "low",
                due_date: daysFromNow(1)
            }
        ]
    };
}

export function normalizeRoadmap(raw: Partial<IdeaRoadmapInput>, idea: string, industry?: string): IdeaRoadmapInput {
    const fallback = buildFallbackRoadmap(idea, industry);
    const tasks = Array.isArray(raw.tasks) && raw.tasks.length > 0 ? raw.tasks : fallback.tasks;

    return {
        title: cleanText(raw.title, fallback.title, 90),
        description: cleanText(raw.description, fallback.description, 500),
        goal: cleanText(raw.goal, fallback.goal, 300),
        priority: normalizePriority(raw.priority, "High"),
        due_date: normalizeDate(raw.due_date, fallback.due_date),
        tasks: tasks.slice(0, 8).map((task, index) => ({
            title: cleanText(task.title, fallback.tasks[index]?.title || `Project task ${index + 1}`, 120),
            description: cleanText(task.description, fallback.tasks[index]?.description || "", 500),
            status: normalizeTaskStatus(task.status, index),
            priority: normalizePriority(task.priority, fallback.tasks[index]?.priority || "medium").toLowerCase(),
            due_date: normalizeDate(task.due_date, fallback.tasks[index]?.due_date || fallback.due_date)
        }))
    };
}

export async function createProjectFromIdea(db: Database, roadmap: IdeaRoadmapInput): Promise<IdeaEngineResult> {
    const now = Date.now();
    const projectId = `proj_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const projectColor = PROJECT_COLORS[now % PROJECT_COLORS.length];
    const projectStatus = roadmap.tasks.some((task) => task.status === "next_action") ? "Next Action" : "Planning";
    const date = roadmap.due_date || new Date(now).toISOString().split("T")[0];

    // Insert project first
    await db.run(
        `INSERT INTO projects (id, title, type, description, date, color, goal, priority, status, due_date, owner_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            projectId,
            roadmap.title,
            "Idea Project",
            roadmap.description,
            date,
            projectColor,
            roadmap.goal,
            roadmap.priority,
            projectStatus,
            roadmap.due_date,
            null
        ]
    );

    // Insert tasks individually — log errors per task but don't crash the entire operation
    for (const [index, task] of roadmap.tasks.entries()) {
        try {
            await db.run(
                `INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    `${projectId}_task_${index + 1}`,
                    projectId,
                    task.title,
                    task.description || "",
                    task.status || normalizeTaskStatus(undefined, index),
                    task.priority || "medium",
                    task.due_date || "",
                    now + index
                ]
            );
        } catch (taskError) {
            console.error(`Failed to insert task ${index + 1} for project ${projectId}:`, taskError);
        }
    }

    const project = await db.get("SELECT * FROM projects WHERE id = ?", [projectId]);
    const tasks = await db.all("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC", [projectId]);
    return { project, tasks };
}

function cleanOptional(value?: string) {
    return typeof value === "string" ? value.trim().slice(0, 120) : undefined;
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
    const text = typeof value === "string" ? value.trim() : "";
    return (text || fallback).slice(0, maxLength);
}

function normalizePriority(value: unknown, fallback: string) {
    const priority = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (PRIORITIES.includes(priority as TaskPriority)) return priority;
    if (["high", "medium", "low"].includes(fallback.toLowerCase())) return fallback;
    return "medium";
}

function normalizeTaskStatus(value: unknown, index: number): TaskStatus {
    const status = typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "_") : "";
    if (TASK_STATUSES.includes(status as TaskStatus)) return status as TaskStatus;
    if (index === 0) return "next_action";
    if (index === 1) return "blocked";
    return "next_action";
}

function normalizeDate(value: unknown, fallback: string) {
    const text = typeof value === "string" ? value.trim() : "";
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
}

function titleFromIdea(idea: string) {
    const words = idea
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5);
    const title = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    return title || "New Idea Project";
}

function daysFromNow(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}
