/**
 * PAL Standardized API Response Framework
 * 
 * Governing Bible Chapters:
 * - Chapter 27: Platform API & Developer Experience (DX) Architecture
 */

import { ErrorDetails } from "./errors.ts";

export interface ResponseMetadata {
    timestamp: string;
    correlationId?: string;
    page?: number;
    pageSize?: number;
    totalCount?: number;
    executionTimeMs?: number;
    [key: string]: any;
}

export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ErrorDetails;
    meta: ResponseMetadata;
}

export class APIResponseBuilder {
    public static success<T>(data: T, meta?: Partial<ResponseMetadata>): APIResponse<T> {
        return {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                ...meta,
            },
        };
    }

    public static paginated<T>(items: T[], page: number, pageSize: number, totalCount: number, meta?: Partial<ResponseMetadata>): APIResponse<T[]> {
        return {
            success: true,
            data: items,
            meta: {
                timestamp: new Date().toISOString(),
                page,
                pageSize,
                totalCount,
                ...meta,
            },
        };
    }

    public static error(error: ErrorDetails, meta?: Partial<ResponseMetadata>): APIResponse<null> {
        return {
            success: false,
            data: null,
            error,
            meta: {
                timestamp: new Date().toISOString(),
                correlationId: error.correlationId,
                ...meta,
            },
        };
    }
}
