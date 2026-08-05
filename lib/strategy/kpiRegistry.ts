/**
 * Executive KPI Registry (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-033, PAL-ARCH-DOC-039)
 */

import type { KPIMetric } from "./strategyTypes.ts";
import { KPIRegistryRepository } from "../db/repositories/governanceRepositories.ts";

export class KPIRegistry {
    private metrics: Map<string, KPIMetric> = new Map();
    private repo?: KPIRegistryRepository;

    constructor(repo?: KPIRegistryRepository) {
        this.repo = repo !== undefined ? repo : new KPIRegistryRepository();

        const defaults: KPIMetric[] = [
            { key: "mrr_usd", name: "Monthly Recurring Revenue", value: 24500, unit: "USD", targetValue: 30000, updatedAt: Date.now() },
            { key: "arr_usd", name: "Annual Recurring Revenue", value: 294000, unit: "USD", targetValue: 360000, updatedAt: Date.now() },
            { key: "cash_runway_months", name: "Cash Runway", value: 18.5, unit: "months", targetValue: 24, updatedAt: Date.now() },
            { key: "gross_margin_pct", name: "Gross Margin Percentage", value: 82.5, unit: "%", targetValue: 85, updatedAt: Date.now() },
            { key: "cac_usd", name: "Customer Acquisition Cost", value: 450, unit: "USD", targetValue: 350, updatedAt: Date.now() },
            { key: "ltv_usd", name: "Lifetime Value", value: 4800, unit: "USD", targetValue: 6000, updatedAt: Date.now() },
            { key: "nps_score", name: "Net Promoter Score", value: 68, unit: "score", targetValue: 75, updatedAt: Date.now() }
        ];

        defaults.forEach((m) => this.setMetric(m.key, m.name, m.value, m.unit, m.targetValue));
    }

    setMetric(key: string, name: string, value: number, unit: string, targetValue?: number): KPIMetric {
        const metric: KPIMetric = {
            key,
            name,
            value,
            unit,
            targetValue,
            updatedAt: Date.now()
        };
        this.metrics.set(key, metric);

        if (this.repo) {
            this.repo.upsertEntity({
                id: `kpi_${key}`,
                workspace_id: "default_workspace",
                metric_key: key,
                metric_name: name,
                value,
                unit,
                target_value: targetValue,
                updated_at: metric.updatedAt
            }).catch(err => console.error("Failed to persist KPI metric", err));
        }

        return metric;
    }

    getMetric(key: string): KPIMetric | undefined {
        return this.metrics.get(key);
    }

    getAllMetrics(): KPIMetric[] {
        return Array.from(this.metrics.values());
    }
}
