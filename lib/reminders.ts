import { Database } from "./db";

export async function checkReminderTriggers(db: Database) {
    try {
        const nowMs = Date.now();
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

        // 48 hours from now
        const fortyEightHoursLater = new Date(nowMs + 48 * 60 * 60 * 1000);
        const fortyEightHoursLaterStr = fortyEightHoursLater.toISOString().split("T")[0];

        // 1. Task Overdue: due_date < todayStr, status != 'done'
        const overdueTasks = await db.all(
            "SELECT * FROM tasks WHERE status != 'done' AND due_date IS NOT NULL AND due_date != ''"
        );

        for (const task of overdueTasks) {
            if (task.due_date < todayStr) {
                const id = `overdue_${task.id}`;
                const title = "Overdue Task Alert";
                const text = `Task "${task.title}" was due on ${task.due_date} but is still marked as ${task.status.replace("_", " ")}.`;

                await db.run(
                    `INSERT OR IGNORE INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                     VALUES (?, ?, ?, 'Just now', 1, 'Today', 'map', 'View Project', ?)`,
                    [id, title, text, `/projects/${task.project_id}`]
                );
            }
        }

        // 2. Deadline Approaching: todayStr <= due_date <= fortyEightHoursLaterStr, status != 'done'
        const approachingTasks = await db.all(
            "SELECT * FROM tasks WHERE status != 'done' AND due_date IS NOT NULL AND due_date != ''"
        );

        for (const task of approachingTasks) {
            if (task.due_date >= todayStr && task.due_date <= fortyEightHoursLaterStr) {
                const id = `approaching_${task.id}`;
                const title = "Task Deadline Approaching";
                const text = `Task "${task.title}" is due soon on ${task.due_date}.`;

                await db.run(
                    `INSERT OR IGNORE INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                     VALUES (?, ?, ?, 'Just now', 1, 'Today', 'grid', 'View Project', ?)`,
                    [id, title, text, `/projects/${task.project_id}`]
                );
            }
        }

        // 3. Task Blocked: status === 'blocked'
        const blockedTasks = await db.all("SELECT * FROM tasks WHERE status = 'blocked'");

        for (const task of blockedTasks) {
            const id = `blocked_${task.id}`;
            const title = "Blocked Task Alert";
            const text = `Task "${task.title}" is currently blocked.`;

            await db.run(
                `INSERT OR IGNORE INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                 VALUES (?, ?, ?, 'Just now', 1, 'Today', 'heart', 'View Project', ?)`,
                [id, title, text, `/projects/${task.project_id}`]
            );
        }

        // 4. No Activity: Project created > 7 days ago with no tasks updated/created in the last 7 days.
        const planningProjects = await db.all("SELECT * FROM projects WHERE status = 'Planning'");
        const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;

        for (const proj of planningProjects) {
            let projectDate = new Date(proj.date);
            if (isNaN(projectDate.getTime())) {
                const parts = proj.date.split("/");
                if (parts.length === 3) {
                    projectDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
            }

            if (!isNaN(projectDate.getTime()) && projectDate.getTime() < sevenDaysAgoMs) {
                // Check if any tasks were created in the last 7 days
                const recentTasks = await db.get(
                    "SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND created_at > ?",
                    [proj.id, sevenDaysAgoMs]
                );

                if (recentTasks.count === 0) {
                    const id = `inactive_${proj.id}`;
                    const title = "Inactive Project Workspace";
                    const text = `The "${proj.title}" folder is still in planning stage with no recent sprints. Tap to check pending goals.`;

                    await db.run(
                        `INSERT OR IGNORE INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                         VALUES (?, ?, ?, 'Just now', 1, 'Today', 'grid', 'Review Goals', ?)`,
                        [id, title, text, `/projects/${proj.id}`]
                    );
                }
            }
        }
    } catch (err) {
        console.error("Error running reminder triggers calculation:", err);
    }
}
