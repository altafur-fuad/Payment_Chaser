<!--
/**
 * @file docs/rules.md
 * @description Coding, Git, and security rules every contributor must follow
 * @phase 0
 * @author Payment Chaser Team
 * @created 2026-10-01
 */
-->

# Payment Chaser — Rules

| Field | Value |
|-------|-------|
| Status | Draft v1.0 |
| Last updated | 2026-10-01 |
| Applies to | Every contributor, human or AI |
| Related | [architecture.md](./architecture.md), [design.md](./design.md) |

> If a rule here conflicts with convenience, the rule wins. If a rule is wrong, change it in a PR — don't ignore it.

---

## 1. Rule Priority

| Level | Meaning | Examples |
|-------|---------|----------|
| **MUST** | Blocks merge if broken | No `any`, RLS on every table, no secrets in code |
| **SHOULD** | Needs a justification in the PR if broken | File size, naming preferences |
| **MAY** | Optional | Bangla comments, extra docs |

---

## 2. Coding Rules

### 2.1 The eight non-negotiables

| # | Rule | Level |
|---|------|-------|
| 1 | TypeScript strict. **No `any`.** Use `unknown` and narrow | MUST |
| 2 | Server Components by default. `'use client'` only when needed | MUST |
| 3 | Zod validation on all forms (client and server) | MUST |
| 4 | RLS on every table | MUST |
| 5 | Try/catch on every async call | MUST |
| 6 | Comments explain **why**, never **what** | MUST |
| 7 | Env vars via `process.env` only — never hardcoded | MUST |
| 8 | No `console.log` in committed code | MUST |

### 2.2 TypeScript

| Rule | Detail |
|------|--------|
| Strict mode | `strict: true`, `noUncheckedIndexedAccess: true` |
| No `any` | Use `unknown`, generics, or proper types. `as any` is banned |
| No non-null assertions | Avoid `!`; narrow with checks instead |
| Shared types | All shared interfaces live in `src/types/index.ts` |
| Type imports | Use `import type { ... }` for types |
| Enums | Use string unions (`type InvoiceStatus = 'pending' \| 'paid' \| 'overdue'`) |
| Return types | Explicit on exported functions and Server Actions |

```ts
// ❌ Bad
async function getInvoice(id: any): Promise<any> { ... }

// ✅ Good
async function getInvoice(id: string): Promise<Result<Invoice>> { ... }
```

### 2.3 Server vs Client Components

| Use a Server Component when | Use `'use client'` only when |
|-----------------------------|------------------------------|
| Fetching data | You need `useState`, `useEffect`, or `useRef` |
| Rendering static or data-driven UI | You need event handlers (onClick, onChange) on the element |
| Accessing secrets or the DB | You use browser APIs (localStorage, clipboard) |
| Composing layouts | You use a client-only library (e.g. react-hook-form) |

Push `'use client'` **down** to the smallest leaf component. Never mark a whole page as client to save one button.

### 2.4 Validation (Zod)

| Rule | Detail |
|------|--------|
| Schemas location | `src/lib/validation/*.ts`, one file per domain |
| Single source | The Zod schema is the source of truth; derive the TS type with `z.infer` |
| Double validation | Validate in the form **and** again inside the Server Action |
| Error shape | Return field errors as `Record<string, string[]>` |
| Trim and coerce | Trim strings, coerce numbers and dates at the schema |

```ts
export const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  dueDate: z.coerce.date(),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;
```

### 2.5 Error handling

| Rule | Detail |
|------|--------|
| Try/catch | Wrap every `await` that can fail (DB, network, storage, providers) |
| Typed results | Actions return `Result<T>`: `{ ok: true, data } \| { ok: false, error }` |
| No leaking | Never return stack traces, SQL errors, or provider messages to the UI |
| Narrow `catch` | `catch (error: unknown)` then narrow with `instanceof Error` |
| No silent catch | An empty `catch {}` is banned; map to a typed error |

```ts
export async function markPaid(id: string): Promise<Result<Invoice>> {
  try {
    const invoice = await repo.markPaid(id);
    return { ok: true, data: invoice };
  } catch (error: unknown) {
    return { ok: false, error: toAppError(error) };
  }
}
```

### 2.6 Comments

| Do | Don't |
|----|-------|
| Explain a non-obvious reason | Restate what the code does |
| Note a trade-off or constraint | Leave commented-out code |
| Link to an issue for a workaround | Leave TODOs without an owner or issue |
| Use Bangla when it helps the team | Mix languages in a single sentence |

```ts
// ❌ What
// loop through invoices
for (const invoice of invoices) { ... }

// ✅ Why
// Paddle can retry the same event, so we skip already-processed IDs.
if (await seen(eventId)) return;
```

### 2.7 Logging

`console.log` is banned. Use the shared logger (`src/lib/logger.ts`) which:

- Strips PII (emails, phone numbers) before output
- Is a no-op in tests
- Forwards errors to the monitoring tool

### 2.8 Environment variables

| Rule | Detail |
|------|--------|
| Access | Only `process.env.X`, read through `src/lib/config.ts` |
| Client exposure | Only `NEXT_PUBLIC_*` may reach the browser |
| Secrets | Service role key, Resend, WhatsApp, Paddle secrets are **server only** |
| Documentation | Every new var is added to `.env.example` with a description |
| Fail fast | `config.ts` validates required vars at startup |

### 2.9 Files, naming, structure

| Item | Convention | Example |
|------|-----------|---------|
| Components | `PascalCase.tsx` | `InvoiceTable.tsx` |
| Hooks | `useCamelCase.ts` | `useInvoiceFilters.ts` |
| Utilities | `kebab-case.ts` | `format-currency.ts` |
| Server Actions | `src/app/actions/<domain>.ts` | `invoices.ts` |
| Constants | `UPPER_SNAKE_CASE` | `DEFAULT_TIMEZONE` |
| Types / interfaces | `PascalCase` | `InvoiceInput` |
| Booleans | `is/has/can` prefix | `isOverdue` |
| DB columns | `snake_case` | `due_date` |
| Imports | Use `@/` alias, no deep relative chains | `@/lib/utils` |

| Size guideline | Limit |
|----------------|-------|
| File | ~300 lines (SHOULD) |
| Function | ~50 lines (SHOULD) |
| Component props | ≤ 7; group into an object beyond that |

### 2.10 File header

Every source file starts with:

```ts
/**
 * @file <path>
 * @description <one-line purpose>
 * @phase <phase number>
 * @author Payment Chaser Team
 * @created YYYY-MM-DD
 */
```

### 2.11 UI & accessibility

| Rule | Detail |
|------|--------|
| Components | Prefer Shadcn UI primitives before building custom ones |
| Styling | Tailwind classes and design tokens only; no inline styles or hardcoded hex |
| Class merging | Use `cn()` from `src/lib/utils.ts` |
| Forms | Visible labels, `aria-describedby` for errors |
| Focus | Visible focus ring on every interactive element |
| Contrast | WCAG AA minimum |
| States | Every data view has loading, empty, and error states |
| Responsive | Works from 360 px up |

### 2.12 Data access and mocks

| Rule | Detail |
|------|--------|
| Single gateway | Components call Server Actions; they never import `mock/*` directly |
| Signature parity | Mock functions match Server Action signatures exactly |
| Flag | `USE_MOCK` in `src/lib/config.ts` decides the source |
| Delay | Mock functions wait 500 ms to expose loading states |
| Writes | Stubs for write operations throw `"Not implemented yet"` until implemented |

### 2.13 Regional defaults

| Setting | Value |
|---------|-------|
| Currency | USD default |
| Timezone | Asia/Dhaka default; always store UTC, convert at the edge |
| Payments | Paddle only — **never Stripe** |
| Dates | Store ISO 8601; display in the user's timezone |
| Money | Store `numeric(12,2)`; never use floats for arithmetic |

---

## 3. Git Rules

### 3.1 Branching

| Branch | Purpose |
|--------|---------|
| `main` | Production; always deployable; protected |
| `develop` | Optional integration branch |
| `feat/<scope>-<short-desc>` | New features |
| `fix/<scope>-<short-desc>` | Bug fixes |
| `docs/<short-desc>` | Documentation |
| `chore/<short-desc>` | Tooling, deps, config |
| `refactor/<short-desc>` | Non-behavioral changes |

Examples: `feat/invoices-create-form`, `fix/cron-duplicate-send`.

### 3.2 Commit messages (Conventional Commits)

Format: `<type>(<scope>): <summary>`

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that neither fixes nor adds |
| `test` | Tests |
| `chore` | Build, deps, tooling |
| `ci` | CI configuration |

| Rule | Detail |
|------|--------|
| Summary | Imperative, lowercase, ≤ 72 chars, no trailing period |
| Body | Explain **why**, wrap at 100 chars |
| Breaking | Add `!` after the type and a `BREAKING CHANGE:` footer |
| Issues | Reference with `Closes #123` |

```
feat(invoices): add status filter to invoice list

Freelancers need to see overdue invoices first without scrolling.

Closes #42
```

### 3.3 Pull requests

| Rule | Detail |
|------|--------|
| Size | Small and focused; one concern per PR (SHOULD be < 400 changed lines) |
| Template | Fill the PR template: What changed, Screenshots, Checklist |
| Reviews | At least 1 approval |
| CI | Lint and build must pass |
| Merge | Squash merge into `main` |
| Branch cleanup | Delete the branch after merge |
| Docs | Update docs in the same PR as the behavior change |

### 3.4 Never commit

| Item | Why |
|------|-----|
| `.env`, `.env.local` | Secrets |
| `node_modules`, `.next`, `.vercel` | Generated |
| `*.log`, `coverage`, `.DS_Store` | Noise |
| Real client data or production exports | Privacy |
| Large binaries | Repo bloat |

---

## 4. Security Rules

### 4.1 Secrets and keys

| Rule | Detail |
|------|--------|
| No secrets in code | Not in source, tests, docs, or screenshots |
| Service role key | Cron and webhook handlers only; never imported by a Client Component |
| Rotation | Rotate any key that was ever committed, immediately |
| Scoping | Use least-privilege keys per environment |
| Scanning | Secret scanning enabled in GitHub |

### 4.2 Database

| Rule | Detail |
|------|--------|
| RLS | Enabled on every table with at least one policy |
| Policy tests | New tables ship with RLS tests |
| Ownership | Every user-owned table has `user_id` and `user_id = auth.uid()` policies |
| Cross-table checks | When a row references another user-owned row, the policy verifies ownership of both |
| Migrations | Only through versioned SQL migrations; no manual prod edits |

### 4.3 Authentication and sessions

| Rule | Detail |
|------|--------|
| Server check | Every Server Action calls `getUser()` first and rejects unauthenticated calls |
| No trust | Never trust `user_id` sent from the client; derive from the session |
| Cookies | HttpOnly, Secure, SameSite=Lax |

### 4.4 Inputs and files

| Rule | Detail |
|------|--------|
| Validation | Zod on every input, including route params and query strings |
| Output | React escapes by default; never use `dangerouslySetInnerHTML` with user content |
| Templates | Variable substitution uses an allow-list of tokens |
| Uploads | Max 10 MB; allow PDF, PNG, JPG only; verify MIME on the server |
| Storage | Private bucket; per-user folder policy |

### 4.5 Webhooks and cron

| Rule | Detail |
|------|--------|
| Signatures | Verify Paddle, Resend, and WhatsApp signatures before parsing the body |
| Replay | Reject stale timestamps; store event IDs for idempotency |
| Cron | Require `Authorization: Bearer ${CRON_SECRET}` |
| Responses | Return 200 quickly; never echo internal errors |

### 4.6 Messaging and privacy

| Rule | Detail |
|------|--------|
| Opt-out | Every reminder honors client opt-out |
| WhatsApp | Use only approved templates; respect Meta policy |
| PII in logs | Never log emails, phone numbers, or message bodies |
| Data minimization | Store only what reminders require |
| Deletion | Deleting a user removes their data via cascade |

### 4.7 Dependencies

| Rule | Detail |
|------|--------|
| Additions | Justify any new dependency in the PR |
| Updates | Review Dependabot PRs weekly |
| Audit | `npm audit` clean for high/critical before release |
| Lockfile | Always commit the lockfile |

---

## 5. Testing & Quality

| Area | Expectation |
|------|-------------|
| Lint | `npm run lint` passes with zero warnings |
| Types | `tsc --noEmit` passes |
| Build | `npm run build` passes |
| RLS | Policy tests for every table |
| Critical paths | Tests for reminder scheduling, status transitions, webhook verification |
| Manual | Check loading, empty, and error states in the UI before opening a PR |

## 6. Definition of Done

A task is done only when **all** are true:

- [ ] Code follows every MUST rule above
- [ ] No `any`, no `console.log`, no hardcoded env values
- [ ] Zod validation present on new inputs
- [ ] Async calls wrapped in try/catch with typed results
- [ ] RLS added or verified for new tables
- [ ] Loading, empty, and error states handled
- [ ] File headers present
- [ ] Docs updated
- [ ] Lint, types, and build pass
- [ ] PR template completed

## 7. Working With AI Assistants

| Rule | Detail |
|------|--------|
| Same rules | AI-generated code follows every rule here |
| One file at a time | Scaffold generation happens one file per step with explicit confirmation |
| Review | A human reviews every generated file before merge |
| No invention | Do not accept invented APIs, packages, or env vars; verify against docs |

## 8. Exceptions

An exception to a MUST rule requires:

1. A written reason in the PR description
2. An inline comment at the exception site explaining why
3. Approval from a maintainer
4. An entry in [memory.md](./memory.md)
