import { ActionType } from "../types.ts";
import type { ActionHandler, CreateProjectParams, ValidationResult } from "../types.ts";

const PROJECT_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"];

export const createProjectHandler: ActionHandler<CreateProjectParams> = {
    type: ActionType.CREATE_PROJECT,

    validate(params: CreateProjectParams): ValidationResult {
        const errors: string[] = [];

        if (!params || typeof params !== "object") {
            return { valid: false, errors: ["Missing or invalid payload parameters"] };
        }

        if (!params.title || typeof params.title !== "string" || !params.title.trim()) {
            errors.push("Project title is required");
        }

        if (params.dueDate && isNaN(Date.parse(params.dueDate)) && !/^\d{4}-\d{2}-\d{2}$/.test(params.dueDate)) {
            errors.push("Due date must be a valid YYYY-MM-DD date string");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    async execute(params: CreateProjectParams, userId: string, db: any) {
        const now = Date.now();
        const projectId = `proj_${now}_${Math.random().toString(36).slice(2, 8)}`;
        const dateStr = params.dueDate || new Date(now).toISOString().split("T")[0];
        const color = params.color || PROJECT_COLORS[now % PROJECT_COLORS.length];
        const priority = params.priority ? params.priority.charAt(0).toUpperCase() + params.priority.slice(1).toLowerCase() : "Medium";
        const ownerId = userId === "current_user" ? null : userId;

        await db.run(
            `INSERT INTO projects (id, title, type, description, date, color, goal, priority, status, due_date, owner_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                projectId,
                params.title.trim(),
                params.type || "General",
                params.description || null,
                dateStr,
                color,
                params.goal || null,
                priority,
                "Planning",
                dateStr,
                ownerId,
            ]
        );

        const createdTasks: any[] = [];
        if (Array.isArray(params.tasks) && params.tasks.length > 0) {
            for (const [index, task] of params.tasks.entries()) {
                const taskId = `${projectId}_task_${index + 1}`;
                const taskDueDate = task.dueDate || dateStr;
                const taskPriority = (task.priority || "medium").toLowerCase();

                await db.run(
                    `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        taskId,
                        projectId,
                        task.title.trim(),
                        task.description || "",
                        index === 0 ? "next_action" : "not_started",
                        taskPriority,
                        ownerId,
                        taskDueDate,
                        now + index,
                    ]
                );

                createdTasks.push({
                    id: taskId,
                    projectId,
                    title: task.title,
                    status: index === 0 ? "next_action" : "not_started",
                    priority: taskPriority,
                    dueDate: taskDueDate,
                });
            }
        }

        const projectRecord = await db.get("SELECT * FROM projects WHERE id = ?", [projectId]);

        return {
            project: projectRecord,
            tasks: createdTasks,
            message: `Project "${params.title}" created successfully with ${createdTasks.length} initial tasks.`,
        };
    },
};
