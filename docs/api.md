<!--
/**
 * @file docs/api.md
 * @description Complete API contract: Server Actions, route handlers, and webhooks
 * @phase 0
 * @author Payment Chaser Team
 * @created 2026-10-01
 */
-->

# Payment Chaser — API Contract

| Field | Value |
|-------|-------|
| Status | Draft v1.0 |
| Last updated | 2026-10-01 |
| Related | [architecture.md](./architecture.md), [rules.md](./rules.md) |

> **This file is the contract between frontend and backend.**
> Frontend builds against these signatures using mocks.
> Backend implements them with real Supabase calls.
> Never change a signature without updating this file and the frontend.

---

## 1. Overview

| Surface | Location | Auth |
|---------|----------|------|
| Server Actions | `src/app/actions/*.ts` | Supabase session (RLS) |
| Route Handlers | `src/app/api/*/route.ts` | Signature / `CRON_SECRET` |
| Realtime | Supabase channels (post-MVP) | Supabase session |

**All Server Actions return `Result<T>`** — never throw to the caller.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }