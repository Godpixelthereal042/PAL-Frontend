import type { WorkerRoleType } from "../runtime/types.ts";
import { ResearchWorker } from "./researchWorker.ts";
import { EmailWorker } from "./emailWorker.ts";
import { CalendarWorker } from "./calendarWorker.ts";
import { CRMWorker } from "./crmWorker.ts";
import { FinanceWorker } from "./financeWorker.ts";
import { EngineeringWorker } from "./engineeringWorker.ts";
import { SocialWorker } from "./socialWorker.ts";
import { DocumentWorker } from "./documentWorker.ts";
import { AutomationWorker } from "./automationWorker.ts";
import type { IWorkerAgent } from "./types.ts";

export class WorkerFactory {
    private workers: Map<WorkerRoleType, IWorkerAgent> = new Map();

    constructor() {
        this.registerWorker(new ResearchWorker());
        this.registerWorker(new EmailWorker());
        this.registerWorker(new CalendarWorker());
        this.registerWorker(new CRMWorker());
        this.registerWorker(new FinanceWorker());
        this.registerWorker(new EngineeringWorker());
        this.registerWorker(new SocialWorker());
        this.registerWorker(new DocumentWorker());
        this.registerWorker(new AutomationWorker());
    }

    registerWorker(worker: IWorkerAgent): void {
        this.workers.set(worker.getWorkerRole(), worker);
    }

    getWorker(role: WorkerRoleType): IWorkerAgent | undefined {
        return this.workers.get(role);
    }

    getAllWorkers(): IWorkerAgent[] {
        return Array.from(this.workers.values());
    }
}
