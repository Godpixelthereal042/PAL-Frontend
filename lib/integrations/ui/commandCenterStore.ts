/**
 * Executive Command Center Store & State Manager (PAL-TDD-004, PAL-ARCH-DOC-030)
 */

import { EventStreamEngine } from "../events/eventStreamEngine.ts";
import type { PalEvent } from "../events/universalEventTypes.ts";
import type { BusinessHealthKPIs, CommandCenterState, DecisionExplainability, ExecutionTaskStatus, ExecutiveMemoryInsight } from "./commandCenterTypes.ts";

export class CommandCenterStore {
    private state: CommandCenterState;
    private eventEngine: EventStreamEngine;
    private listeners: ((state: CommandCenterState) => void)[] = [];

    constructor(eventEngine?: EventStreamEngine) {
        this.eventEngine = eventEngine || new EventStreamEngine();
        this.state = {
            activityFeed: [],
            businessKPIs: {
                revenueUSD: 142500,
                cashFlowUSD: 38200,
                mrrUSD: 24500,
                burnRateUSD: 8200,
                activeTasks: 4,
                approvalsWaiting: 2,
                connectedCount: 5,
                healthyCount: 5,
                totalWorkersActive: 9
            },
            memoryInsights: [
                {
                    id: "mem_1",
                    category: "supplier_habit",
                    summary: "Supplier Acme Corp offers 5% early payment discount if settled within 10 days",
                    confidence: 0.96,
                    updatedAt: Date.now() - 3600000
                },
                {
                    id: "mem_2",
                    category: "customer_profile",
                    summary: "Enterprise clients in US-East region prefer weekly progress summaries on Mondays",
                    confidence: 0.92,
                    updatedAt: Date.now() - 7200000
                }
            ],
            activeExecutions: [
                {
                    taskId: "task_101",
                    taskName: "Execute Q3 Finance Audit & Refund Processing",
                    workerRole: "finance",
                    status: "executing",
                    progressPct: 65,
                    updatedAt: Date.now()
                },
                {
                    taskId: "task_102",
                    taskName: "Deploy GitHub CI Security Hotfix",
                    workerRole: "engineering",
                    status: "waiting_approval",
                    progressPct: 80,
                    updatedAt: Date.now()
                }
            ],
            connectorStatuses: [],
            decisionFeed: [
                {
                    decisionId: "dec_501",
                    title: "Automate Early Settlement for Invoice #INV-8821",
                    reasoning: "Payment volume increased by 23%. Early payment discount yields $450 net savings.",
                    evidence: ["Stripe webhook balance confirm", "Acme Corp contract terms in Memory"],
                    confidence: 0.94,
                    memoryUsed: ["mem_1"],
                    toolsUsed: ["stripe.create_invoice", "google_workspace.send_email"],
                    workersInvolved: ["FinanceWorker", "EmailWorker"],
                    estimatedCostUSD: 0.006,
                    timeSavedHours: 3.5,
                    actionType: "approve_reject",
                    timestamp: Date.now()
                }
            ]
        };

        // Subscribe to all incoming events from EventStreamEngine
        this.eventEngine.subscribe("*", (evt) => {
            this.handleIncomingEvent(evt);
        });
    }

    private handleIncomingEvent(event: PalEvent): void {
        this.state.activityFeed.unshift(event);

        // Limit feed history to 50 items
        if (this.state.activityFeed.length > 50) {
            this.state.activityFeed.pop();
        }

        // Dynamically update KPIs on Financial Events
        if (event.classification === "FinancialEvent" && event.payload?.amountUSD) {
            this.state.businessKPIs.revenueUSD += event.payload.amountUSD;
            this.state.businessKPIs.cashFlowUSD += event.payload.amountUSD * 0.8;
        }

        this.notifyListeners();
    }

    addDecision(decision: DecisionExplainability): void {
        this.state.decisionFeed.unshift(decision);
        this.notifyListeners();
    }

    updateTaskStatus(taskId: string, status: ExecutionTaskStatus["status"], progressPct: number): void {
        const task = this.state.activeExecutions.find((t) => t.taskId === taskId);
        if (task) {
            task.status = status;
            task.progressPct = progressPct;
            task.updatedAt = Date.now();
        } else {
            this.state.activeExecutions.push({
                taskId,
                taskName: `Task ${taskId}`,
                workerRole: "general",
                status,
                progressPct,
                updatedAt: Date.now()
            });
        }
        this.notifyListeners();
    }

    getState(): CommandCenterState {
        return JSON.parse(JSON.stringify(this.state));
    }

    subscribe(listener: (state: CommandCenterState) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notifyListeners(): void {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }
}
