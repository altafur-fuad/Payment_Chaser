<!--
/**
 * @file docs/frontend-brief.md
 * @description Complete brief for the frontend partner building Payment Chaser
 * @phase 0
 * @author Payment Chaser Team
 * @created 2026-10-01
 */
-->

# Payment Chaser — Frontend Brief

> Read this once fully. Then use it as a reference while building.
> Ask questions any time — it's better than building the wrong thing.

---

## 1. What We're Building

**Payment Chaser** is a SaaS that helps freelancers get paid on time.

The freelancer uploads an invoice, sets a deadline, and the system sends polite reminders (email + WhatsApp) to the client automatically. When the client pays, the freelancer marks it as paid and reminders stop.

**Users:** Freelancers in Bangladesh + globally. They work solo, invoice in USD, and often deal with clients who ignore email but respond on WhatsApp.

**Your job:** Build the entire frontend. Every page, every component, every interaction. Make it responsive. Add dark mode. Test with mock data.

**Our job:** Backend, database, payments, cron, deployment.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI Library | Shadcn UI |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Charts | Recharts |
| Theme | next-themes (dark mode) |
| Animation | framer-motion (light only) |
| Dates | date-fns |

**Setup:**

```bash
npx shadcn@latest init
npx shadcn@latest add button card input label form table badge dialog dropdown-menu tabs toast avatar checkbox radio-group switch select popover calendar tooltip skeleton alert-dialog separator sheet
npm install react-hook-form zod @hookform/resolvers next-themes lucide-react recharts framer-motion date-fns


3. Design System
Full details in docs/design.md. Key points:

Colors (Tailwind tokens)
Token	Hex	Use
primary	#2563EB	Buttons, links, active nav
success	#10B981	Paid status
warning	#F59E0B	Pending
danger	#EF4444	Overdue, delete
background	#F9FAFB	Page background
surface	#FFFFFF	Cards
Typography
Font: Inter (via next/font)

H1: text-5xl font-bold

H2: text-4xl font-semibold

H3: text-2xl font-semibold

Body: text-base

Small: text-sm text-muted

Spacing
Card padding p-6, section gap gap-6, page padding p-8.

Radius
Buttons rounded-lg, cards rounded-xl, inputs rounded-md.

4. The 12 Pages
Build these in this order. Each one should be fully working before moving to the next.

Page 1 — Landing (/)
Purpose: Convince freelancers to sign up.

Sections:

Hero — Headline: "Get paid on time. Every time." Sub-headline about automated reminders. Two CTAs: "Start Free" (primary) and "See How It Works" (secondary). Dashboard screenshot mockup on the right.

Problem — 3 cards: awkward follow-ups, late payments, manual work.

How It Works — 3 steps: Upload → Schedule → Get Paid.

Features — 6 cards: Email Reminders, WhatsApp Reminders, Templates, Payment Tracking, Client Portal, Dashboard.

Pricing Preview — Link to /pricing.

CTA — "Ready to get paid faster?" + button.

Footer — Logo, links, social, copyright.

Mobile: Stacked, sticky CTA at bottom.

Page 2 — Pricing (/pricing)
3 plan cards: Free ($0), Pro ($9/mo), Studio ($19/mo)

"Most Popular" badge on Pro

Feature comparison table

FAQ accordion

CTA at bottom

Page 3 — Sign Up (/signup)
Centered card, max-width 400px

Fields: Name, Email, Password, Confirm Password

Password strength indicator

Terms checkbox

"Create Account" button (full width)

Below: "Already have an account? Log in"

States: Loading (spinner in button), error (field-level), success (redirect).

Page 4 — Log In (/login)
Same layout as signup

Fields: Email, Password (with show/hide)

"Forgot password?" link

"Log In" button

Below: "Don't have an account? Sign up"

Page 5 — Dashboard (/dashboard)
Layout: Sidebar (left) + Topbar + Main content.

Sidebar:

Logo at top

Nav items: Dashboard, Invoices, Clients, Templates, Settings

Active item: bg-primary text-white

User card at bottom: avatar + name + email

Topbar:

Left: Page title

Right: Search icon, notification bell (with badge), dark mode toggle, user dropdown

Main Content:

Row 1 — 4 stat cards:

Total Outstanding ($12,450) — red accent

Overdue ($3,200) — red accent

Paid This Month ($8,200) — green accent

Reminders Sent This Week (12) — blue accent

Each: icon, label, big number, trend indicator

Row 2 — Needs Attention:

Table of top 5 overdue invoices

Columns: Client, Amount, Days Overdue, Action

"Remind Now" button per row

Row 3 — Upcoming:

Invoices due in next 7 days

Card list on mobile, table on desktop

Empty State: If no invoices, show illustration + "Add your first invoice" CTA.

Page 6 — Invoices List (/invoices)
Page header: "Invoices" + "New Invoice" button (right, primary)

Filter tabs: All (5) | Pending (2) | Paid (2) | Overdue (1)

Search bar

Table columns: Checkbox, Invoice #, Client, Amount, Due Date, Status, Actions

Row hover

Bulk action bar when checkboxes selected

Pagination (10 per page)

Mobile: Card list instead of table. Each card: status badge + amount + client.

Empty State: "No invoices yet" with illustration.

Page 7 — New Invoice (/invoices/new)
Single-page form.

Fields:

Client (dropdown + "Add new client" option)

Invoice Number (auto-generated but editable)

Amount (number) + Currency (dropdown, USD default)

Issue Date (date picker)

Due Date (date picker)

File Upload (drag & drop, PDF/JPG/PNG, max 10MB)

Template selector (Friendly/Firm/Urgent)

Channels (checkboxes: Email, WhatsApp)

Reminders Enabled (toggle)

Notes (textarea, optional)

Right Side (sticky on desktop):

"Reminder schedule preview" — shows exactly when each reminder will send

Sticky Footer:

Cancel + Create Invoice

Validation: Zod. Show field-level errors without losing input.

Page 8 — Invoice Detail (/invoices/[id])
Header:

Invoice number (large)

Status badge

Actions dropdown: Edit, Duplicate, Delete, Download

Left Column (2/3):

Client info card

Invoice details (amount, dates, currency, template, channels)

File preview (PDF embed or image)

Notes

Right Column (1/3):

Payment status card

If pending/overdue: "Mark as Paid" button

If paid: paid date + checkmark

Reminder Timeline (vertical)

Each entry: channel icon, tone badge, timestamp, status

"Send Reminder Now" button

Quick Stats: reminders sent, days overdue

Page 9 — Clients (/clients)
Page header: "Clients" + "Add Client" button

Search bar

Grid/List toggle

Each card: avatar (initials), name, email, phone, invoice count, outstanding amount

Actions: View, Edit, Delete

Add Client Dialog:

Name, Email, WhatsApp number, Preferred channel

Save / Cancel

Empty State: "Add your first client"

Page 10 — Templates (/templates)
Page header: "Templates" + "New Template" button

3 default templates shown: Friendly, Firm, Urgent

Each card: name, tone badge, preview text, actions (Edit, Duplicate, Delete)

Defaults cannot be deleted, only duplicated

Edit Template:

Name input

Tone radio group (Friendly/Firm/Urgent)

Subject input

Body textarea with variable chips: {{client_name}}, {{amount}}, {{due_date}}, {{invoice_number}}, {{days_overdue}}, {{sender_name}}

Clicking a chip inserts it at cursor

Live preview panel on the right with sample data

Save / Cancel

Page 11 — Settings (/settings)
Tab layout:

Profile: Display name, Business name

Preferences: Timezone (default Asia/Dhaka), Default currency (USD)

Channels: Email sender name, WhatsApp connection status

Danger Zone: Delete account

Separate route /settings/billing:

Current plan card

Usage vs quota (progress bars)

Upgrade button (opens Paddle checkout)

Cancel subscription

Invoice history (links to Paddle)

Page 12 — Client Portal (/portal/[clientId])
Public route — no auth.

When a client receives a reminder email, they click a link and land here.

Freelancer's branding (logo, business name)

"Invoice from [Business Name]"

Invoice number

Amount (large, mono font)

Due date + days remaining/overdue

File preview

Large "Pay Now" button

"Download Invoice" secondary

Footer: "Questions? Contact [email]"

Security: URL contains clientId + token. Token invalid → 404 page.

5. Components to Build
Shadcn (install)
button, card, input, label, form, table, badge, dialog, dropdown-menu, tabs, toast, avatar, checkbox, radio-group, switch, select, popover, calendar, tooltip, skeleton, alert-dialog, separator, sheet

Custom
Component	Purpose
StatCard	Dashboard stat with icon, number, trend
StatusBadge	Invoice status (icon + label + color)
ToneBadge	Reminder tone
ChannelIcons	Email / WhatsApp indicators
CurrencyText	Mono, tabular amount
InvoiceTable	Sortable list (card list on mobile)
InvoiceForm	Create/edit form
ClientForm	Create/edit client
TemplateEditor	Body editor with variables + preview
ReminderTimeline	Vertical timeline of reminders
EmptyState	Illustration + message + CTA
PageHeader	Title + description + action
ConfirmDialog	Destructive confirmations
FileUpload	Drag & drop upload
LoadingSkeleton	Loading UI
6. Data Handling — Mock First
Backend isn't ready yet. Build everything with mock data.

The Contract
All types live in src/types/index.ts. Import from @/types.

All Server Actions live in src/app/actions/*.ts. Import from there, not from src/lib/mock/*.

Mock functions have identical signatures to the real Server Actions.

USE_MOCK flag in src/lib/config.ts decides which data source is used.

Mock functions delay 500ms to expose loading states.

How to use
ts
import { getInvoices } from '@/app/actions/invoices'

const result = await getInvoices({ status: 'overdue' })
if (result.ok) {
  // result.data.items, result.data.counts
} else {
  // result.error, result.fieldErrors
}
Every Server Action returns Result<T>:

ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
Switching to real backend later
When backend is ready, we flip USE_MOCK to false. No component changes.

7. Responsive Behavior
Breakpoint	Layout
< 640px	Single column, bottom nav (Dashboard, Invoices, Clients, More), card lists instead of tables
640–1024px	Sidebar collapsed to icons, stat cards 2 columns
> 1024px	Full sidebar, stat cards 4 columns, full tables
Mobile-first approach. Test at 360px, 768px, 1280px.

8. Dark Mode
Use next-themes

Toggle in topbar

Save to localStorage

Default to system preference

Every component needs dark: variants

Test every page in dark mode before opening PR

9. Accessibility
Non-negotiable:

Every interactive element keyboard-accessible

Visible focus ring (focus-visible:ring-2 ring-primary)

ARIA labels on icons

Form errors linked with aria-describedby

Color contrast AA minimum

Status never indicated by color alone (icon + label + color)

Touch targets minimum 44×44px on mobile

10. States to Handle
Every data-driven view needs:

State	Pattern
Loading	Skeleton matching final layout
Empty	EmptyState component with CTA
Error	Inline alert + retry button
Success	Toast confirmation for mutations
11. Reference Sites
Study these for design quality:

linear.app — clean dashboard, minimal

dashboard.stripe.com — trustworthy data display

resend.com/dashboard — modern SaaS UI

framer.com/pricing — pricing page structure

Don't copy pixel-for-pixel. Take the principles.

12. Rules
Server Components by default. 'use client' only when you need state, effects, or event handlers.

No any types. Use proper types from @/types.

Zod on every form. Client and server.

Use next/image and next/link. Never <img> or <a>.

Tailwind classes only. No inline styles, no hardcoded hex.

Use cn() from @/lib/utils to merge classes.

No console.log. Use the logger utility when needed.

Small components. If a file exceeds ~300 lines, split it.

File header on every file (see docs/rules.md).

No backend logic. Call Server Actions, don't write queries.

13. Git Workflow
Branch names: feat/invoices-list, fix/mobile-nav, docs/readme

Commits: Conventional Commits (feat:, fix:, docs:)

PRs: small, one concern each, screenshots for UI changes

Never push to main directly

One approval required

Full rules in docs/rules.md.

14. Timeline
Week	Focus
1	Setup, design tokens, base components, app shell
2	Auth pages (login, signup) + landing + pricing
3	Dashboard home, stat cards, sidebar, topbar
4	Invoices (list, new, detail)
5	Clients, Templates, Settings, Billing
6	Client Portal, responsive fixes, dark mode, polish
Demo at the end of every week. No exceptions.

15. Definition of Done
Before opening a PR:

□ Page works on mobile, tablet, desktop
□ Dark mode looks correct
□ Loading state visible (uses skeleton)
□ Empty state visible when no data
□ Error state visible when mock throws
□ Zod validation on all forms
□ npm run build passes
□ No any, no console.log
□ File header present
□ Screenshots attached to PR
16. When You're Stuck
Check docs/design.md for design decisions.

Check docs/api.md for Server Action signatures.

Check src/types/index.ts for data shapes.

Message me immediately if blocked for more than 2 hours.

Don't invent APIs. Don't guess types. Ask.

17. First Steps
Read this entire brief.

Read docs/design.md and docs/rules.md.

Set up the project locally and confirm npm run dev works.

Build the app shell (sidebar + topbar + empty dashboard page) as a proof-of-concept.

Show me a screenshot before moving to real pages.

Let's build.