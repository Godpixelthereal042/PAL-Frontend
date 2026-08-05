import { ActionType } from "../types.ts";
import type { ActionHandler, UpdateBusinessBrainParams, ValidationResult } from "../types.ts";
import {
    upsertBusinessBrain,
    addGoal,
    addOffer,
    addCustomerSegment,
    addChallenge,
    addNote,
    getBusinessBrain,
} from "../../businessBrain.ts";

export const updateBusinessBrainHandler: ActionHandler<UpdateBusinessBrainParams> = {
    type: ActionType.UPDATE_BUSINESS_BRAIN,

    validate(params: UpdateBusinessBrainParams): ValidationResult {
        const errors: string[] = [];

        if (!params || typeof params !== "object") {
            return { valid: false, errors: ["Missing or invalid payload parameters"] };
        }

        const hasCoreField =
            params.businessName !== undefined ||
            params.businessDescription !== undefined ||
            params.industry !== undefined ||
            params.businessStage !== undefined ||
            params.targetMarket !== undefined ||
            params.priorities !== undefined;

        const hasChildEntities =
            (Array.isArray(params.goals) && params.goals.length > 0) ||
            (Array.isArray(params.offers) && params.offers.length > 0) ||
            (Array.isArray(params.customerSegments) && params.customerSegments.length > 0) ||
            (Array.isArray(params.challenges) && params.challenges.length > 0) ||
            (Array.isArray(params.notes) && params.notes.length > 0);

        if (!hasCoreField && !hasChildEntities) {
            errors.push("Payload must contain at least one business brain property or child entity to update.");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    async execute(params: UpdateBusinessBrainParams, userId: string, _db: any) {
        const effectiveUserId = userId === "current_user" ? "user_demo" : userId;

        // Upsert core business brain table
        const brainId = await upsertBusinessBrain(effectiveUserId, {
            business_name: params.businessName,
            business_description: params.businessDescription,
            industry: params.industry,
            business_stage: params.businessStage,
            target_market: params.targetMarket,
            priorities: params.priorities,
        });

        // Add child goals if present
        if (Array.isArray(params.goals)) {
            for (const goal of params.goals) {
                if (goal.title) {
                    await addGoal(brainId, {
                        title: goal.title,
                        description: goal.description,
                        timeframe: goal.timeframe,
                        status: goal.status,
                    });
                }
            }
        }

        // Add child offers if present
        if (Array.isArray(params.offers)) {
            for (const offer of params.offers) {
                if (offer.name) {
                    await addOffer(brainId, {
                        name: offer.name,
                        description: offer.description,
                        offer_type: offer.offerType,
                        price: offer.price,
                        status: offer.status,
                    });
                }
            }
        }

        // Add customer segments if present
        if (Array.isArray(params.customerSegments)) {
            for (const segment of params.customerSegments) {
                if (segment.name) {
                    await addCustomerSegment(brainId, {
                        name: segment.name,
                        description: segment.description,
                    });
                }
            }
        }

        // Add challenges if present
        if (Array.isArray(params.challenges)) {
            for (const challenge of params.challenges) {
                if (challenge.title) {
                    await addChallenge(brainId, {
                        title: challenge.title,
                        description: challenge.description,
                        severity: challenge.severity,
                        status: challenge.status,
                    });
                }
            }
        }

        // Add notes if present
        if (Array.isArray(params.notes)) {
            for (const note of params.notes) {
                if (note.content) {
                    await addNote(brainId, {
                        content: note.content,
                        category: note.category,
                    });
                }
            }
        }

        const updatedSnapshot = await getBusinessBrain(effectiveUserId);

        return {
            brain: updatedSnapshot,
            message: `Business Brain updated successfully for user ${effectiveUserId}.`,
        };
    },
};
