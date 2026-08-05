/**
 * Pilot Customer Deployment Console (PAL-TDD-010, Sprint 23 Milestone 1)
 *
 * Manages pilot customer organization creation, multi-tenant workspace isolation,
 * 5-phase deployment lifecycle tracking, health scoring (0-100%), and success timeline reporting.
 *
 * Architecture: PAL-ARCH-DOC-058
 */

export type PilotPhase = "invited" | "connected" | "data_syncing" | "intelligence_active" | "autonomous_operations_enabled";
export type PilotIndustry = "saas" | "e_commerce" | "healthcare" | "agency";

export interface PilotOrganization {
    pilotId: string;
    workspaceId: string;
    companyName: string;
    industry: PilotIndustry;
    currentPhase: PilotPhase;
    healthScorePct: number; // 0 - 100
    activeUsersCount: number;
    connectedSourcesCount: number;
    startedAt: number;
    targetGoLiveDate: string;
}

export interface DeploymentTimelineEvent {
    eventId: string;
    pilotId: string;
    title: string;
    phase: PilotPhase;
    timestamp: number;
}

export class PilotDeploymentConsole {
    private static instance: PilotDeploymentConsole;
    private pilots: Map<string, PilotOrganization> = new Map(); // pilotId -> organization
    private timelines: Map<string, DeploymentTimelineEvent[]> = new Map(); // pilotId -> events

    constructor() {
        this.seedDefaultPilot("pilot_acme_saas");
    }

    public static getInstance(): PilotDeploymentConsole {
        if (!PilotDeploymentConsole.instance) {
            PilotDeploymentConsole.instance = new PilotDeploymentConsole();
        }
        return PilotDeploymentConsole.instance;
    }

    private seedDefaultPilot(pilotId: string): void {
        const timestamp = Date.now() - 14 * 86400 * 1000;
        const org: PilotOrganization = {
            pilotId,
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS",
            industry: "saas",
            currentPhase: "intelligence_active",
            healthScorePct: 92,
            activeUsersCount: 8,
            connectedSourcesCount: 4,
            startedAt: timestamp,
            targetGoLiveDate: new Date(timestamp + 30 * 86400 * 1000).toISOString().split("T")[0]
        };

        this.pilots.set(pilotId, org);
        this.addTimelineEvent(pilotId, "Pilot Initialized & Invited", "invited");
        this.addTimelineEvent(pilotId, "Stripe & HubSpot Connected", "connected");
        this.addTimelineEvent(pilotId, "Initial Data Sync Complete", "data_syncing");
        this.addTimelineEvent(pilotId, "Day Zero Intelligence Active", "intelligence_active");
    }

    public createPilotOrganization(params: {
        workspaceId: string;
        companyName: string;
        industry: PilotIndustry;
    }): PilotOrganization {
        const timestamp = Date.now();
        const pilotId = `pilot_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

        const org: PilotOrganization = {
            pilotId,
            workspaceId: params.workspaceId,
            companyName: params.companyName,
            industry: params.industry,
            currentPhase: "invited",
            healthScorePct: 60, // base baseline score
            activeUsersCount: 1,
            connectedSourcesCount: 0,
            startedAt: timestamp,
            targetGoLiveDate: new Date(timestamp + 30 * 86400 * 1000).toISOString().split("T")[0]
        };

        this.pilots.set(pilotId, org);
        this.addTimelineEvent(pilotId, `Pilot Created for ${params.companyName}`, "invited");

        return org;
    }

    public advancePilotPhase(pilotId: string, nextPhase: PilotPhase): PilotOrganization {
        const org = this.pilots.get(pilotId);
        if (!org) throw new Error(`Pilot organization '${pilotId}' not found.`);

        org.currentPhase = nextPhase;

        // Dynamic health score calculation per phase progression
        const phaseScores: Record<PilotPhase, number> = {
            invited: 60,
            connected: 75,
            data_syncing: 85,
            intelligence_active: 92,
            autonomous_operations_enabled: 98
        };

        org.healthScorePct = phaseScores[nextPhase];
        this.pilots.set(pilotId, org);

        this.addTimelineEvent(pilotId, `Advanced to phase: ${nextPhase}`, nextPhase);
        return org;
    }

    private addTimelineEvent(pilotId: string, title: string, phase: PilotPhase): DeploymentTimelineEvent {
        const timestamp = Date.now();
        const event: DeploymentTimelineEvent = {
            eventId: `evt_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
            pilotId,
            title,
            phase,
            timestamp
        };

        const events = this.timelines.get(pilotId) || [];
        events.push(event);
        this.timelines.set(pilotId, events);
        return event;
    }

    public getPilotOrganization(pilotId: string): PilotOrganization | undefined {
        return this.pilots.get(pilotId);
    }

    public getPilotTimeline(pilotId: string): DeploymentTimelineEvent[] {
        return this.timelines.get(pilotId) || [];
    }
}
