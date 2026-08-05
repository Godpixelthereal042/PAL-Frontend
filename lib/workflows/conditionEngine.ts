/**
 * Condition Engine
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Evaluates composable AND / OR conditions against BusinessContext.
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { WorkflowCondition, ConditionGroup } from "./types.ts";
import { calculateBusinessHealth } from "../briefing/businessHealthEngine.ts";

export function evaluateOperator(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
        case "equals":
            return String(actual).toLowerCase() === String(expected).toLowerCase();
        case "not_equals":
            return String(actual).toLowerCase() !== String(expected).toLowerCase();
        case "greater_than":
            return Number(actual) > Number(expected);
        case "less_than":
            return Number(actual) < Number(expected);
        case "contains":
            return String(actual).toLowerCase().includes(String(expected).toLowerCase());
        case "in":
            if (Array.isArray(expected)) {
                return expected.map(String).includes(String(actual));
            }
            return String(expected).includes(String(actual));
        default:
            return Boolean(actual);
    }
}

export function evaluateSingleCondition(cond: WorkflowCondition, context: BusinessContext): boolean {
    switch (cond.type) {
        case "business_health_score": {
            const health = calculateBusinessHealth(context);
            return evaluateOperator(health.score, cond.operator, cond.value);
        }
        case "has_active_project": {
            const activeCount = context.projects.filter((p) => p.status.toLowerCase() !== "completed").length;
            return evaluateOperator(activeCount > 0, cond.operator, cond.value);
        }
        case "calendar_availability": {
            const meetingCount = context.calendar.length;
            return evaluateOperator(meetingCount, cond.operator, cond.value);
        }
        case "outstanding_invoice": {
            const overdueCount = context.invoices.filter((i) => i.status.toLowerCase() === "overdue").length;
            return evaluateOperator(overdueCount > 0, cond.operator, cond.value);
        }
        case "day_of_week": {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const currentDay = days[new Date().getDay()];
            return evaluateOperator(currentDay, cond.operator, cond.value);
        }
        case "decision_exists": {
            const decisionCount = (context.decisions || []).filter((d) => d.status.toLowerCase() === "active").length;
            return evaluateOperator(decisionCount > 0, cond.operator, cond.value);
        }
        default:
            return true;
    }
}

export function evaluateConditions(
    conditions: ConditionGroup | WorkflowCondition[] | null | undefined,
    context: BusinessContext
): boolean {
    if (!conditions) return true;

    if (Array.isArray(conditions)) {
        if (conditions.length === 0) return true;
        return conditions.every((c) => evaluateSingleCondition(c, context));
    }

    const group = conditions as ConditionGroup;
    if (!group.conditions || group.conditions.length === 0) return true;

    if (group.logic === "OR") {
        return group.conditions.some((c) => {
            if ("logic" in c) return evaluateConditions(c as ConditionGroup, context);
            return evaluateSingleCondition(c as WorkflowCondition, context);
        });
    } else {
        // Default logic: AND
        return group.conditions.every((c) => {
            if ("logic" in c) return evaluateConditions(c as ConditionGroup, context);
            return evaluateSingleCondition(c as WorkflowCondition, context);
        });
    }
}
