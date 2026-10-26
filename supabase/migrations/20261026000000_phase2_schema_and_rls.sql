-- ============================================================
-- Payment Chaser — Phase 2: Complete PostgreSQL Schema & RLS
-- Migration: 20261026000000_phase2_schema_and_rls.sql
-- Description: Core tables, constraints, indexes, triggers, and Row Level Security
-- ============================================================

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Helper Functions
-- Function to automatically update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- ------------------------------------------------------------
-- 3. Profiles Table
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  business_name text,
  email text,
  timezone text not null default 'Asia/Dhaka',
  default_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Clients Table
-- ------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  whatsapp_number text,
  preferred_channel text not null default 'email'
    check (preferred_channel in ('email', 'whatsapp')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or whatsapp_number is not null)
);

-- Unique index per user and email (allowing nulls)
create unique index if not exists clients_user_email_unique_idx
  on public.clients (user_id, lower(email))
  where email is not null;

create index if not exists clients_user_idx
  on public.clients (user_id);

create trigger tr_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5. Reminder Templates Table
-- ------------------------------------------------------------
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  tone text not null check (tone in ('friendly', 'firm', 'urgent')),
  subject text not null,
  body text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists templates_user_idx
  on public.templates (user_id);

create trigger tr_templates_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 6. Invoices Table
-- ------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  template_id uuid references public.templates(id) on delete set null,
  invoice_number text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'USD',
  issue_date date not null,
  due_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue')),
  channels text[] not null default '{email}',
  reminders_enabled boolean not null default true,
  file_path text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date >= issue_date),
  unique (user_id, invoice_number)
);

create index if not exists invoices_user_status_due_idx
  on public.invoices (user_id, status, due_date);

create index if not exists invoices_client_idx
  on public.invoices (client_id);

create trigger tr_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 7. Reminders Table
-- ------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  channel text not null check (channel in ('email', 'whatsapp')),
  tone text not null check (tone in ('friendly', 'firm', 'urgent')),
  send_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'sent', 'delivered', 'failed', 'cancelled')),
  attempts int not null default 0,
  provider_message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (invoice_id, channel, send_at)
);

create index if not exists reminders_user_idx
  on public.reminders (user_id);

create index if not exists reminders_invoice_idx
  on public.reminders (invoice_id);

create index if not exists reminders_due_idx
  on public.reminders (send_at)
  where status = 'scheduled';

-- ------------------------------------------------------------
-- 8. Subscriptions Table
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  paddle_subscription_id text unique,
  paddle_customer_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'studio')),
  status text not null default 'active',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create trigger tr_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 9. Webhook Events Table (Idempotency)
-- ------------------------------------------------------------
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('paddle', 'resend', 'whatsapp')),
  event_id text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- ------------------------------------------------------------
-- 10. Auto-Profile Creation & Default Templates on Signup Trigger
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_display_name text;
begin
  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'displayName',
    split_part(new.email, '@', 1),
    'Freelancer'
  );

  -- Insert profile
  insert into public.profiles (id, display_name, email, timezone, default_currency)
  values (
    new.id,
    v_display_name,
    new.email,
    'Asia/Dhaka',
    'USD'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = case when public.profiles.display_name = '' then excluded.display_name else public.profiles.display_name end;

  -- Seed initial subscription (free tier)
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  -- Seed 3 default reminder templates
  insert into public.templates (user_id, name, tone, subject, body, is_default)
  values
    (
      new.id,
      'Friendly Reminder',
      'friendly',
      'Friendly reminder: Invoice {{invoice_number}} is due soon',
      'Hi {{client_name}},' || chr(10) || chr(10) ||
      'Just a quick friendly reminder that invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.' || chr(10) || chr(10) ||
      'Thank you for your business!' || chr(10) || chr(10) ||
      'Best regards,' || chr(10) ||
      '{{your_name}}',
      true
    ),
    (
      new.id,
      'Firm Follow-up',
      'firm',
      'Follow-up: Invoice {{invoice_number}} is due today',
      'Hi {{client_name}},' || chr(10) || chr(10) ||
      'This is a follow-up regarding invoice {{invoice_number}} for {{amount}}, which is due today ({{due_date}}).' || chr(10) || chr(10) ||
      'Please let me know once the payment has been initiated.' || chr(10) || chr(10) ||
      'Thank you,' || chr(10) ||
      '{{your_name}}',
      true
    ),
    (
      new.id,
      'Urgent Notice',
      'urgent',
      'URGENT: Invoice {{invoice_number}} is overdue',
      'Hi {{client_name}},' || chr(10) || chr(10) ||
      'Invoice {{invoice_number}} for {{amount}} is now overdue. Please process this payment immediately to keep your account in good standing.' || chr(10) || chr(10) ||
      'If you have already sent the payment, please disregard this notice.' || chr(10) || chr(10) ||
      'Sincerely,' || chr(10) ||
      '{{your_name}}',
      true
    )
  on conflict (user_id, name) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if present to be idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 11. Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.templates enable row level security;
alter table public.invoices enable row level security;
alter table public.reminders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security;

-- ------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ------------------------------------------------------------
-- CLIENTS POLICIES
-- ------------------------------------------------------------
create policy "clients_select_own"
  on public.clients for select
  using (user_id = auth.uid());

create policy "clients_insert_own"
  on public.clients for insert
  with check (user_id = auth.uid());

create policy "clients_update_own"
  on public.clients for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "clients_delete_own"
  on public.clients for delete
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- TEMPLATES POLICIES
-- ------------------------------------------------------------
create policy "templates_select_own"
  on public.templates for select
  using (user_id = auth.uid());

create policy "templates_insert_own"
  on public.templates for insert
  with check (user_id = auth.uid());

create policy "templates_update_own"
  on public.templates for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Prevent deleting default system templates
create policy "templates_delete_own"
  on public.templates for delete
  using (user_id = auth.uid() and is_default = false);

-- ------------------------------------------------------------
-- INVOICES POLICIES
-- Mandatory cross-table check: Client must belong to the same user
-- ------------------------------------------------------------
create policy "invoices_select_own"
  on public.invoices for select
  using (user_id = auth.uid());

create policy "invoices_insert_own"
  on public.invoices for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.user_id = auth.uid()
    )
  );

create policy "invoices_update_own"
  on public.invoices for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.user_id = auth.uid()
    )
  );

create policy "invoices_delete_own"
  on public.invoices for delete
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- REMINDERS POLICIES
-- Mandatory cross-table check: Invoice must belong to the same user
-- ------------------------------------------------------------
create policy "reminders_select_own"
  on public.reminders for select
  using (user_id = auth.uid());

create policy "reminders_insert_own"
  on public.reminders for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.user_id = auth.uid()
    )
  );

create policy "reminders_update_own"
  on public.reminders for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reminders_delete_own"
  on public.reminders for delete
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- SUBSCRIPTIONS POLICIES
-- Read-only for authenticated users; modifications via service role
-- ------------------------------------------------------------
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- WEBHOOK EVENTS POLICIES
-- No policies defined for anon/authenticated: completely isolated.
-- Only service role (bypassing RLS) can read/write webhook idempotency events.
-- ------------------------------------------------------------
