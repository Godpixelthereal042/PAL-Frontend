import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
    getBusinessBrain,
    upsertBusinessBrain,
    addGoal,
    addOffer,
    addCustomerSegment,
    addChallenge,
    addNote,
    type UpsertBusinessBrainInput,
    type CreateGoalInput,
    type CreateOfferInput,
    type CreateCustomerSegmentInput,
    type CreateChallengeInput,
    type CreateNoteInput,
} from "@/lib/businessBrain";

/**
 * GET /api/business-brain
 *
 * Returns the full Business Brain snapshot for the authenticated user,
 * including all child entities (goals, offers, segments, challenges, notes).
 *
 * Returns 404 if the user has not created a Business Brain yet.
 * Returns 401 if the user is not authenticated.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const snapshot = await getBusinessBrain(user.id);
        if (!snapshot) {
            return NextResponse.json({ error: "Business Brain not found" }, { status: 404 });
        }

        return NextResponse.json(snapshot);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/business-brain
 *
 * Creates or updates the Business Brain for the authenticated user.
 *
 * Body fields (all optional — partial updates are supported):
 *   - business_name: string
 *   - business_description: string
 *   - industry: string
 *   - business_stage: string   ("idea" | "pre-launch" | "launched" | "scaling")
 *   - target_market: string
 *   - priorities: string
 *
 * Optionally, child entities can be batch-added in the same request:
 *   - goals: CreateGoalInput[]
 *   - offers: CreateOfferInput[]
 *   - customer_segments: CreateCustomerSegmentInput[]
 *   - challenges: CreateChallengeInput[]
 *   - notes: CreateNoteInput[]
 *
 * Returns the full Business Brain snapshot after the operation.
 */
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Extract core brain fields
        const brainInput: UpsertBusinessBrainInput = {};
        if (body.business_name !== undefined) brainInput.business_name = body.business_name;
        if (body.business_description !== undefined) brainInput.business_description = body.business_description;
        if (body.industry !== undefined) brainInput.industry = body.industry;
        if (body.business_stage !== undefined) brainInput.business_stage = body.business_stage;
        if (body.target_market !== undefined) brainInput.target_market = body.target_market;
        if (body.priorities !== undefined) brainInput.priorities = body.priorities;

        // Upsert core brain record
        const brainId = await upsertBusinessBrain(user.id, brainInput);

        // Batch-add child entities if provided
        if (Array.isArray(body.goals)) {
            for (const goal of body.goals) {
                if (!goal.title) continue;
                const input: CreateGoalInput = {
                    title: goal.title,
                    description: goal.description,
                    timeframe: goal.timeframe,
                    status: goal.status,
                };
                await addGoal(brainId, input);
            }
        }

        if (Array.isArray(body.offers)) {
            for (const offer of body.offers) {
                if (!offer.name) continue;
                const input: CreateOfferInput = {
                    name: offer.name,
                    description: offer.description,
                    offer_type: offer.offer_type,
                    price: offer.price,
                    status: offer.status,
                };
                await addOffer(brainId, input);
            }
        }

        if (Array.isArray(body.customer_segments)) {
            for (const segment of body.customer_segments) {
                if (!segment.name) continue;
                const input: CreateCustomerSegmentInput = {
                    name: segment.name,
                    description: segment.description,
                };
                await addCustomerSegment(brainId, input);
            }
        }

        if (Array.isArray(body.challenges)) {
            for (const challenge of body.challenges) {
                if (!challenge.title) continue;
                const input: CreateChallengeInput = {
                    title: challenge.title,
                    description: challenge.description,
                    severity: challenge.severity,
                    status: challenge.status,
                };
                await addChallenge(brainId, input);
            }
        }

        if (Array.isArray(body.notes)) {
            for (const note of body.notes) {
                if (!note.content) continue;
                const input: CreateNoteInput = {
                    content: note.content,
                    category: note.category,
                };
                await addNote(brainId, input);
            }
        }

        // Return the full snapshot after all operations
        const snapshot = await getBusinessBrain(user.id);
        return NextResponse.json(snapshot);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/business-brain
 *
 * Alias for POST — follows existing project convention (see profile/route.ts).
 */
export async function PUT(request: Request) {
    return POST(request);
}
