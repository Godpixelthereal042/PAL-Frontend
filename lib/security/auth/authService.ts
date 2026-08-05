/**
 * PAL Authentication Service
 * 
 * Governing Spec: PAL-TDD-001 Chapter 7 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import crypto from "crypto";
import { Argon2idPasswordHasher, type IPasswordHasher } from "./passwordHasher.ts";
import { JWTTokenProvider, type ITokenProvider } from "../providers/tokenProvider.ts";
import { SessionManager } from "../sessions/sessionManager.ts";
import { RoleRepository } from "../../db/repositories/roleRepository.ts";
import { PermissionRepository } from "../../db/repositories/permissionRepository.ts";
import { AuditRepository } from "../../db/repositories/auditRepository.ts";
import { getDB } from "../../db.ts";
import { UnauthorizedError, ValidationError, ConflictError } from "../../core/errors.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:AuthService");

export interface RegisterParams {
    email: string;
    password?: string;
    fullName: string;
    workspaceName?: string;
    device?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface LoginParams {
    email: string;
    password?: string;
    device?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        fullName: string;
        workspaceId: string;
        roles: string[];
    };
}

export class AuthService {
    private passwordHasher: IPasswordHasher;
    private tokenProvider: ITokenProvider;
    private sessionManager: SessionManager;
    private roleRepo: RoleRepository;
    private permRepo: PermissionRepository;
    private auditRepo: AuditRepository;

    constructor(
        passwordHasher?: IPasswordHasher,
        tokenProvider?: ITokenProvider,
        sessionManager?: SessionManager,
        roleRepo?: RoleRepository,
        permRepo?: PermissionRepository,
        auditRepo?: AuditRepository
    ) {
        this.passwordHasher = passwordHasher || new Argon2idPasswordHasher();
        this.tokenProvider = tokenProvider || new JWTTokenProvider();
        this.sessionManager = sessionManager || new SessionManager();
        this.roleRepo = roleRepo || new RoleRepository();
        this.permRepo = permRepo || new PermissionRepository();
        this.auditRepo = auditRepo || new AuditRepository();
    }

    public async register(params: RegisterParams): Promise<AuthResponse> {
        if (!params.email || !params.email.includes("@")) {
            throw new ValidationError("Invalid email address", { details: { field: "email" } });
        }
        if (params.password && params.password.length < 8) {
            throw new ValidationError("Password must be at least 8 characters long", { details: { field: "password" } });
        }

        const db = await getDB();
        const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [params.email.toLowerCase()]);
        if (existingUser) {
            throw new ConflictError("Account with this email already exists", { details: { email: params.email } });
        }

        const userId = `usr_${crypto.randomUUID()}`;
        const workspaceId = `ws_${crypto.randomUUID()}`;
        const now = Date.now();
        const slug = (params.workspaceName || params.fullName).toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString(36);

        // 1. Create Workspace
        await db.run(
            `INSERT INTO workspaces (id, name, slug, plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [workspaceId, params.workspaceName || `${params.fullName}'s Workspace`, slug, "enterprise", "active", now, now]
        );

        // 2. Hash Password (Argon2id)
        const passwordHash = params.password ? await this.passwordHasher.hashPassword(params.password) : null;

        // 3. Create User
        await db.run(
            `INSERT INTO users (id, workspace_id, email, password_hash, password, full_name, name, avatar, status, last_login, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, workspaceId, params.email.toLowerCase(), passwordHash, passwordHash, params.fullName, params.fullName, null, "active", now, now, now]
        );

        // 4. Create Default Founder Role
        const roleId = `role_${crypto.randomUUID()}`;
        await this.roleRepo.createRole({
            id: roleId,
            workspace_id: workspaceId,
            name: "Founder",
            description: "Full workspace administrative authority",
            system_role: 1,
            created_at: now
        });
        await this.roleRepo.assignRoleToUser({
            user_id: userId,
            role_id: roleId,
            assigned_by: "system",
            assigned_at: now
        });

        // 5. Establish Session
        const session = await this.sessionManager.createSession({
            userId,
            workspaceId,
            device: params.device,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent
        });

        // 6. Generate Access Token
        const correlationId = `corr_${crypto.randomUUID()}`;
        const accessToken = await this.tokenProvider.generateAccessToken({
            sub: userId,
            workspaceId,
            email: params.email.toLowerCase(),
            roles: ["Founder"],
            permissions: ["*"],
            sessionId: session.id,
            correlationId
        });

        // 7. Audit Log
        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: workspaceId,
            actor_id: userId,
            actor_type: "human",
            event: "UserRegistered",
            resource: "/api/v1/auth/register",
            result: "success",
            correlation_id: correlationId,
            ip_address: params.ipAddress,
            metadata: JSON.stringify({ email: params.email }),
            created_at: now
        });

        logger.info("User registered successfully", { userId, workspaceId });

        return {
            accessToken,
            refreshToken: session.refresh_token,
            expiresIn: 900,
            user: {
                id: userId,
                email: params.email.toLowerCase(),
                fullName: params.fullName,
                workspaceId,
                roles: ["Founder"]
            }
        };
    }

    public async login(params: LoginParams): Promise<AuthResponse> {
        if (!params.email || !params.password) {
            throw new ValidationError("Email and password are required", { details: { fields: ["email", "password"] } });
        }

        const db = await getDB();
        const user = await db.get("SELECT * FROM users WHERE email = ?", [params.email.toLowerCase()]);
        if (!user || !user.password_hash) {
            logger.warn("Login failed: User not found", { email: params.email });
            throw new UnauthorizedError("Invalid email or password", { details: { errorCode: "AUTH_INVALID_CREDENTIALS" } });
        }

        const isPasswordValid = await this.passwordHasher.verifyPassword(params.password, user.password_hash);
        if (!isPasswordValid) {
            logger.warn("Login failed: Invalid password", { userId: user.id });
            throw new UnauthorizedError("Invalid email or password", { details: { errorCode: "AUTH_INVALID_CREDENTIALS" } });
        }

        // Fetch User Roles & Permissions
        const userRoles = await this.roleRepo.findUserRoles(user.id);
        const roleNames = userRoles.map(r => r.name);
        const permissions = await this.permRepo.findUserEffectivePermissions(user.id);
        const permissionKeys = Array.from(new Set(permissions.map(p => p.key)));

        // Establish Session
        const session = await this.sessionManager.createSession({
            userId: user.id,
            workspaceId: user.workspace_id,
            device: params.device,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent
        });

        const correlationId = `corr_${crypto.randomUUID()}`;
        const accessToken = await this.tokenProvider.generateAccessToken({
            sub: user.id,
            workspaceId: user.workspace_id,
            email: user.email,
            roles: roleNames,
            permissions: permissionKeys.length > 0 ? permissionKeys : ["*"],
            sessionId: session.id,
            correlationId
        });

        // Update Last Login
        await db.run("UPDATE users SET last_login = ? WHERE id = ?", [Date.now(), user.id]);

        // Audit Log
        await this.auditRepo.logEvent({
            id: `audit_${crypto.randomUUID()}`,
            workspace_id: user.workspace_id,
            actor_id: user.id,
            actor_type: "human",
            event: "UserLoggedIn",
            resource: "/api/v1/auth/login",
            result: "success",
            correlation_id: correlationId,
            ip_address: params.ipAddress,
            created_at: Date.now()
        });

        logger.info("User logged in successfully", { userId: user.id });

        return {
            accessToken,
            refreshToken: session.refresh_token,
            expiresIn: 900,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                workspaceId: user.workspace_id,
                roles: roleNames
            }
        };
    }

    public async refresh(refreshToken: string): Promise<AuthResponse> {
        const refreshed = await this.sessionManager.refreshSessionToken(refreshToken);

        const db = await getDB();
        const user = await db.get("SELECT * FROM users WHERE id = ?", [refreshed.userId]);
        if (!user) {
            throw new UnauthorizedError("User profile not found", { details: { userId: refreshed.userId } });
        }

        const userRoles = await this.roleRepo.findUserRoles(user.id);
        const roleNames = userRoles.map(r => r.name);
        const permissions = await this.permRepo.findUserEffectivePermissions(user.id);
        const permissionKeys = Array.from(new Set(permissions.map(p => p.key)));

        const correlationId = `corr_${crypto.randomUUID()}`;
        const accessToken = await this.tokenProvider.generateAccessToken({
            sub: user.id,
            workspaceId: user.workspace_id,
            email: user.email,
            roles: roleNames,
            permissions: permissionKeys.length > 0 ? permissionKeys : ["*"],
            sessionId: refreshed.sessionId,
            correlationId
        });

        return {
            accessToken,
            refreshToken: refreshed.newRefreshToken,
            expiresIn: 900,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                workspaceId: user.workspace_id,
                roles: roleNames
            }
        };
    }

    public async logout(sessionId: string): Promise<boolean> {
        return this.sessionManager.revokeSession(sessionId);
    }
}
