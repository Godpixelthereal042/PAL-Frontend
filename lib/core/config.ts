/**
 * PAL Core Configuration Module
 * 
 * Governing Bible Chapters:
 * - Chapter 23: Identity, Authentication & Authorization Architecture
 * - Chapter 28: Deployment, Infrastructure & DevOps Architecture
 */

export interface PALConfig {
    env: 'development' | 'staging' | 'production' | 'test';
    port: number;
    appName: string;
    database: {
        sqlitePath: string;
        supabaseUrl?: string;
        supabaseKey?: string;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        format: 'json' | 'pretty';
    };
    auth: {
        jwtSecret: string;
        sessionMaxAge: number;
    };
    ai: {
        defaultProvider: string;
        geminiApiKey?: string;
        openaiApiKey?: string;
    };
}

function parseEnvString(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

function parseEnvNumber(key: string, defaultValue: number): number {
    const val = process.env[key];
    if (!val) return defaultValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): PALConfig {
    const env = (process.env.NODE_ENV || 'development') as PALConfig['env'];

    return {
        env,
        port: parseEnvNumber('PORT', 3000),
        appName: parseEnvString('PAL_APP_NAME', 'PAL Executive Operating System'),
        database: {
            sqlitePath: parseEnvString('SQLITE_DB_PATH', './pal.db'),
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        logging: {
            level: (parseEnvString('LOG_LEVEL', env === 'development' ? 'debug' : 'info') as PALConfig['logging']['level']),
            format: env === 'production' ? 'json' : 'pretty',
        },
        auth: {
            jwtSecret: parseEnvString('JWT_SECRET', 'pal-default-secret-change-in-production'),
            sessionMaxAge: parseEnvNumber('SESSION_MAX_AGE_SECONDS', 86400 * 7), // 7 days
        },
        ai: {
            defaultProvider: parseEnvString('DEFAULT_AI_PROVIDER', 'gemini'),
            geminiApiKey: process.env.GEMINI_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
        },
    };
}

export const palConfig: PALConfig = loadConfig();

export function validateRequiredSecrets(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'pal-default-secret-change-in-production') {
            missing.push('JWT_SECRET');
        }
        if (!process.env.AUDIT_SIGNATURE_SECRET || process.env.AUDIT_SIGNATURE_SECRET === 'pal-audit-tamper-proof-secret-2026') {
            missing.push('AUDIT_SIGNATURE_SECRET');
        }
    }
    return { valid: missing.length === 0, missing };
}

