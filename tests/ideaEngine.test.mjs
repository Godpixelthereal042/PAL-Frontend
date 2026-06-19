import assert from "node:assert/strict";
import { test } from "node:test";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const { buildFallbackRoadmap, createProjectFromIdea, normalizeRoadmap, validateIdeaInput, IdeaEngineError } = await import("../lib/ideaEngine.ts");

async function createMemoryDb() {
  const db = await open({ filename: ":memory:", driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      color TEXT NOT NULL,
      goal TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'Planning',
      due_date TEXT,
      owner_id TEXT
    );

    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'not_started',
      priority TEXT NOT NULL DEFAULT 'medium',
      assignee_id TEXT,
      due_date TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
  `);
  return db;
}

test("validates idea input with helpful errors", () => {
  assert.throws(() => validateIdeaInput({ idea: "" }), IdeaEngineError);
  assert.throws(() => validateIdeaInput({ idea: "tiny" }), /more detail/);
  assert.equal(validateIdeaInput({ idea: "Build a client portal" }).idea, "Build a client portal");
});

test("normalizes roadmaps into PAL task statuses", () => {
  const roadmap = normalizeRoadmap({
    title: "Portal",
    description: "Client portal",
    goal: "Ship portal",
    priority: "urgent",
    due_date: "bad-date",
    tasks: [
      { title: "Start", status: "todo", priority: "high" },
      { title: "Waiting", status: "blocked", priority: "low" },
      { title: "Complete", status: "done", priority: "medium" }
    ]
  }, "Build a client portal", "Technology");

  assert.equal(roadmap.priority, "High");
  assert.equal(roadmap.tasks[0].status, "next_action");
  assert.equal(roadmap.tasks[1].status, "blocked");
  assert.equal(roadmap.tasks[2].status, "done");
  assert.match(roadmap.due_date, /^\d{4}-\d{2}-\d{2}$/);
});

test("creates a project and persisted tasks from an idea", async () => {
  const db = await createMemoryDb();
  const roadmap = normalizeRoadmap(buildFallbackRoadmap("Build a WhatsApp sales tracker", "Retail"), "Build a WhatsApp sales tracker", "Retail");

  const result = await createProjectFromIdea(db, roadmap);
  assert.equal(result.project.type, "Idea Project");
  assert.equal(result.project.status, "Next Action");
  assert.ok(result.tasks.length >= 3);
  assert.equal(result.tasks[0].status, "next_action");
  assert.ok(result.tasks.some((task) => task.status === "blocked"));

  const count = await db.get("SELECT COUNT(*) as count FROM tasks WHERE project_id = ?", [result.project.id]);
  assert.equal(count.count, result.tasks.length);
  await db.close();
});
