/**
 * PAL Standardized Error Hierarchy & Exception Definitions
 * 
 * Governing Bible Chapters:
 * - Chapter 27: Platform API & Developer Experience (DX) Architecture
 */

export interface ErrorDetails {
    code: string;
    message: string;
    correlationId?: string;
    suggestedResolution?: string;
    documentationUrl?: string;
    details?: Record<string, any>;
}

export abstract class PALError extends Error {
    public abstract readonly statusCode: number;
    public abstract readonly errorCode: string;
    public readonly correlationId?: string;
    public readonly suggestedResolution?: string;
    public readonly details?: Record<string, any>;

    constructor(message: string, options?: { correlationId?: string; suggestedResolution?: string; details?: Record<string, any> }) {
        super(message);
        this.name = this.constructor.name;
        this.correlationId = options?.correlationId;
        this.suggestedResolution = options?.suggestedResolution;
        this.details = options?.details;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toJSON(): ErrorDetails {
        return {
            code: this.errorCode,
            message: this.message,
            correlationId: this.correlationId,
            suggestedResolution: this.suggestedResolution,
            details: this.details,
        };
    }
}

export class NotFoundError extends PALError {
    public readonly statusCode = 404;
    public readonly errorCode = 'RESOURCE_NOT_FOUND';
}

export class UnauthorizedError extends PALError {
    public readonly statusCode = 401;
    public readonly errorCode = 'UNAUTHORIZED';
}

export class ForbiddenError extends PALError {
    public readonly statusCode = 403;
    public readonly errorCode = 'FORBIDDEN_ACCESS';
}

export class ValidationError extends PALError {
    public readonly statusCode = 400;
    public readonly errorCode = 'VALIDATION_FAILED';
}

export class ConflictError extends PALError {
    public readonly statusCode = 409;
    public readonly errorCode = 'RESOURCE_CONFLICT';
}

export class GovernanceError extends PALError {
    public readonly statusCode = 422;
    public readonly errorCode = 'GOVERNANCE_POLICY_VIOLATION';
}

export class RateLimitError extends PALError {
    public readonly statusCode = 429;
    public readonly errorCode = 'RATE_LIMIT_EXCEEDED';
}

export class InternalServerError extends PALError {
    public readonly statusCode = 500;
    public readonly errorCode = 'INTERNAL_SERVER_ERROR';
}
