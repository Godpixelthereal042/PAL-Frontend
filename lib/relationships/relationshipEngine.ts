import {
    createPerson,
    getPersonById,
    getPeople,
    updatePerson,
    deletePerson,
    findPersonByNameOrEmail,
} from "./peopleRegistry.ts";
import {
    createOrganization,
    getOrganizationById,
    getOrganizations,
    updateOrganization,
    deleteOrganization,
    findOrganizationByName,
} from "./organizationRegistry.ts";
import { logInteraction, getInteractionsForPerson, getRecentInteractions } from "./interactionHistory.ts";
import { calculateRelationshipScore, computeAndSaveRelationshipScore } from "./relationshipScoring.ts";
import { analyzeRelationships } from "./relationshipAnalyzer.ts";
import { getRelationshipTimeline } from "./relationshipTimeline.ts";
import { searchRelationships } from "./relationshipSearch.ts";
import type {
    Person,
    Organization,
    Interaction,
    RelationshipInsight,
    RelationshipContext,
    RelationshipFilter,
} from "./types.ts";

export class RelationshipEngine {
    // 1. People Operations
    async createPerson(data: Omit<Person, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Person> {
        return createPerson(data);
    }

    async getPerson(id: string): Promise<Person | null> {
        return getPersonById(id);
    }

    async getPeople(userId: string, filter?: RelationshipFilter): Promise<Person[]> {
        return getPeople(userId, filter);
    }

    async updatePerson(id: string, updates: Partial<Person>): Promise<Person | null> {
        return updatePerson(id, updates);
    }

    async deletePerson(id: string): Promise<boolean> {
        return deletePerson(id);
    }

    async findPerson(userId: string, term: string): Promise<Person | null> {
        return findPersonByNameOrEmail(userId, term);
    }

    // 2. Organization Operations
    async createOrganization(
        data: Omit<Organization, "id" | "createdAt" | "updatedAt"> & { id?: string }
    ): Promise<Organization> {
        return createOrganization(data);
    }

    async getOrganization(id: string): Promise<Organization | null> {
        return getOrganizationById(id);
    }

    async getOrganizations(userId: string): Promise<Organization[]> {
        return getOrganizations(userId);
    }

    async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
        return updateOrganization(id, updates);
    }

    async deleteOrganization(id: string): Promise<boolean> {
        return deleteOrganization(id);
    }

    async findOrganization(userId: string, name: string): Promise<Organization | null> {
        return findOrganizationByName(userId, name);
    }

    // 3. Interaction Operations
    async logInteraction(data: Omit<Interaction, "id"> & { id?: string }): Promise<Interaction> {
        const interaction = await logInteraction(data);
        const person = await getPersonById(data.personId);
        if (person) {
            const interactions = await getInteractionsForPerson(person.id, 50);
            await computeAndSaveRelationshipScore(person, interactions);
        }
        return interaction;
    }

    async getInteractions(personId: string, limit: number = 50): Promise<Interaction[]> {
        return getInteractionsForPerson(personId, limit);
    }

    // 4. Intelligence & Insights
    async getInsights(userId: string): Promise<RelationshipInsight[]> {
        return analyzeRelationships(userId);
    }

    async getTimeline(personId: string, limit: number = 100) {
        return getRelationshipTimeline(personId, limit);
    }

    async search(userId: string, filter: RelationshipFilter) {
        return searchRelationships(userId, filter);
    }

    // 5. Context Engine Integration Builder
    async getRelationshipContext(userId: string): Promise<RelationshipContext> {
        const people = await getPeople(userId);
        const orgs = await getOrganizations(userId);
        const orgMap = new Map(orgs.map((o) => [o.id, o.name]));
        const insights = await analyzeRelationships(userId);
        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;

        const peopleContext = [];
        let atRiskCount = 0;
        let overdueFollowUpCount = 0;

        for (const p of people) {
            const interactions = await getInteractionsForPerson(p.id, 20);
            const scoreObj = calculateRelationshipScore(p, interactions);
            const daysAgo = p.lastInteraction ? Math.floor((now - p.lastInteraction) / DAY_MS) : undefined;
            const pendingFollowUp = interactions.find((i) => i.followUpDate && new Date(i.followUpDate).getTime() < now);

            if (scoreObj.status === "at_risk" || scoreObj.status === "inactive") atRiskCount++;
            if (pendingFollowUp) overdueFollowUpCount++;

            peopleContext.push({
                id: p.id,
                name: p.name,
                role: p.role,
                organizationName: p.organizationId ? orgMap.get(p.organizationId) : undefined,
                relationshipType: p.relationshipType,
                lastInteractionDaysAgo: daysAgo,
                score: scoreObj.score,
                status: scoreObj.status,
                pendingFollowUp: pendingFollowUp ? pendingFollowUp.followUpDate : undefined,
            });
        }

        return {
            people: peopleContext,
            insights,
            totalPeople: people.length,
            atRiskCount,
            overdueFollowUpCount,
        };
    }
}

export const relationshipEngine = new RelationshipEngine();
