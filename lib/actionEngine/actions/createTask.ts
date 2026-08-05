import { ActionType } from "../types.ts";
import type { ActionHandler, CreateTaskParams, ValidationResult } from "../types.ts";

export const createTaskHandler: ActionHandler<CreateTaskParams> = {
    type: ActionType.CREATE_TASK,

    async validate(params: CreateTaskParams, _userId: string, db: any): Promise<ValidationResult> {
        const errors: string[] = [];

        if (!params || typeof params !== "object") {
            return { valid: false, errors: ["Missing or invalid payload parameters"] };
        }

        if (!params.title || typeof params.title !== "string" || !params.title.trim()) {
            errors.push("Task title is required");
        }

        if (!params.projectId || typeof params.projectId !== "string") {
            errors.push("Target project ID is required");
        } else if (db) {
            const project = await db.get("SELECT id FROM projects WHERE id = ?", [params.projectId]);
            if (!project) {
                errors.push(`Referenced project ID '${params.projectId}' does not exist`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    async execute(params: CreateTaskParams, userId: string, db: any) {
        const now = Date.now();
        const taskId = `task_${now}_${Math.random().toString(36).slice(2, 8)}`;
        const status = params.status || "not_started";
        const priority = (params.priority || "medium").toLowerCase();
        const assigneeId = userId === "current_user" ? null : userId;
        const dueDate = params.dueDate || new Date(now).toISOString().split("T")[0];
        try {
            await db.run("ALTER TABLE tasks ADD COLUMN created_at BIGINT");
        } catch (e) {}

        await db.run(
            `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                taskId,
                params.projectId,
                params.title.trim(),
                params.description || "",
                status,
                priority,
                assigneeId,
                dueDate,
                now,
            ]
        );

        const taskRecord = await db.get("SELECT * FROM tasks WHERE id = ?", [taskId]);

        return {
            task: taskRecord,
            message: `Task "${params.title}" created successfully.`,
        };
    },
};
