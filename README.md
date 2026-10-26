# 💸 Payment Chaser

> **Automated Accounts Receivable & Intelligent Payment Reminder Platform**  
> Never let overdue invoices slip through the cracks. Empower freelancers, agencies, and businesses to chase unpaid invoices automatically, professionally, and stress-free.

---

## 🌟 Overview

Chasing unpaid invoices is uncomfortable, time-consuming, and frequently damages client relationships. **Payment Chaser** solves this by automating polite, tiered, and firm payment reminders across multiple communication channels (Email & WhatsApp), while providing a clean real-time financial tracking dashboard.

Whether you are a solo freelancer, creative studio, or growing agency, Payment Chaser keeps your cash flow healthy without requiring manual follow-ups.

---

## 🚀 Key Features

### 1. 📊 Financial Intelligence Dashboard
- **Real-Time KPIs**: Track *Total Outstanding*, *Overdue Amount*, *Paid Revenue*, and *Invoices Due Soon* at a glance.
- **Visual Breakdown**: Categorized metrics by status (`Draft`, `Pending`, `Paid`, `Overdue`, `Cancelled`).
- **Activity & Reminders Log**: View recent automated and manual payment chases with delivery timestamps.

### 2. 🧾 Robust Invoice Management
- **Full Invoice Lifecycle**: Create, edit, preview, duplicate, cancel, and mark invoices as paid.
- **Smart Calculations**: Real-time line-item subtotal, tax percentage, and discount calculation.
- **Customizable Dates**: Flexible issue dates, due dates, and automated overdue status detection.
- **Quick Search & Filters**: Search invoices by invoice number, client name, or filter by specific date ranges and statuses.

### 3. 👥 Client Relationship Hub (CRM)
- **Client Profiles**: Maintain client contacts, company details, billing addresses, and default currencies.
- **Preferred Delivery Channels**: Set reminder preferences per client (**Email**, **WhatsApp**, or **Both**).
- **Invoice Histories**: View all past, pending, and overdue invoices linked to any specific client.

### 4. ✉️ Multi-Tier Reminder Templates Engine
- **Pre-configured Escalation Tiers**:
  - 🟢 **Friendly Notice** (*3 days before due date*): Polite heads-up.
  - 🟡 **Due Date Reminder** (*On due date*): Professional reminder with invoice details.
  - 🟠 **Firm Follow-up** (*7 days overdue*): Direct notice highlighting overdue status.
  - 🔴 **Urgent Final Notice** (*14+ days overdue*): Urgent demand for immediate payment.
- **Custom Template Builder**: Create custom templates with dynamic placeholder variables:
  - `{{client_name}}`, `{{invoice_number}}`, `{{amount}}`, `{{due_date}}`, `{{payment_link}}`, `{{business_name}}`.

### 5. ⚙️ Workspace & Settings
- **Profile Synchronization**: Configure Display Name, Business Name, Timezone (e.g., `Asia/Dhaka`), and Default Currency (`USD`, `EUR`, `GBP`, `BDT`, etc.).
- **Real-Time UI Updates**: Seamless event-driven synchronization between Supabase Auth, PostgreSQL `profiles` table, and the active dashboard shell.

### 6. 🌓 Modern Aesthetics & Accessibility
- **Dual Themes**: Built-in support for Dark Mode (`#0F172A`) and Light Mode with instant toggle.
- **Glassmorphic Accents & Responsive Layout**: Tailored for both desktop and mobile workflows.
- **Zero-Setup Mock Mode**: Run the entire app locally without Supabase using an in-memory & localStorage mock adapter (`NEXT_PUBLIC_USE_MOCK=true`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [next-themes](https://github.com/pacocoursey/next-themes)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Supabase SSR Auth)
- **Form Management & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📈 Current Progress vs. Future Roadmap

### ✅ Completed (Phase 1 & Phase 2)
- [x] Next.js 16 project structure with clean App Router architecture.
- [x] Supabase Auth integration (Sign Up, Sign In, Password Reset, Auth Callback).
- [x] Multi-tenant database schema with strict PostgreSQL **Row Level Security (RLS)** ensuring users only access their own workspace data.
- [x] Complete Dashboard UI with financial statistics, search, and responsive sidebar navigation.
- [x] Invoice CRUD workflow with real-time tax/discount computation and status tracking.
- [x] Client CRM directory with channel preference toggles (`email`, `whatsapp`, `both`).
- [x] Reminder template management with variable replacement parser.
- [x] Workspace settings with real-time profile name synchronization across Topbar and Sidebar.
- [x] Dual-mode adapter (Full Supabase Live mode vs. Browser Mock mode).
- [x] Production build validation and deployment on Vercel.

---

### 🔮 Future Roadmap (Phase 3 & Beyond)

#### 🚀 Phase 3: Automated Dispatch Engine & Cron Jobs
- [ ] **Background Dispatch Workers**: Automated cron jobs (Vercel Cron / Supabase `pg_cron`) checking due/overdue invoices daily.
- [ ] **Transactional Email Delivery**: Integration with [Resend](https://resend.com/) or SendGrid for verified outbound reminder emails.
- [ ] **WhatsApp Business Cloud API**: Automated direct WhatsApp reminders via Twilio or Meta Cloud API.
- [ ] **Manual "Chase Now" Trigger**: One-click instant reminder dispatch from the Invoices table.

#### 💳 Phase 4: Direct Payment Gateways
- [ ] **Integrated Payment Links**: Generate instant payment links via Stripe, LemonSqueezy, or Paddle.
- [ ] **Webhook Auto-Settlement**: Automatically mark invoices as `paid` and halt scheduled reminders when payment webhooks arrive.

#### 🤖 Phase 5: AI-Assisted Smart Chaser
- [ ] **AI Tone Customizer**: Automatically rewrite reminder messages based on client payment history, relationship closeness, and urgency.
- [ ] **Optimal Send Time Prediction**: Intelligent scheduling to send messages at times clients are most likely to open and pay.

#### 🌐 Phase 6: Client Portal & PDF Generation
- [ ] **Public Invoice Link**: Clean, branded client portal where clients can view invoice items, download PDF receipts, and pay online.
- [ ] **Automated PDF Invoices**: Server-rendered PDF invoice generator.

---

## 💻 Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.18.0 or newer recommended)
- `npm` (or `yarn`, `pnpm`)
- A [Supabase](https://supabase.com/) account (free tier works great)

---

### 2. Clone the Repository
```bash
git clone https://github.com/altafur-fuad/Payment_Chaser.git
cd Payment_Chaser
```

---

### 3. Install Dependencies
```bash
npm install
```

---

### 4. Configure Environment Variables
Copy `.env.example` to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here

# Mode: Set to 'false' for live Supabase or 'true' for local mock demo
NEXT_PUBLIC_USE_MOCK=false

# Base application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Tip**: If you just want to quickly test the UI locally without configuring Supabase, simply set:
> ```env
> NEXT_PUBLIC_USE_MOCK=true
> ```

---

### 5. Setup Database Schema (Supabase)
If using live Supabase mode (`NEXT_PUBLIC_USE_MOCK=false`):
1. Go to your [Supabase Dashboard](https://app.supabase.com/) -> Select your project.
2. Navigate to the **SQL Editor**.
3. Copy the entire contents of [`supabase/migrations/20261026000000_phase2_schema_and_rls.sql`](supabase/migrations/20261026000000_phase2_schema_and_rls.sql).
4. Paste and click **Run**. This will create the required tables (`profiles`, `clients`, `invoices`, `invoice_items`, `reminder_templates`, `reminder_logs`) with full Row Level Security (RLS) policies.

---

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use the App

1. **Sign Up / Log In**:
   - Register a new account at `/signup` or log in at `/login`.
   - If using Supabase, check your email to confirm the address (or disable email confirmation in Supabase Auth settings during development).
2. **Setup Profile**:
   - Navigate to `/settings` and set your Business Name, Display Name, Timezone, and Default Currency.
3. **Add Clients**:
   - Go to `/clients` -> click **+ Add Client**.
   - Fill in contact details and specify whether you want to remind them via **Email**, **WhatsApp**, or **Both**.
4. **Create Invoices**:
   - Go to `/invoices` -> click **+ Create Invoice**.
   - Select your client, choose issue date and due date, and add your service/item lines.
   - Save invoice as **Draft** or **Pending**.
5. **Manage Reminder Templates**:
   - Go to `/templates` to customize the wording of friendly, firm, or urgent reminder messages.
6. **Track Cash Flow**:
   - Monitor overdue alerts and receivables directly from `/dashboard`.

---

## 🧪 Code Quality & Verification

Run linter checks:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

---

## 🚢 Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Publishable Key.
   - `NEXT_PUBLIC_USE_MOCK`: `false`
   - `NEXT_PUBLIC_APP_URL`: Your live Vercel domain (e.g. `https://your-app.vercel.app`).
4. Click **Deploy**.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
