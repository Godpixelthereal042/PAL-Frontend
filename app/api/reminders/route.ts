import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
    try {
        const db = await getDB();
        const nowMs = Date.now();
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const triggered: any[] = [];

        // 1. Find overdue tasks
        // Select tasks that are not 'done' and have a due date in the past
        const tasks = await db.all("SELECT * FROM tasks WHERE status != 'done' AND due_date IS NOT NULL AND due_date != ''");
        
        for (const task of tasks) {
            if (task.due_date < todayStr) {
                const title = "Overdue Task Alert";
                const text = `Task "${task.title}" was due on ${task.due_date} but is still marked as ${task.status.replace('_', ' ')}.`;
                
                // Deduplicate: check if a notification with this title and text already exists
                const existing = await db.get("SELECT id FROM notifications WHERE title = ? AND text = ?", [title, text]);
                if (!existing) {
                    const id = `reminder_task_${task.id}_${nowMs}`;
                    await db.run(
                        `INSERT INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                         VALUES (?, ?, ?, 'Just now', 1, 'Today', 'map', 'View Project', ?)`,
                        [id, title, text, `/projects/${task.project_id}`]
                    );
                    triggered.push({ id, title, text });
                }
            }
        }

        // 2. Find Planning projects with no activity for 7 days
        // We'll check projects with status 'Planning' that were created/dated more than 7 days ago
        const projects = await db.all("SELECT * FROM projects WHERE status = 'Planning'");
        
        for (const proj of projects) {
            // Attempt to parse the project's date (which might be MM/DD/YYYY or YYYY-MM-DD)
            let projectDate = new Date(proj.date);
            if (isNaN(projectDate.getTime())) {
                // If it is in MM/DD/YYYY format, parse it
                const parts = proj.date.split('/');
                if (parts.length === 3) {
                    projectDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
            }

            if (!isNaN(projectDate.getTime())) {
                const diffTime = Math.abs(nowMs - projectDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 7) {
                    const title = "Inactive Project Workspace";
                    const text = `The "${proj.title}" folder is still in planning stage with no recent sprints. Tap to check pending goals.`;
                    
                    // Deduplicate
                    const existing = await db.get("SELECT id FROM notifications WHERE title = ? AND text = ?", [title, text]);
                    if (!existing) {
                        const id = `reminder_proj_${proj.id}_${nowMs}`;
                        await db.run(
                            `INSERT INTO notifications (id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                             VALUES (?, ?, ?, 'Just now', 1, 'Today', 'grid', 'Review Goals', ?)`,
                            [id, title, text, `/projects/${proj.id}`]
                        );
                        triggered.push({ id, title, text });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            triggeredCount: triggered.length,
            reminders: triggered
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
