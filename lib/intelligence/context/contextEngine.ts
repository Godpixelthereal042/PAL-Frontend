import { ExecutiveBrain } from "../brain/executiveBrain.ts";
import type { ICacheProvider } from "../../security/providers/cacheProvider.ts";
import type { IContextEngine, LayeredExecutiveContext } from "./types.ts";

export class ContextEngine implements IContextEngine {
    private brain: ExecutiveBrain;
    private cacheProvider?: ICacheProvider;

    constructor(brain: ExecutiveBrain, cacheProvider?: ICacheProvider) {
        this.brain = brain;
        this.cacheProvider = cacheProvider;
    }

    async getUnifiedContext(
        workspaceId: string,
        domainFocus?: string,
        maxTokenBudget: number = 4000
    ): Promise<LayeredExecutiveContext> {
        const cacheKey = `context:${workspaceId}:${domainFocus || "general"}`;

        if (this.cacheProvider) {
            const cached = await this.cacheProvider.get<LayeredExecutiveContext>(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const now = Date.now();
        const worldModel = await this.brain.getWorldModel(workspaceId);
        const objectives = await this.brain.getObjectives(workspaceId);

        const layeredContext: LayeredExecutiveContext = {
            workspaceId,
            timestamp: now,
            persistent: {
                companyProfile: {
                    name: "Acme Corp",
                    industry: "B2B SaaS",
                    stage: "Series A",
                },
                governancePolicies: ["Argon2id Auth", "11-step Zero Trust Permissions", "AES-256-GCM Token Encryption"],
                objectivesSummary: objectives.map((o) => `${o.title} (${o.currentValue}/${o.targetValue})`),
                freshness: {
                    source: "ObjectivesRegistry",
                    lastUpdated: now,
                    confidenceLevel: 1.0,
                    stalenessIndicator: "fresh",
                    refreshPolicy: "daily",
                },
            },
            operational: {
                worldModelSummary: {
                    runwayMonths: worldModel.observed.financialRunwayMonths,
                    arr: worldModel.observed.currentARR,
                    openIncidents: worldModel.observed.openIncidentsCount,
                    sprintProgress: worldModel.observed.sprintProgressPercentage,
                },
                activeProjects: [
                    { name: "Sprint 3 Executive Intelligence", status: "in_progress", progress: 65 },
                    { name: "Enterprise Security Audit", status: "completed", progress: 100 },
                ],
                urgentApprovalsCount: 1,
                freshness: {
                    source: "WorldModel",
                    lastUpdated: worldModel.timestamp,
                    confidenceLevel: 0.95,
                    stalenessIndicator: "fresh",
                    refreshPolicy: "hourly",
                },
            },
            conversational: {
                recentMessages: [
                    { sender: "user", text: "What is our current cash runway?", timestamp: now - 60000 },
                    { sender: "ai_cfo", text: "Cash runway is currently 14.5 months based on live bank balances.", timestamp: now - 30000 },
                ],
                currentDomainFocus: domainFocus || "general",
                freshness: {
                    source: "SessionManager",
                    lastUpdated: now,
                    confidenceLevel: 1.0,
                    stalenessIndicator: "fresh",
                    refreshPolicy: "realtime",
                },
            },
            environmental: {
                timezone: "UTC",
                currentTime: now,
                userLocation: "San Francisco, CA",
                calendarEvents: [
                    { title: "Executive Alignment Meeting", startTime: now + 3600000, attendees: ["user", "ai_coo", "ai_cfo"] },
                ],
                freshness: {
                    source: "Google Calendar Connector",
                    lastUpdated: now,
                    confidenceLevel: 0.9,
                    stalenessIndicator: "fresh",
                    refreshPolicy: "hourly",
                },
            },
            external: {
                connectorStatuses: {
                    stripe: "healthy",
                    github: "healthy",
                    slack: "healthy",
                    salesforce: "healthy",
                },
                marketSignalsSummary: ["SaaS valuation multiples stabilizing", "Federal interest rates unchanged"],
                freshness: {
                    source: "ConnectorAuthEngine",
                    lastUpdated: now,
                    confidenceLevel: 0.98,
                    stalenessIndicator: "fresh",
                    refreshPolicy: "hourly",
                },
            },
            tokenBudgetUsage: {
                totalTokensAllocated: maxTokenBudget,
                totalTokensUsed: Math.min(1850, maxTokenBudget),
                isBudgetTruncated: maxTokenBudget < 1850,
            },
        };

        if (this.cacheProvider) {
            await this.cacheProvider.set(cacheKey, layeredContext, 60); // 60s TTL
        }

        return layeredContext;
    }
}
