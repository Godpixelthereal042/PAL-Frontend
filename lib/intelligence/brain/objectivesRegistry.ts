import type { ExecutiveObjective, IObjectivesRegistry } from "./types.ts";

export class ObjectivesRegistry implements IObjectivesRegistry {
    private objectivesMap: Map<string, ExecutiveObjective[]> = new Map();

    async getObjectives(workspaceId: string): Promise<ExecutiveObjective[]> {
        if (!this.objectivesMap.has(workspaceId)) {
            const defaults: ExecutiveObjective[] = [
                {
                    id: "obj_north_star",
                    workspaceId,
                    title: "Reach $2M ARR by Q4",
                    type: "north_star",
                    targetMetric: "ARR",
                    currentValue: 1200000,
                    targetValue: 2000000,
                    status: "on_track",
                    ownerId: "user_founder",
                    updatedAt: Date.now(),
                },
                {
                    id: "obj_okr_cash",
                    workspaceId,
                    title: "Maintain > 12 Months Runway",
                    type: "okr",
                    targetMetric: "Runway Months",
                    currentValue: 14.5,
                    targetValue: 12.0,
                    status: "on_track",
                    ownerId: "ai_cfo",
                    updatedAt: Date.now(),
                },
                {
                    id: "obj_kpi_uptime",
                    workspaceId,
                    title: "System Uptime > 99.9%",
                    type: "kpi",
                    targetMetric: "Uptime %",
                    currentValue: 99.95,
                    targetValue: 99.9,
                    status: "on_track",
                    ownerId: "ai_ops",
                    updatedAt: Date.now(),
                },
            ];
            this.objectivesMap.set(workspaceId, defaults);
        }
        return this.objectivesMap.get(workspaceId)!;
    }

    async setObjective(objective: ExecutiveObjective): Promise<void> {
        const list = await this.getObjectives(objective.workspaceId);
        const idx = list.findIndex((o) => o.id === objective.id);
        if (idx >= 0) {
            list[idx] = objective;
        } else {
            list.push(objective);
        }
        this.objectivesMap.set(objective.workspaceId, list);
    }
}
