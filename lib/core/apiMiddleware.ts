/**
 * PAL API Pipeline Middleware Handler
 * 
 * Governing Bible Chapters:
 * - Chapter 23: Identity, Authentication & Authorization Architecture
 * - Chapter 25: Observability, Audit & Operational Intelligence Architecture
 * - Chapter 27: Platform API & Developer Experience (DX) Architecture
 */

import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "./logger.ts";
import { PALError, InternalServerError } from "./errors.ts";
import { APIResponseBuilder } from "./apiResponse.ts";

export interface RequestContext {
    correlationId: string;
    startTime: number;
    userId?: string;
    organizationId?: string;
}

export type HandlerFunction = (req: NextRequest, ctx: RequestContext) => Promise<NextResponse | Response>;

export function withAPIMiddleware(handler: HandlerFunction, options?: { moduleName?: string; requireAuth?: boolean }) {
    const logger = createLogger(options?.moduleName || "APIEndpoint");

    return async (req: NextRequest): Promise<NextResponse | Response> => {
        const startTime = Date.now();
        const correlationId = req.headers.get("x-correlation-id") || `cid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        const ctx: RequestContext = {
            correlationId,
            startTime,
            userId: req.headers.get("x-user-id") || undefined,
            organizationId: req.headers.get("x-organization-id") || undefined,
        };

        logger.info(`--> ${req.method} ${req.nextUrl.pathname}`, { correlationId, userId: ctx.userId });

        try {
            const response = await handler(req, ctx);
            const durationMs = Date.now() - startTime;

            logger.info(`<-- ${req.method} ${req.nextUrl.pathname} [${response.status}] (${durationMs}ms)`, { correlationId });

            if (response instanceof NextResponse) {
                response.headers.set("x-correlation-id", correlationId);
            }

            return response;
        } catch (err: any) {
            const durationMs = Date.now() - startTime;

            if (err instanceof PALError) {
                logger.warn(`API Exception: ${err.errorCode} - ${err.message}`, { correlationId }, err);
                const payload = APIResponseBuilder.error(err.toJSON(), { correlationId, executionTimeMs: durationMs });
                return NextResponse.json(payload, { status: err.statusCode, headers: { "x-correlation-id": correlationId } });
            }

            logger.error(`Unhandled API Error: ${err.message}`, { correlationId }, err);
            const internalErr = new InternalServerError("An unexpected platform error occurred", { correlationId, details: { message: err.message } });
            const payload = APIResponseBuilder.error(internalErr.toJSON(), { correlationId, executionTimeMs: durationMs });
            return NextResponse.json(payload, { status: 500, headers: { "x-correlation-id": correlationId } });
        }
    };
}
