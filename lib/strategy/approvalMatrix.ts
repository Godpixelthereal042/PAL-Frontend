/**
 * Policy-Driven Human Approval Matrix (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-037, PAL-ARCH-DOC-039)
 */

import type { DepartmentType } from "./schedulerTypes.ts";
import { ApprovalRequestRepository } from "../db/repositories/governanceRepositories.ts";

export type ApproverRole = "CEO" | "CFO" | "HR" | "Engineering Lead" | "Legal Counsel" | "Security Officer";

export interface ApprovalRule {
    id: string;
    name: string;
    department: DepartmentType;
    conditionDescription: string;
    requiredApproverRole: ApproverRole;
    escalationRole?: ApproverRole;
    timeoutMinutes: number;
    fallbackAction: "block" | "auto_approve" | "escalate";
}

export interface ApprovalRequest {
    requestId: string;
    proposalId?: string;
    actionName: string;
    department: DepartmentType;
    requiredRole: ApproverRole;
    escalationRole?: ApproverRole;
    status: "pending" | "approved" | "rejected" | "escalated";
    justification: string;
    requestedAt: number;
    decidedAt?: number;
    decidedBy?: string;
}

export class ApprovalMatrixEngine {
    private rules: ApprovalRule[] = [];
    private requests: Map<string, ApprovalRequest> = new Map();
    private repo?: ApprovalRequestRepository;

    constructor(repo?: ApprovalRequestRepository) {
        this.repo = repo !== undefined ? repo : new ApprovalRequestRepository();
        this.rules = [
            {
                id: "rule_cfo_refund",
                name: "High Value Spend Approval",
                department: "finance",
                conditionDescription: "Action expense > $5,000 USD",
                requiredApproverRole: "CFO",
                escalationRole: "CEO",
                timeoutMinutes: 1440,
                fallbackAction: "block"
            },
            {
                id: "rule_legal_compliance",
                name: "High Compliance Risk Approval",
                department: "general",
                conditionDescription: "Risk score > 70/100",
                requiredApproverRole: "Legal Counsel",
                escalationRole: "CEO",
                timeoutMinutes: 720,
                fallbackAction: "escalate"
            }
        ];
    }

    evaluateApprovalRequired(actionName: string, department: DepartmentType, params: Record<string, any>): ApprovalRequest | undefined {
        let matchingRule: ApprovalRule | undefined;

        if ((params.amountUSD && params.amountUSD > 5000) || actionName.includes("refund")) {
            matchingRule = this.rules.find((r) => r.id === "rule_cfo_refund");
        } else if (params.riskScore && params.riskScore > 70) {
            matchingRule = this.rules.find((r) => r.id === "rule_legal_compliance");
        }

        if (!matchingRule) return undefined;

        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const request: ApprovalRequest = {
            requestId,
            proposalId: params.proposalId,
            actionName,
            department,
            requiredRole: matchingRule.requiredApproverRole,
            escalationRole: matchingRule.escalationRole,
            status: "pending",
            justification: `Action [${actionName}] triggers Policy Rule [${matchingRule.name}]: ${matchingRule.conditionDescription}`,
            requestedAt: Date.now()
        };

        this.requests.set(requestId, request);

        if (this.repo) {
            this.repo.upsertEntity({
                id: requestId,
                workspace_id: "default_workspace",
                proposal_id: request.proposalId,
                action_name: actionName,
                department,
                required_role: request.requiredRole,
                escalation_role: request.escalationRole,
                status: request.status,
                justification: request.justification,
                requested_at: request.requestedAt
            }).catch(err => console.error("Failed to persist approval request", err));
        }

        return request;
    }

    resolveRequest(requestId: string, approved: boolean, decidedByRole: ApproverRole): ApprovalRequest | undefined {
        const req = this.requests.get(requestId);
        if (!req) return undefined;

        req.status = approved ? "approved" : "rejected";
        req.decidedAt = Date.now();
        req.decidedBy = decidedByRole;

        if (this.repo) {
            this.repo.upsertEntity({
                id: requestId,
                workspace_id: "default_workspace",
                proposal_id: req.proposalId,
                action_name: req.actionName,
                department: req.department,
                required_role: req.requiredRole,
                escalation_role: req.escalationRole,
                status: req.status,
                justification: req.justification,
                requested_at: req.requestedAt,
                decided_at: req.decidedAt,
                decided_by: req.decidedBy
            }).catch(err => console.error("Failed to update approval request", err));
        }

        return req;
    }

    getPendingRequests(): ApprovalRequest[] {
        return Array.from(this.requests.values()).filter((r) => r.status === "pending" || r.status === "escalated");
    }
}
