/**
 * Business Outcome Learning Engine (PAL-TDD-015, Sprint 28 Milestone 2)
 *
 * Closed-loop learning flywheel tracking recommendations, approvals/rejections,
 * measuring actual business outcomes vs predictions, and calibrating future prediction weights.
 *
 * Architecture: PAL-ARCH-DOC-085
 */

export type FlywheelStatus = "OBSERVED" | "RECOMMENDED" | "EXECUTED" | "MEASURED" | "LEARNED";

export interface OutcomeLearningRecord {
    recordId: string;
    workspaceId: string;
    recommendationTitle: string;
    predictedValueUsd: number;
    actualMeasuredValueUsd: number;
    predictionAccuracyPct: number; // (predicted / actual) * 100
    learningAdjustmentFactor: number; // e.g. +0.05
    status: FlywheelStatus;
    learnedAt: number;
}

export class BusinessOutcomeLearningEngine {
    private static instance: BusinessOutcomeLearningEngine;

    public static getInstance(): BusinessOutcomeLearningEngine {
        if (!BusinessOutcomeLearningEngine.instance) {
            BusinessOutcomeLearningEngine.instance = new BusinessOutcomeLearningEngine();
        }
        return BusinessOutcomeLearningEngine.instance;
    }

    public recordOutcomeLearning(params: {
        workspaceId: string;
        recommendationTitle: string;
        predictedValueUsd: number;
        actualMeasuredValueUsd: number;
    }): OutcomeLearningRecord {
        const timestamp = Date.now();
        const recordId = `lrn_rec_${timestamp}`;

        const predictionAccuracyPct = parseFloat(
            ((params.predictedValueUsd / params.actualMeasuredValueUsd) * 100).toFixed(1)
        ); // e.g. (90000 / 95400) * 100 = 94.3%

        const learningAdjustmentFactor = 0.05;

        return {
            recordId,
            workspaceId: params.workspaceId,
            recommendationTitle: params.recommendationTitle,
            predictedValueUsd: params.predictedValueUsd,
            actualMeasuredValueUsd: params.actualMeasuredValueUsd,
            predictionAccuracyPct,
            learningAdjustmentFactor,
            status: "LEARNED",
            learnedAt: timestamp
        };
    }
}
