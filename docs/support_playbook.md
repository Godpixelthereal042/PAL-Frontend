# PAL Customer Support & Success Playbook

## Support Channels & Service Level Agreements (SLAs)

| Ticket Priority | Response SLA | Target Customer | Channel |
|-----------------|--------------|-----------------|---------|
| **P0 — Critical** | **< 15 minutes** | Growth / Enterprise | Dedicated Slack / Phone |
| **P1 — High** | **< 1 hour** | Growth / Enterprise | In-App Chat / Email |
| **P2 — Normal** | **< 4 hours** | All Tiers | Support Ticket System |

---

## Common Customer Support Protocols

### Issue 1: OAuth Connector Sync Error
1. Direct customer to **Connectors → Re-authorize**.
2. Verify token expiration in `integrations` table.
3. If issue persists, check provider API status (e.g. status.stripe.com).

### Issue 2: AI Action Card Rejected or Erroneous
1. Inspect `approval_cards` table for action payload error.
2. Review `institutional_memories` to verify confidence score.
3. Update CEO Decision Profile risk tolerance via `CeoDecisionModelEngine`.
