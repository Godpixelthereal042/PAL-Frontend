import { getPeople, findPersonByNameOrEmail, getPersonById } from "./peopleRegistry.ts";
import { getOrganizations, findOrganizationByName, getOrganizationById } from "./organizationRegistry.ts";
import { getRelationshipTimeline } from "./relationshipTimeline.ts";
import { getRelationshipInsights } from "./relationshipInsights.ts";
import type { Person, Organization, RelationshipFilter } from "./types.ts";

export async function findPerson(userId: string, term: string): Promise<Person | null> {
    return findPersonByNameOrEmail(userId, term);
}

export async function findOrganization(userId: string, name: string): Promise<Organization | null> {
    return findOrganizationByName(userId, name);
}

export async function searchRelationships(
    userId: string,
    filter: RelationshipFilter
): Promise<{ people: Person[]; organizations: Organization[] }> {
    const people = await getPeople(userId, filter);
    let organizations = await getOrganizations(userId);

    if (filter.query) {
        const q = filter.query.toLowerCase();
        organizations = organizations.filter(
            (o) =>
                o.name.toLowerCase().includes(q) ||
                (o.industry && o.industry.toLowerCase().includes(q)) ||
                (o.description && o.description.toLowerCase().includes(q)) ||
                (o.notes && o.notes.toLowerCase().includes(q))
        );
    }

    if (filter.name) {
        const n = filter.name.toLowerCase();
        organizations = organizations.filter((o) => o.name.toLowerCase().includes(n));
    }

    return {
        people,
        organizations,
    };
}

export { getRelationshipTimeline, getRelationshipInsights, getPersonById, getOrganizationById };
