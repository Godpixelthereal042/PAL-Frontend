-- Migration 001 Rollback Script: PAL Identity, Authentication & Authorization System Schema

DROP INDEX IF EXISTS idx_audit_logs_correlation;
DROP INDEX IF EXISTS idx_audit_logs_actor;
DROP INDEX IF EXISTS idx_audit_logs_workspace;
DROP INDEX IF EXISTS idx_connectors_workspace;
DROP INDEX IF EXISTS idx_ai_agents_workspace;
DROP INDEX IF EXISTS idx_permissions_key;
DROP INDEX IF EXISTS idx_roles_workspace;
DROP INDEX IF EXISTS idx_sessions_refresh_token;
DROP INDEX IF EXISTS idx_sessions_user;
DROP INDEX IF EXISTS idx_users_workspace;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS workspace_plugins;
DROP TABLE IF EXISTS connectors;
DROP TABLE IF EXISTS service_accounts;
DROP TABLE IF EXISTS ai_permissions;
DROP TABLE IF EXISTS ai_agents;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS workspaces;
