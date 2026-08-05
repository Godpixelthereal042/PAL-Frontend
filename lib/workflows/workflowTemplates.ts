/**
 * Starter Workflow Templates Library
 *
 * PAL Milestone 5C — Workflow Automation Engine
 */

import type { WorkflowTemplate } from "./types.ts";

export const STARTER_TEMPLATES: WorkflowTemplate[] = [
    {
        id: "tpl_meeting_followup",
        name: "Follow-up Meeting Task",
        description: "When a meeting ends, create a follow-up task for tomorrow.",
        category: "Calendar & Meetings",
        template: {
            name: "Follow-up Meeting Task",
            description: "Automatically create follow-up task when meeting ends.",
            enabled: true,
            trigger: { type: "meeting_ended" },
            actions: [
                {
                    action: "CREATE_TASK",
                    payload: {
                        title: "Follow up on {{trigger.title}}",
                        priority: "high",
                        description: "Automated follow-up task generated from meeting completion.",
                    },
                },
            ],
        },
    },
    {
        id: "tpl_weekly_review",
        name: "Weekly Executive Review",
        description: "Every Friday at 5 PM, generate a Weekly Executive Brief and notify founder.",
        category: "Executive Intelligence",
        template: {
            name: "Weekly Executive Review",
            description: "Generate executive briefing every week.",
            enabled: true,
            trigger: { type: "schedule_weekly" },
            schedule: { mode: "cron", cronExpression: "0 17 * * 5" },
            actions: [
                {
                    action: "GENERATE_DAILY_BRIEFING",
                    payload: {},
                },
                {
                    action: "SEND_NOTIFICATION",
                    payload: {
                        category: "executive",
                        title: "Weekly Executive Brief Ready",
                        message: "Your weekly performance and strategic briefing has been generated.",
                        priority: "high",
                    },
                },
            ],
        },
    },
    {
        id: "tpl_invoice_reminder",
        name: "Invoice Overdue Reminder",
        description: "When an invoice becomes overdue, notify the founder immediately.",
        category: "Financial",
        template: {
            name: "Invoice Overdue Reminder",
            description: "Notify founder when invoice is overdue.",
            enabled: true,
            trigger: { type: "invoice_overdue" },
            conditions: {
                logic: "AND",
                conditions: [
                    { type: "outstanding_invoice", operator: "equals", value: true },
                ],
            },
            actions: [
                {
                    action: "SEND_NOTIFICATION",
                    payload: {
                        category: "financial",
                        title: "Overdue Invoice Alert",
                        message: "Invoice for {{trigger.client}} is overdue. Review receivables.",
                        priority: "urgent",
                    },
                },
            ],
        },
    },
    {
        id: "tpl_investor_followup",
        name: "Investor Meeting Follow-up",
        description: "After an investor meeting, create a reminder task to send materials.",
        category: "Investor Relations",
        template: {
            name: "Investor Meeting Follow-up",
            description: "Automatically set reminder for investor follow-ups.",
            enabled: true,
            trigger: { type: "meeting_ended", config: { type: "investor" } },
            actions: [
                {
                    action: "CREATE_TASK",
                    payload: {
                        title: "Send investor update & materials to {{trigger.client}}",
                        priority: "high",
                        description: "Follow up with investor deck and financial updates.",
                    },
                },
            ],
        },
    },
    {
        id: "tpl_decision_implementation",
        name: "Decision Implementation Tasks",
        description: "When a strategic decision is confirmed, generate execution tasks automatically.",
        category: "Strategy",
        template: {
            name: "Decision Implementation Tasks",
            description: "Create implementation tasks upon decision confirmation.",
            enabled: true,
            trigger: { type: "decision_confirmed" },
            actions: [
                {
                    action: "CREATE_TASK",
                    payload: {
                        title: "Implement Decision: {{trigger.title}}",
                        priority: "high",
                        description: "Execution task for confirmed strategic decision.",
                    },
                },
            ],
        },
    },
];
