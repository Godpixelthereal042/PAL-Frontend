/**
 * Secure HTTP Gateway (PAL-TDD-006, Sprint 8 Milestone 2)
 *
 * Centralized outbound HTTP security layer preventing Server-Side Request Forgery (SSRF),
 * enforcing domain allowlisting, request timeouts, payload limits, and security audit logging.
 */

import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

export interface GatewayRequestConfig {
    url: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: string | Buffer | Record<string, any>;
    timeoutMs?: number;
    maxResponseSizeBytes?: number;
    workspaceId?: string;
    actorId?: string;
}

export interface GatewayResponse {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: string;
    json<T = any>(): T;
    latencyMs: number;
}

export interface GatewayAuditLog {
    auditId: string;
    workspaceId: string;
    actorId: string;
    url: string;
    domain: string;
    method: string;
    statusCode?: number;
    allowed: boolean;
    reason?: string;
    timestamp: number;
}

export class SecureHttpGateway {
    private static instance: SecureHttpGateway;
    private auditLogs: GatewayAuditLog[] = [];

    // Default approved SaaS domain allowlist
    private allowedDomains: Set<string> = new Set([
        "googleapis.com",
        "accounts.google.com",
        "generativelanguage.googleapis.com",
        "api.stripe.com",
        "api.hubapi.com",
        "salesforce.com",
        "slack.com",
        "api.github.com",
        "quickbooks.api.intuit.com",
        "api.sendgrid.com",
        "api.upstash.com"
    ]);

    // Private IP ranges (IPv4 + IPv6 + Cloud Metadata)
    private privateIpRegexes: RegExp[] = [
        /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,                // 127.0.0.0/8 (Loopback)
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,                 // 10.0.0.0/8 (Private Class A)
        /^172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}$/,  // 172.16.0.0/12 (Private Class B)
        /^192\.168\.\d{1,3}\.\d{1,3}$/,                    // 192.168.0.0/16 (Private Class C)
        /^169\.254\.169\.254$/,                             // Cloud Metadata Instance IP
        /^169\.254\.\d{1,3}\.\d{1,3}$/,                    // 169.254.0.0/16 (Link-Local)
        /^0\.0\.0\.0$/,                                     // Any Local IPv4
        /^localhost$/i,                                     // Localhost string
        /^::1$/,                                           // IPv6 Loopback
        /^fe80:/i,                                         // IPv6 Link-Local
        /^fc00:/i,                                         // IPv6 Unique Local
        /^fd00:/i                                          // IPv6 Unique Local
    ];

    constructor(customAllowedDomains?: string[]) {
        if (customAllowedDomains) {
            customAllowedDomains.forEach(d => this.allowedDomains.add(d.toLowerCase()));
        }
    }

    public static getInstance(): SecureHttpGateway {
        if (!SecureHttpGateway.instance) {
            SecureHttpGateway.instance = new SecureHttpGateway();
        }
        return SecureHttpGateway.instance;
    }

    public addAllowedDomain(domain: string): void {
        this.allowedDomains.add(domain.toLowerCase());
    }

    public isDomainAllowed(hostname: string): boolean {
        const cleanHost = hostname.toLowerCase().trim();
        
        // Direct match
        if (this.allowedDomains.has(cleanHost)) return true;

        // Subdomain match (e.g. gmail.googleapis.com matches googleapis.com)
        for (const allowed of this.allowedDomains) {
            if (cleanHost.endsWith("." + allowed)) return true;
        }

        return false;
    }

    public isPrivateOrRestrictedIp(hostname: string): boolean {
        const cleanHost = hostname.toLowerCase().trim();
        return this.privateIpRegexes.some(regex => regex.test(cleanHost));
    }

    public validateUrlSecurity(targetUrl: string): { valid: boolean; reason?: string; parsedUrl?: URL } {
        try {
            const parsed = new URL(targetUrl);

            // 1. Protocol check
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                return { valid: false, reason: `Forbidden protocol '${parsed.protocol}'. Only http/https allowed.` };
            }

            // 2. Private IP / Loopback / Cloud Metadata SSRF check
            if (this.isPrivateOrRestrictedIp(parsed.hostname)) {
                return { valid: false, reason: `SSRF Blocked: Target '${parsed.hostname}' is a private/restricted network or metadata endpoint.` };
            }

            // 3. Domain allowlist check
            if (!this.isDomainAllowed(parsed.hostname)) {
                return { valid: false, reason: `Security Policy Violation: Domain '${parsed.hostname}' is not in the approved SaaS gateway allowlist.` };
            }

            return { valid: true, parsedUrl: parsed };
        } catch (err: any) {
            return { valid: false, reason: `Invalid URL format: ${err.message}` };
        }
    }

    public async executeRequest(config: GatewayRequestConfig): Promise<GatewayResponse> {
        const startTime = Date.now();
        const workspaceId = config.workspaceId || "default_workspace";
        const actorId = config.actorId || "system";
        const method = config.method || "GET";
        const timeoutMs = config.timeoutMs || 10000;
        const maxPayloadSize = config.maxResponseSizeBytes || 5 * 1024 * 1024; // 5MB default limit

        // Security Validation Gate
        const val = this.validateUrlSecurity(config.url);
        if (!val.valid || !val.parsedUrl) {
            const auditEntry: GatewayAuditLog = {
                auditId: `audit_gw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                workspaceId,
                actorId,
                url: config.url,
                domain: val.parsedUrl?.hostname || "unknown",
                method,
                allowed: false,
                reason: val.reason,
                timestamp: Date.now()
            };
            this.auditLogs.push(auditEntry);
            throw new Error(`[SecureHttpGateway Blocked] ${val.reason}`);
        }

        const parsedUrl = val.parsedUrl;

        // Log allowed request attempt
        const auditEntry: GatewayAuditLog = {
            auditId: `audit_gw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            actorId,
            url: config.url,
            domain: parsedUrl.hostname,
            method,
            allowed: true,
            timestamp: Date.now()
        };

        let bodyPayload: string | undefined;
        if (config.body) {
            bodyPayload = typeof config.body === "object" ? JSON.stringify(config.body) : String(config.body);
        }

        // Return a mock / safe http fetch for node environment testing
        return new Promise<GatewayResponse>((resolve, reject) => {
            const isHttps = parsedUrl.protocol === "https:";
            const transport = isHttps ? https : http;

            const reqOptions: http.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method,
                headers: {
                    "User-Agent": "PAL-SecureHttpGateway/v0.9.0",
                    ...config.headers
                },
                timeout: timeoutMs
            };

            const req = transport.request(reqOptions, (res) => {
                let data = "";
                let bodyLength = 0;

                res.on("data", (chunk) => {
                    bodyLength += chunk.length;
                    if (bodyLength > maxPayloadSize) {
                        req.destroy();
                        auditEntry.reason = `Payload size limit exceeded (${bodyLength} > ${maxPayloadSize} bytes)`;
                        this.auditLogs.push(auditEntry);
                        reject(new Error(`[SecureHttpGateway Error] Response size exceeded limit of ${maxPayloadSize} bytes`));
                        return;
                    }
                    data += chunk;
                });

                res.on("end", () => {
                    auditEntry.statusCode = res.statusCode;
                    this.auditLogs.push(auditEntry);
                    resolve({
                        statusCode: res.statusCode || 200,
                        headers: res.headers as Record<string, string | string[] | undefined>,
                        body: data,
                        json: <T = any>() => JSON.parse(data || "{}") as T,
                        latencyMs: Date.now() - startTime
                    });
                });
            });

            req.on("error", (err) => {
                auditEntry.reason = err.message;
                this.auditLogs.push(auditEntry);
                reject(err);
            });

            req.on("timeout", () => {
                req.destroy();
                auditEntry.reason = `Request timed out after ${timeoutMs}ms`;
                this.auditLogs.push(auditEntry);
                reject(new Error(`[SecureHttpGateway Error] Request timeout after ${timeoutMs}ms`));
            });

            if (bodyPayload) {
                req.write(bodyPayload);
            }
            req.end();
        });
    }

    public getAuditLogs(workspaceId?: string): GatewayAuditLog[] {
        if (!workspaceId) return this.auditLogs;
        return this.auditLogs.filter(log => log.workspaceId === workspaceId);
    }

    public clearAuditLogs(): void {
        this.auditLogs = [];
    }
}
