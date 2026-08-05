# 📐 PAL-ARCH-DOC-027: OAuth 2.0 & Enterprise Secret Vault Architecture

**Governing Specification**: PAL-TDD-004 Part 2 (Sprint 5 Milestone 2)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `SecretVault`, `TokenRotationEngine`, `OAuthVault`, `ConnectorMetadata`

---

## 1. Subsystem Overview

The **Enterprise Credential Platform** provides secure, multi-tenant credential management for PAL's integration engine. It enforces Zero-Trust isolation, AES-256-GCM secret encryption, PKCE authentication, Refresh Token Rotation (RTR), secret versioning, master key rotation, audit history, and secret redaction.

```text
Connector Runtime
     │
     ▼
OAuthVault & TokenRotationEngine (PKCE & Refresh Token Rotation)
     │
     ▼
SecretVault (AES-256-GCM, Per-Workspace Keys, Secret Versioning & Audit)
     │
     ▼
Zero-Trust Encrypted Storage (SQLite / HSM Key Management)
```

---

## 2. Standardized Connector Metadata (`ConnectorMetadata`)

Every connector registers standardized metadata describing capabilities, authorization modes, and environmental flags:

```typescript
export interface ConnectorMetadata {
    connectorId: string;
    provider: string;
    version: string;
    capabilities: string[];
    requiredScopes: string[];
    supportedAuthMethods: ("oauth2" | "api_key" | "webhook_secret")[];
    supportsSandbox: boolean;
    supportsWebhooks: boolean;
    supportsStreaming: boolean;
    supportsToolDiscovery: boolean;
    supportsRefresh: boolean;
}
```

---

## 3. Cryptographic Security Standards

1. **Symmetric Encryption**: AES-256-GCM with 96-bit IV and 128-bit authentication tag.
2. **Master Key Rotation**: Re-encrypts workspace data keys without invalidating secret metadata.
3. **Workspace Isolation**: Derived per-workspace data keys prevent cross-tenant credential leakage.
4. **Secret Redaction**: Automated masking transforms sensitive keys to `[REDACTED_SECRET]` in audit entries and log streams.
