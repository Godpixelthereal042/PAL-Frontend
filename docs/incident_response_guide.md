# PAL Incident Response & Security Guide

## Incident Response Roles & Triage Protocol

```
Incident Lead: CTO / Lead Systems Engineer
Communications Lead: CEO / Customer Success Manager
Database Admin: Infrastructure Engineer
```

---

## Severity Definitions & Action Matrix

### P0 — CRITICAL (Immediate System Lockdown)
- **Triggers:** Potential cross-tenant data access, database breach attempt, Stripe payment webhook failure.
- **Action Plan:**
  1. Revoke active session tokens: `DELETE FROM sessions WHERE created_at < ?`
  2. Isolate workspace network traffic.
  3. Notify affected workspace owners within 1 hour.
  4. Perform forensic audit using `compliance_audit_logs`.

### P1 — HIGH (Degraded Operation)
- **Triggers:** Gemini API outage (falling back to offline reasoning), connector sync failure rate > 10%.
- **Action Plan:**
  1. Verify fallback offline response generator is active in `app/api/chat/route.ts`.
  2. Queue background retries for failed connector syncs.
  3. Inform customers via status page.
