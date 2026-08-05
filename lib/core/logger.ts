/**
 * PAL Core Logger Module
 * 
 * Governing Bible Chapters:
 * - Chapter 25: Observability, Audit & Operational Intelligence Architecture
 */

import { palConfig } from "./config.ts";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
    correlationId?: string;
    userId?: string;
    organizationId?: string;
    agentRole?: string;
    module?: string;
    [key: string]: any;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

export class PALLogger {
    private moduleName: string;
    private defaultContext: LogContext;

    constructor(moduleName: string, defaultContext: LogContext = {}) {
        this.moduleName = moduleName;
        this.defaultContext = { module: moduleName, ...defaultContext };
    }

    private shouldLog(level: LogLevel): boolean {
        const configuredLevel = palConfig.logging.level;
        return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[configuredLevel];
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext, err?: Error): string {
        const mergedContext = { ...this.defaultContext, ...context };
        const timestamp = new Date().toISOString();

        const logEntry: LogEntry = {
            timestamp,
            level,
            message: `[${this.moduleName}] ${message}`,
            context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
        };

        if (err) {
            logEntry.error = {
                name: err.name,
                message: err.message,
                stack: err.stack,
            };
        }

        if (palConfig.logging.format === 'json') {
            return JSON.stringify(logEntry);
        }

        const cidStr = mergedContext.correlationId ? ` (CID: ${mergedContext.correlationId})` : '';
        const errStr = err ? `\n  Error: ${err.name} - ${err.message}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.moduleName}]${cidStr} ${message}${errStr}`;
    }

    public debug(message: string, context?: LogContext): void {
        if (!this.shouldLog('debug')) return;
        console.debug(this.formatMessage('debug', message, context));
    }

    public info(message: string, context?: LogContext): void {
        if (!this.shouldLog('info')) return;
        console.info(this.formatMessage('info', message, context));
    }

    public warn(message: string, context?: LogContext, err?: Error): void {
        if (!this.shouldLog('warn')) return;
        console.warn(this.formatMessage('warn', message, context, err));
    }

    public error(message: string, context?: LogContext, err?: Error): void {
        if (!this.shouldLog('error')) return;
        console.error(this.formatMessage('error', message, context, err));
    }
}

export function createLogger(moduleName: string, defaultContext?: LogContext): PALLogger {
    return new PALLogger(moduleName, defaultContext);
}

export const logger = createLogger('PALCore');
