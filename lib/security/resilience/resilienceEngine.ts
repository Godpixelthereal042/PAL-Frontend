/**
 * PAL Resilience & Failure Recovery Engine
 * 
 * Governing Spec: PAL-TDD-001 Chapter 14 & Appendix A
 * Architecture Bible: Chapter 23 & 24
 */

import { InternalServerError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:ResilienceEngine");

export type CircuitBreakerState = "closed" | "open" | "half_open";

export interface CircuitBreakerOptions {
    failureThreshold?: number; // Failures before opening circuit (default 5)
    resetTimeoutMs?: number;   // Time in open state before half-opening (default 10000ms)
}

export interface RetryOptions {
    maxAttempts?: number;     // Default 3
    baseDelayMs?: number;     // Default 100ms
    maxDelayMs?: number;      // Default 1000ms
}

export class ResilienceEngine {
    private breakerState: CircuitBreakerState = "closed";
    private failureCount: number = 0;
    private lastStateChange: number = Date.now();
    private failureThreshold: number;
    private resetTimeoutMs: number;
    private idempotencyStore: Map<string, { result: any; expiresAt: number }> = new Map();

    constructor(options?: CircuitBreakerOptions) {
        this.failureThreshold = options?.failureThreshold || 5;
        this.resetTimeoutMs = options?.resetTimeoutMs || 10000;
    }

    public getCircuitState(): CircuitBreakerState {
        if (this.breakerState === "open" && Date.now() - this.lastStateChange > this.resetTimeoutMs) {
            this.breakerState = "half_open";
            this.lastStateChange = Date.now();
            logger.info("Circuit breaker state transitioned to HALF_OPEN");
        }
        return this.breakerState;
    }

    public async executeWithResilience<T>(
        fn: () => Promise<T>,
        options?: {
            retry?: RetryOptions;
            timeoutMs?: number;
            idempotencyKey?: string;
        }
    ): Promise<T> {
        // 1. Idempotency Check
        if (options?.idempotencyKey) {
            const cached = this.idempotencyStore.get(options.idempotencyKey);
            if (cached && Date.now() < cached.expiresAt) {
                logger.debug("Idempotency key hit; returning cached result", { key: options.idempotencyKey });
                return cached.result;
            }
        }

        // 2. Circuit Breaker Check
        const currentState = this.getCircuitState();
        if (currentState === "open") {
            logger.warn("Resilience Engine: Circuit is OPEN; execution blocked");
            throw new InternalServerError("Service unavailable: Circuit breaker is OPEN", {
                details: { errorCode: "CIRCUIT_BREAKER_OPEN" }
            });
        }

        // 3. Retry Execution with Timeout
        const maxAttempts = options?.retry?.maxAttempts || 3;
        const baseDelayMs = options?.retry?.baseDelayMs || 50;
        let lastError: any;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const result = options?.timeoutMs
                    ? await this.withTimeout(fn(), options.timeoutMs)
                    : await fn();

                // Success: reset failure state
                if (this.breakerState === "half_open") {
                    this.breakerState = "closed";
                    this.failureCount = 0;
                    this.lastStateChange = Date.now();
                    logger.info("Circuit breaker state reset to CLOSED after successful execution");
                }

                // Store idempotency result
                if (options?.idempotencyKey) {
                    this.idempotencyStore.set(options.idempotencyKey, {
                        result,
                        expiresAt: Date.now() + 3600000 // 1 hour TTL
                    });
                }

                return result;
            } catch (err: any) {
                lastError = err;
                this.failureCount++;
                logger.warn(`Execution failed (Attempt ${attempt}/${maxAttempts})`, { error: err.message });

                if (this.failureCount >= this.failureThreshold) {
                    this.breakerState = "open";
                    this.lastStateChange = Date.now();
                    logger.error("Failure threshold reached: Circuit breaker transitioned to OPEN");
                }

                if (attempt < maxAttempts) {
                    const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), options?.retry?.maxDelayMs || 1000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new InternalServerError(`Execution timed out after ${timeoutMs}ms`, {
                    details: { errorCode: "EXECUTION_TIMEOUT" }
                }));
            }, timeoutMs);

            promise.then(
                res => { clearTimeout(timer); resolve(res); },
                err => { clearTimeout(timer); reject(err); }
            );
        });
    }
}
