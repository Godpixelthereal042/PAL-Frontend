import type { WorkerRoleType } from "../runtime/types.ts";
import type { IWorkerAgent, WorkerExecutionRequest, WorkerExecutionResponse } from "./types.ts";

export class DocumentWorker implements IWorkerAgent {
    getWorkerRole(): WorkerRoleType {
        return "document";
    }

    getCapabilities(): string[] {
        return ["google_docs.create", "pdf.generate_report", "markdown.compile"];
    }

    async executeTask(request: WorkerExecutionRequest): Promise<WorkerExecutionResponse> {
        const startTime = Date.now();

        return {
            taskId: request.taskId,
            workerRole: this.getWorkerRole(),
            status: "success",
            outputs: {
                docId: `doc_${Date.now()}`,
                title: request.inputParameters.title || "Executive Briefing Document",
                pageCount: 3,
            },
            artifacts: [
                {
                    artifactId: `art_doc_${Date.now()}`,
                    name: "Executive Briefing Document PDF",
                    type: "document",
                    content: "Compiled markdown PDF report...",
                },
            ],
            metrics: {
                latencyMs: Date.now() - startTime,
                inputTokens: 1600,
                outputTokens: 500,
                estimatedCostUSD: 0.0031,
            },
            invokedTools: ["pdf.generate_report"],
            retryable: true,
            humanApprovalRequired: false,
            warnings: [],
        };
    }
}
