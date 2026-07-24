/**
 * Business Brain Data Access Layer
 *
 * PAL Milestone 1A — Business Brain Database
 *
 * This module provides TypeScript interfaces and CRUD functions for the
 * Business Brain, PAL's structured memory about a founder's business.
 *
 * Reference: PAL-DOC-003 (AI Architecture) §03, PAL-DOC-002 (MVP) §03
 */

import { getDB } from "./db";

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface BusinessBrain {
    id: string;
    user_id: string;
    business_name: string | null;
    business_description: string | null;
    industry: string | null;
    business_stage: string | null;
    target_market: string | null;
    priorities: string | null;
    created_at: number;
    updated_at: number;
}

export interface BusinessGoal {
    id: string;
    brain_id: string;
    title: string;
    description: string | null;
    timeframe: string | null;
    status: string;
    created_at: number;
}

export interface BusinessOffer {
    id: string;
    brain_id: string;
    name: string;
    description: string | null;
    offer_type: string | null;
    price: string | null;
    status: string;
    created_at: number;
}

export interface BusinessCustomerSegment {
    id: string;
    brain_id: string;
    name: string;
    description: string | null;
    created_at: number;
}

export interface BusinessChallenge {
    id: string;
    brain_id: string;
    title: string;
    description: string | null;
    severity: string;
    status: string;
    created_at: number;
}

export interface BusinessNote {
    id: string;
    brain_id: string;
    content: string;
    category: string | null;
    created_at: number;
}

/** Composite snapshot of the entire Business Brain with all child entities */
export interface BusinessBrainSnapshot {
    brain: BusinessBrain;
    goals: BusinessGoal[];
    offers: BusinessOffer[];
    customerSegments: BusinessCustomerSegment[];
    challenges: BusinessChallenge[];
    notes: BusinessNote[];
}

// ---------------------------------------------------------------------------
// Input types for create/update operations
// ---------------------------------------------------------------------------

export interface UpsertBusinessBrainInput {
    business_name?: string | null;
    business_description?: string | null;
    industry?: string | null;
    business_stage?: string | null;
    target_market?: string | null;
    priorities?: string | null;
}

export interface CreateGoalInput {
    title: string;
    description?: string | null;
    timeframe?: string | null;
    status?: string;
}

export interface UpdateGoalInput {
    title?: string;
    description?: string | null;
    timeframe?: string | null;
    status?: string;
}

export interface CreateOfferInput {
    name: string;
    description?: string | null;
    offer_type?: string | null;
    price?: string | null;
    status?: string;
}

export interface UpdateOfferInput {
    name?: string;
    description?: string | null;
    offer_type?: string | null;
    price?: string | null;
    status?: string;
}

export interface CreateCustomerSegmentInput {
    name: string;
    description?: string | null;
}

export interface UpdateCustomerSegmentInput {
    name?: string;
    description?: string | null;
}

export interface CreateChallengeInput {
    title: string;
    description?: string | null;
    severity?: string;
    status?: string;
}

export interface UpdateChallengeInput {
    title?: string;
    description?: string | null;
    severity?: string;
    status?: string;
}

export interface CreateNoteInput {
    content: string;
    category?: string | null;
}

export interface UpdateNoteInput {
    content?: string;
    category?: string | null;
}

// ---------------------------------------------------------------------------
// ID Generator — matches existing project convention (timestamp-based TEXT IDs)
// ---------------------------------------------------------------------------

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Business Brain CRUD
// ---------------------------------------------------------------------------

/**
 * Get the full Business Brain snapshot for a user.
 * Returns null if the user has no brain record yet.
 */
export async function getBusinessBrain(userId: string): Promise<BusinessBrainSnapshot | null> {
    const db = await getDB();

    const brain: BusinessBrain | null = await db.get(
        "SELECT * FROM business_brain WHERE user_id = ?",
        [userId]
    );

    if (!brain) {
        return null;
    }

    const goals: BusinessGoal[] = await db.all(
        "SELECT * FROM business_goals WHERE brain_id = ? ORDER BY created_at DESC",
        [brain.id]
    );

    const offers: BusinessOffer[] = await db.all(
        "SELECT * FROM business_offers WHERE brain_id = ? ORDER BY created_at DESC",
        [brain.id]
    );

    const customerSegments: BusinessCustomerSegment[] = await db.all(
        "SELECT * FROM business_customer_segments WHERE brain_id = ? ORDER BY created_at DESC",
        [brain.id]
    );

    const challenges: BusinessChallenge[] = await db.all(
        "SELECT * FROM business_challenges WHERE brain_id = ? ORDER BY created_at DESC",
        [brain.id]
    );

    const notes: BusinessNote[] = await db.all(
        "SELECT * FROM business_notes WHERE brain_id = ? ORDER BY created_at DESC",
        [brain.id]
    );

    return { brain, goals, offers, customerSegments, challenges, notes };
}

/**
 * Get just the core Business Brain record (without child entities).
 * Useful when only top-level fields are needed.
 */
export async function getBusinessBrainCore(userId: string): Promise<BusinessBrain | null> {
    const db = await getDB();
    return await db.get(
        "SELECT * FROM business_brain WHERE user_id = ?",
        [userId]
    );
}

/**
 * Check if a user has completed their Business Brain.
 * Returns true if a business_brain record exists for the user.
 */
export async function hasCompletedBusinessBrain(userId: string): Promise<boolean> {
    try {
        const brain = await getBusinessBrainCore(userId);
        return brain !== null;
    } catch (e) {
        return false;
    }
}

/**
 * Create or update the core Business Brain record for a user.
 * If a brain already exists, only the provided fields are updated.
 * Returns the brain ID.
 */
export async function upsertBusinessBrain(
    userId: string,
    input: UpsertBusinessBrainInput
): Promise<string> {
    const db = await getDB();
    const now = Date.now();

    const existing: BusinessBrain | null = await db.get(
        "SELECT * FROM business_brain WHERE user_id = ?",
        [userId]
    );

    if (existing) {
        // Update only the provided fields, preserving existing values
        const businessName = input.business_name !== undefined ? input.business_name : existing.business_name;
        const businessDescription = input.business_description !== undefined ? input.business_description : existing.business_description;
        const industry = input.industry !== undefined ? input.industry : existing.industry;
        const businessStage = input.business_stage !== undefined ? input.business_stage : existing.business_stage;
        const targetMarket = input.target_market !== undefined ? input.target_market : existing.target_market;
        const priorities = input.priorities !== undefined ? input.priorities : existing.priorities;

        await db.run(
            `UPDATE business_brain 
             SET business_name = ?, business_description = ?, industry = ?, 
                 business_stage = ?, target_market = ?, priorities = ?, updated_at = ?
             WHERE id = ?`,
            [businessName, businessDescription, industry, businessStage, targetMarket, priorities, now, existing.id]
        );

        return existing.id;
    } else {
        // Create new brain
        const id = generateId();

        await db.run(
            `INSERT INTO business_brain (id, user_id, business_name, business_description, industry, business_stage, target_market, priorities, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, userId,
                input.business_name ?? null,
                input.business_description ?? null,
                input.industry ?? null,
                input.business_stage ?? null,
                input.target_market ?? null,
                input.priorities ?? null,
                now, now
            ]
        );

        return id;
    }
}

// ---------------------------------------------------------------------------
// Goals CRUD
// ---------------------------------------------------------------------------

export async function getGoals(brainId: string): Promise<BusinessGoal[]> {
    const db = await getDB();
    return await db.all(
        "SELECT * FROM business_goals WHERE brain_id = ? ORDER BY created_at DESC",
        [brainId]
    );
}

export async function addGoal(brainId: string, input: CreateGoalInput): Promise<BusinessGoal> {
    const db = await getDB();
    const id = generateId();
    const now = Date.now();

    await db.run(
        `INSERT INTO business_goals (id, brain_id, title, description, timeframe, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, brainId, input.title, input.description ?? null, input.timeframe ?? null, input.status ?? "active", now]
    );

    return { id, brain_id: brainId, title: input.title, description: input.description ?? null, timeframe: input.timeframe ?? null, status: input.status ?? "active", created_at: now };
}

export async function updateGoal(goalId: string, input: UpdateGoalInput): Promise<void> {
    const db = await getDB();
    const existing: BusinessGoal | null = await db.get("SELECT * FROM business_goals WHERE id = ?", [goalId]);
    if (!existing) throw new Error(`Goal not found: ${goalId}`);

    const title = input.title !== undefined ? input.title : existing.title;
    const description = input.description !== undefined ? input.description : existing.description;
    const timeframe = input.timeframe !== undefined ? input.timeframe : existing.timeframe;
    const status = input.status !== undefined ? input.status : existing.status;

    await db.run(
        "UPDATE business_goals SET title = ?, description = ?, timeframe = ?, status = ? WHERE id = ?",
        [title, description, timeframe, status, goalId]
    );
}

export async function deleteGoal(goalId: string): Promise<void> {
    const db = await getDB();
    await db.run("DELETE FROM business_goals WHERE id = ?", [goalId]);
}

// ---------------------------------------------------------------------------
// Offers CRUD
// ---------------------------------------------------------------------------

export async function getOffers(brainId: string): Promise<BusinessOffer[]> {
    const db = await getDB();
    return await db.all(
        "SELECT * FROM business_offers WHERE brain_id = ? ORDER BY created_at DESC",
        [brainId]
    );
}

export async function addOffer(brainId: string, input: CreateOfferInput): Promise<BusinessOffer> {
    const db = await getDB();
    const id = generateId();
    const now = Date.now();

    await db.run(
        `INSERT INTO business_offers (id, brain_id, name, description, offer_type, price, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, brainId, input.name, input.description ?? null, input.offer_type ?? null, input.price ?? null, input.status ?? "active", now]
    );

    return { id, brain_id: brainId, name: input.name, description: input.description ?? null, offer_type: input.offer_type ?? null, price: input.price ?? null, status: input.status ?? "active", created_at: now };
}

export async function updateOffer(offerId: string, input: UpdateOfferInput): Promise<void> {
    const db = await getDB();
    const existing: BusinessOffer | null = await db.get("SELECT * FROM business_offers WHERE id = ?", [offerId]);
    if (!existing) throw new Error(`Offer not found: ${offerId}`);

    const name = input.name !== undefined ? input.name : existing.name;
    const description = input.description !== undefined ? input.description : existing.description;
    const offerType = input.offer_type !== undefined ? input.offer_type : existing.offer_type;
    const price = input.price !== undefined ? input.price : existing.price;
    const status = input.status !== undefined ? input.status : existing.status;

    await db.run(
        "UPDATE business_offers SET name = ?, description = ?, offer_type = ?, price = ?, status = ? WHERE id = ?",
        [name, description, offerType, price, status, offerId]
    );
}

export async function deleteOffer(offerId: string): Promise<void> {
    const db = await getDB();
    await db.run("DELETE FROM business_offers WHERE id = ?", [offerId]);
}

// ---------------------------------------------------------------------------
// Customer Segments CRUD
// ---------------------------------------------------------------------------

export async function getCustomerSegments(brainId: string): Promise<BusinessCustomerSegment[]> {
    const db = await getDB();
    return await db.all(
        "SELECT * FROM business_customer_segments WHERE brain_id = ? ORDER BY created_at DESC",
        [brainId]
    );
}

export async function addCustomerSegment(brainId: string, input: CreateCustomerSegmentInput): Promise<BusinessCustomerSegment> {
    const db = await getDB();
    const id = generateId();
    const now = Date.now();

    await db.run(
        `INSERT INTO business_customer_segments (id, brain_id, name, description, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, brainId, input.name, input.description ?? null, now]
    );

    return { id, brain_id: brainId, name: input.name, description: input.description ?? null, created_at: now };
}

export async function updateCustomerSegment(segmentId: string, input: UpdateCustomerSegmentInput): Promise<void> {
    const db = await getDB();
    const existing: BusinessCustomerSegment | null = await db.get("SELECT * FROM business_customer_segments WHERE id = ?", [segmentId]);
    if (!existing) throw new Error(`Customer segment not found: ${segmentId}`);

    const name = input.name !== undefined ? input.name : existing.name;
    const description = input.description !== undefined ? input.description : existing.description;

    await db.run(
        "UPDATE business_customer_segments SET name = ?, description = ? WHERE id = ?",
        [name, description, segmentId]
    );
}

export async function deleteCustomerSegment(segmentId: string): Promise<void> {
    const db = await getDB();
    await db.run("DELETE FROM business_customer_segments WHERE id = ?", [segmentId]);
}

// ---------------------------------------------------------------------------
// Challenges CRUD
// ---------------------------------------------------------------------------

export async function getChallenges(brainId: string): Promise<BusinessChallenge[]> {
    const db = await getDB();
    return await db.all(
        "SELECT * FROM business_challenges WHERE brain_id = ? ORDER BY created_at DESC",
        [brainId]
    );
}

export async function addChallenge(brainId: string, input: CreateChallengeInput): Promise<BusinessChallenge> {
    const db = await getDB();
    const id = generateId();
    const now = Date.now();

    await db.run(
        `INSERT INTO business_challenges (id, brain_id, title, description, severity, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, brainId, input.title, input.description ?? null, input.severity ?? "medium", input.status ?? "active", now]
    );

    return { id, brain_id: brainId, title: input.title, description: input.description ?? null, severity: input.severity ?? "medium", status: input.status ?? "active", created_at: now };
}

export async function updateChallenge(challengeId: string, input: UpdateChallengeInput): Promise<void> {
    const db = await getDB();
    const existing: BusinessChallenge | null = await db.get("SELECT * FROM business_challenges WHERE id = ?", [challengeId]);
    if (!existing) throw new Error(`Challenge not found: ${challengeId}`);

    const title = input.title !== undefined ? input.title : existing.title;
    const description = input.description !== undefined ? input.description : existing.description;
    const severity = input.severity !== undefined ? input.severity : existing.severity;
    const status = input.status !== undefined ? input.status : existing.status;

    await db.run(
        "UPDATE business_challenges SET title = ?, description = ?, severity = ?, status = ? WHERE id = ?",
        [title, description, severity, status, challengeId]
    );
}

export async function deleteChallenge(challengeId: string): Promise<void> {
    const db = await getDB();
    await db.run("DELETE FROM business_challenges WHERE id = ?", [challengeId]);
}

// ---------------------------------------------------------------------------
// Notes CRUD
// ---------------------------------------------------------------------------

export async function getNotes(brainId: string): Promise<BusinessNote[]> {
    const db = await getDB();
    return await db.all(
        "SELECT * FROM business_notes WHERE brain_id = ? ORDER BY created_at DESC",
        [brainId]
    );
}

export async function addNote(brainId: string, input: CreateNoteInput): Promise<BusinessNote> {
    const db = await getDB();
    const id = generateId();
    const now = Date.now();

    await db.run(
        `INSERT INTO business_notes (id, brain_id, content, category, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, brainId, input.content, input.category ?? null, now]
    );

    return { id, brain_id: brainId, content: input.content, category: input.category ?? null, created_at: now };
}

export async function updateNote(noteId: string, input: UpdateNoteInput): Promise<void> {
    const db = await getDB();
    const existing: BusinessNote | null = await db.get("SELECT * FROM business_notes WHERE id = ?", [noteId]);
    if (!existing) throw new Error(`Note not found: ${noteId}`);

    const content = input.content !== undefined ? input.content : existing.content;
    const category = input.category !== undefined ? input.category : existing.category;

    await db.run(
        "UPDATE business_notes SET content = ?, category = ? WHERE id = ?",
        [content, category, noteId]
    );
}

export async function deleteNote(noteId: string): Promise<void> {
    const db = await getDB();
    await db.run("DELETE FROM business_notes WHERE id = ?", [noteId]);
}
