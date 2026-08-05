/**
 * Strategic Reasoning Engine
 *
 * PAL Milestone 2B — Reasoning Engine
 *
 * This module provides the decision-making layer that transforms a structured
 * BusinessContext (from Milestone 2A) into actionable strategic reasoning
 * (priorities, risks, opportunities, ranked recommendations with rationales,
 * missing information alerts, and a context confidence score) BEFORE any LLM call.
 *
 * NOTE: This module MUST NOT call Gemini or generate natural language prose/paragraphs.
 * It produces pure structured intelligence data.
 *
 * Reference: PAL-DOC-003 (AI Architecture) §03, PAL-DOC-002 (MVP) §04
 */

import type {
    BusinessContext,
    ProjectContext,
    TaskContext,
    InvoiceContext,
    BusinessBrainDetailsContext,
} from "./contextEngine";

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export type PriorityLevel = "high" | "medium" | "low";
export type ImpactLevel = "high" | "medium" | "low";
export type SeverityLevel = "high" | "medium" | "low";
export type UrgencyLevel = "immediate" | "soon" | "flexible";

export interface PriorityItem {
    title: string;
    description: string;
    priority: PriorityLevel;
    source: string;
}

export interface RiskItem {
    title: string;
    description: string;
    severity: SeverityLevel;
    category: "overdue" | "stalled" | "cashflow" | "conflict" | "operational";
}

export interface OpportunityItem {
    title: string;
    description: string;
    impact: ImpactLevel;
    category: "growth" | "revenue" | "efficiency" | "market" | "product";
}

export interface RecommendedAction {
    title: string;
    description: string;
    impact: ImpactLevel;
    urgency: UrgencyLevel;
    rationale: string;
}

export interface MissingInformationItem {
    field: string;
    message: string;
    impactOnGuidance: string;
}

export interface ReasoningAnalysis {
    priorities: PriorityItem[];
    risks: RiskItem[];
    opportunities: OpportunityItem[];
    recommendedActions: RecommendedAction[];
    missingInformation: MissingInformationItem[];
    confidenceScore: number; // 0 - 100
}

// ---------------------------------------------------------------------------
// Private Evaluators & Analyzers
// ---------------------------------------------------------------------------

/**
 * Identify and rank top priorities from Business Brain, active goals, projects, and tasks.
 */
function analyzePriorities(context: BusinessContext): PriorityItem[] {
    const items: PriorityItem[] = [];
    const { business, projects, tasks } = context;

    // 1. Explicit priorities from Business Brain
    if (business && business.priorities && business.priorities.trim()) {
        items.push({
            title: "Founder Focus Area",
            description: business.priorities.trim(),
            priority: "high",
            source: "Business Brain (Priorities)",
        });
    }

    // 2. Active Goals from Business Brain
    if (business && business.goals) {
        for (const goal of business.goals) {
            if (goal.status.toLowerCase() === "active") {
                items.push({
                    title: `Goal: ${goal.title}`,
                    description: goal.description || goal.timeframe ? `Timeframe: ${goal.timeframe || "Ongoing"}` : "Active business target",
                    priority: "high",
                    source: "Business Brain (Goals)",
                });
            }
        }
    }

    // 3. High priority active projects
    for (const proj of projects) {
        if (proj.priority.toLowerCase() === "high" && proj.status.toLowerCase() !== "completed") {
            items.push({
                title: `Project: ${proj.title}`,
                description: proj.description || proj.goal || "High priority project in progress",
                priority: "high",
                source: "Projects",
            });
        }
    }

    // 4. High priority tasks
    for (const task of tasks) {
        if (task.priority.toLowerCase() === "high" && task.status.toLowerCase() !== "done") {
            items.push({
                title: `Task: ${task.title}`,
                description: task.description || "High priority task pending completion",
                priority: "high",
                source: "Tasks",
            });
        }
    }

    // 5. Active Strategic Decisions
    if (context.decisions) {
        for (const dec of context.decisions) {
            if (dec.status.toLowerCase() === "active") {
                items.push({
                    title: `Decision: ${dec.title}`,
                    description: dec.description || dec.rationale || "Active confirmed strategic decision",
                    priority: "high",
                    source: "Decision Memory",
                });
            }
        }
    }

    return items;
}

/**
 * Detect risks (overdue work, stalled projects, cashflow bottlenecks, priority conflicts).
 */
function detectRisks(context: BusinessContext): RiskItem[] {
    const risks: RiskItem[] = [];
    const { projects, tasks, invoices, business } = context;
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Overdue Projects
    for (const p of projects) {
        if (p.dueDate && p.dueDate < todayStr && p.status.toLowerCase() !== "completed") {
            risks.push({
                title: `Overdue Project: ${p.title}`,
                description: `Project was due on ${p.dueDate} but remains in status '${p.status}'.`,
                severity: "high",
                category: "overdue",
            });
        }
    }

    // 2. Overdue Tasks
    for (const t of tasks) {
        if (t.dueDate && t.dueDate < todayStr && t.status.toLowerCase() !== "done") {
            risks.push({
                title: `Overdue Task: ${t.title}`,
                description: `Task deadline (${t.dueDate}) has passed.`,
                severity: t.priority.toLowerCase() === "high" ? "high" : "medium",
                category: "overdue",
            });
        }
    }

    // 3. Stalled Projects (0 milestones or 0 completed milestones on active projects)
    for (const p of projects) {
        if (p.status.toLowerCase() !== "completed") {
            if (p.milestones.length === 0) {
                risks.push({
                    title: `Unstructured Project: ${p.title}`,
                    description: "Project has no milestones defined to track progress.",
                    severity: "medium",
                    category: "stalled",
                });
            } else {
                const completedCount = p.milestones.filter((m) => m.completed).length;
                if (completedCount === 0 && p.milestones.length >= 3) {
                    risks.push({
                        title: `Stalled Project: ${p.title}`,
                        description: `None of the ${p.milestones.length} milestones have been completed yet.`,
                        severity: "high",
                        category: "stalled",
                    });
                }
            }
        }
    }

    // 4. Overdue Invoices / Cashflow Bottlenecks
    const overdueInvoices = invoices.filter((i) => i.status.toLowerCase() === "overdue");
    if (overdueInvoices.length > 0) {
        const totalOverdue = overdueInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        risks.push({
            title: `Uncollected Revenue (${overdueInvoices.length} Overdue Invoices)`,
            description: `$${totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })} in overdue invoices requires collection.`,
            severity: "high",
            category: "cashflow",
        });
    }

    // 5. Conflicting / Overloaded Priorities
    const highPriorityProjects = projects.filter((p) => p.priority.toLowerCase() === "high" && p.status.toLowerCase() !== "completed");
    if (highPriorityProjects.length >= 3) {
        risks.push({
            title: "Priority Overload",
            description: `${highPriorityProjects.length} projects are simultaneously marked High Priority, risking execution bandwidth.`,
            severity: "medium",
            category: "conflict",
        });
    }

    // 6. High Severity Business Challenges
    if (business && business.challenges) {
        for (const c of business.challenges) {
            if (c.severity.toLowerCase() === "high" && c.status.toLowerCase() === "active") {
                risks.push({
                    title: `Business Challenge: ${c.title}`,
                    description: c.description || "High severity active challenge recorded in Business Brain.",
                    severity: "high",
                    category: "operational",
                });
            }
        }
    }

    return risks;
}

/**
 * Identify growth, revenue, and efficiency opportunities.
 */
function identifyOpportunities(context: BusinessContext): OpportunityItem[] {
    const opportunities: OpportunityItem[] = [];
    const { business, invoices, notifications } = context;

    // 1. Pending Invoices (Cashflow Inflow Opportunity)
    const pendingInvoices = invoices.filter((i) => i.status.toLowerCase() === "pending");
    if (pendingInvoices.length > 0) {
        const totalPending = pendingInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        opportunities.push({
            title: "Pending Invoices Follow-up",
            description: `$${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })} across ${pendingInvoices.length} pending invoice(s) ready for collection.`,
            impact: "high",
            category: "revenue",
        });
    }

    // 2. Stage-based Growth Opportunities
    if (business) {
        const stage = (business.stage || "").toLowerCase();
        if (stage === "launched" || stage === "scaling") {
            opportunities.push({
                title: "Scale Customer Acquisition",
                description: `Business is in '${business.stage}' stage. Ideal timing to expand marketing loops and offer retainers.`,
                impact: "high",
                category: "growth",
            });
        } else if (stage === "idea" || stage === "pre-launch") {
            opportunities.push({
                title: "MVP Launch & Validation",
                description: `Business is in '${business.stage}' stage. Focus on securing early beta users to validate core proposition.`,
                impact: "high",
                category: "product",
            });
        }

        // 3. Customer Segments Expansion
        if (business.customerSegments && business.customerSegments.length > 0) {
            opportunities.push({
                title: "Targeted Outreach Strategy",
                description: `${business.customerSegments.length} customer segment(s) defined (${business.customerSegments.map((s) => s.name).join(", ")}). Leverage for tailored positioning.`,
                impact: "medium",
                category: "market",
            });
        }
    }

    // 4. Competitor Alerts / Market Shift Signals
    const competitorAlerts = notifications.filter(
        (n) => n.title.toLowerCase().includes("competitor") || n.text.toLowerCase().includes("competitor")
    );
    if (competitorAlerts.length > 0) {
        opportunities.push({
            title: "Market Counter-Move Opportunity",
            description: `${competitorAlerts.length} competitor update(s) detected. Opportunity to differentiate feature offering.`,
            impact: "medium",
            category: "market",
        });
    }

    return opportunities;
}

/**
 * Detect missing business information needed to personalize guidance.
 */
function detectMissingInformation(context: BusinessContext): MissingInformationItem[] {
    const missing: MissingInformationItem[] = [];
    const { business } = context;

    if (!business) {
        missing.push({
            field: "businessBrain",
            message: "Business Brain has not been set up yet.",
            impactOnGuidance: "PAL cannot personalize strategic recommendations to your specific business model or industry.",
        });
        return missing;
    }

    if (!business.name || !business.name.trim()) {
        missing.push({
            field: "business_name",
            message: "Business name is missing.",
            impactOnGuidance: "AI assistance will use generic placeholders instead of your actual business name.",
        });
    }

    if (!business.description || !business.description.trim()) {
        missing.push({
            field: "business_description",
            message: "What your business does is not described.",
            impactOnGuidance: "Strategic advice may lack industry-specific nuance.",
        });
    }

    if (!business.targetMarket || !business.targetMarket.trim()) {
        missing.push({
            field: "target_market",
            message: "Target market/customers are not specified.",
            impactOnGuidance: "Customer acquisition and marketing advice will be generalized.",
        });
    }

    if (!business.priorities || !business.priorities.trim()) {
        missing.push({
            field: "priorities",
            message: "Current business priorities are empty.",
            impactOnGuidance: "PAL cannot align daily sprint recommendations with your top goals.",
        });
    }

    if (!business.offers || business.offers.length === 0) {
        missing.push({
            field: "offers",
            message: "No product or service offers recorded.",
            impactOnGuidance: "Monetization and pricing advice will lack specific product context.",
        });
    }

    if (!business.goals || business.goals.length === 0) {
        missing.push({
            field: "goals",
            message: "No formal business goals defined.",
            impactOnGuidance: "Progress tracking and milestone evaluations cannot be measured against target outcomes.",
        });
    }

    return missing;
}

/**
 * Generate ranked actionable recommendations with clear rationales.
 */
function generateRankedRecommendations(
    priorities: PriorityItem[],
    risks: RiskItem[],
    opportunities: OpportunityItem[],
    missing: MissingInformationItem[]
): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    // 1. High-priority risk resolution recommendations
    for (const r of risks) {
        if (r.category === "cashflow") {
            actions.push({
                title: "Resolve Overdue Invoices",
                description: "Send payment reminder notifications for overdue invoices to secure cashflow.",
                impact: "high",
                urgency: "immediate",
                rationale: `Detected risk: ${r.description} Immediate cash collection takes precedence over new initiatives.`,
            });
        } else if (r.category === "overdue") {
            actions.push({
                title: `Address ${r.title}`,
                description: "Review deadline obstacles, adjust timeline, or complete pending deliverables.",
                impact: r.severity === "high" ? "high" : "medium",
                urgency: "immediate",
                rationale: `Detected risk: ${r.description} Overdue work creates operational drag.`,
            });
        } else if (r.category === "stalled") {
            actions.push({
                title: `Break Down ${r.title}`,
                description: "Add granular milestones or initial tasks to unblock project progress.",
                impact: "medium",
                urgency: "soon",
                rationale: `Detected risk: ${r.description} Unstructured or stalled projects stall founder momentum.`,
            });
        }
    }

    // 2. High-impact opportunity recommendations
    for (const o of opportunities) {
        if (o.category === "revenue") {
            actions.push({
                title: "Collect Pending Invoices",
                description: "Follow up on outstanding invoices awaiting client payment.",
                impact: "high",
                urgency: "soon",
                rationale: `Detected opportunity: ${o.description} Converting pending invoices into cash strengthens working capital.`,
            });
        } else if (o.category === "growth") {
            actions.push({
                title: "Execute Acquisition Campaign",
                description: "Design and run a targeted customer outreach campaign.",
                impact: "high",
                urgency: "soon",
                rationale: `Detected opportunity: ${o.description} Aligning outreach with stage stage accelerates business growth.`,
            });
        }
    }

    // 3. Information gap recommendations
    if (missing.length > 0) {
        const topMissing = missing[0];
        actions.push({
            title: "Complete Business Brain Setup",
            description: `Fill in missing business context (${topMissing.field.replace("_", " ")}).`,
            impact: "medium",
            urgency: "flexible",
            rationale: topMissing.impactOnGuidance,
        });
    }

    // Rank actions: High impact & Immediate urgency first
    const impactWeight: Record<ImpactLevel, number> = { high: 3, medium: 2, low: 1 };
    const urgencyWeight: Record<UrgencyLevel, number> = { immediate: 3, soon: 2, flexible: 1 };

    actions.sort((a, b) => {
        const scoreA = impactWeight[a.impact] * 2 + urgencyWeight[a.urgency];
        const scoreB = impactWeight[b.impact] * 2 + urgencyWeight[b.urgency];
        return scoreB - scoreA;
    });

    return actions;
}

/**
 * Calculate context confidence score (0 to 100) based on completeness.
 */
function calculateConfidenceScore(context: BusinessContext, missing: MissingInformationItem[]): number {
    let score = 100;

    // Deduct points for missing critical context
    if (!context.business) {
        score -= 40;
    } else {
        if (!context.business.name) score -= 10;
        if (!context.business.description) score -= 10;
        if (!context.business.targetMarket) score -= 10;
        if (!context.business.priorities) score -= 10;
        if (context.business.goals.length === 0) score -= 5;
        if (context.business.offers.length === 0) score -= 5;
    }

    if (context.projects.length === 0) {
        score -= 5;
    }

    return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Public API Function
// ---------------------------------------------------------------------------

/**
 * Analyzes a BusinessContext object and generates strategic reasoning intelligence.
 *
 * The Reasoning Engine identifies top priorities, detects operational/financial risks,
 * highlights growth opportunities, identifies missing information, ranks recommendations
 * with clear rationales, and computes a confidence score.
 *
 * @param context - The structured BusinessContext returned by buildBusinessContext(userId)
 * @returns Structured ReasoningAnalysis object containing strategic insights
 */
export function analyzeBusinessContext(context: BusinessContext): ReasoningAnalysis {
    const priorities = analyzePriorities(context);
    const risks = detectRisks(context);
    const opportunities = identifyOpportunities(context);
    const missingInformation = detectMissingInformation(context);
    const recommendedActions = generateRankedRecommendations(priorities, risks, opportunities, missingInformation);
    const confidenceScore = calculateConfidenceScore(context, missingInformation);

    return {
        priorities,
        risks,
        opportunities,
        recommendedActions,
        missingInformation,
        confidenceScore,
    };
}
