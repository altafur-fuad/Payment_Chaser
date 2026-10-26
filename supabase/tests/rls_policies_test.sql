-- ============================================================
-- Payment Chaser — Row Level Security (RLS) Test Suite
-- File: supabase/tests/rls_policies_test.sql
-- Description: Automated verification of RLS policies, multi-tenant isolation,
--              anonymous blocking, and cross-user attack vectors.
--
-- How to run:
-- 1. In Supabase Dashboard -> SQL Editor, paste this file and click "Run".
--    The script executes in an isolated transaction and automatically rolls back.
-- 2. Check the "Messages" or "Results" tab for the test outcomes.
-- ============================================================

begin;

do $$
declare
  v_user1_id uuid := '11111111-1111-1111-1111-111111111111';
  v_user2_id uuid := '22222222-2222-2222-2222-222222222222';
  v_client1_id uuid;
  v_template1_id uuid;
  v_default_template_id uuid;
  v_invoice1_id uuid;
  v_reminder1_id uuid;
  v_count int;
  v_caught_error boolean;
begin
  raise notice '============================================================';
  raise notice '>>> Starting Payment Chaser RLS Security Verification Suite...';
  raise notice '============================================================';

  -- ------------------------------------------------------------
  -- Setup: Create Test Users in auth.users and public.profiles
  -- ------------------------------------------------------------
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);

  -- Ensure auth schema exists (standard on Supabase)
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    begin
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      values
        ('00000000-0000-0000-0000-000000000000', v_user1_id, 'authenticated', 'authenticated', 'user1_test@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"User One"}', now(), now()),
        ('00000000-0000-0000-0000-000000000000', v_user2_id, 'authenticated', 'authenticated', 'user2_test@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"User Two"}', now(), now())
      on conflict (id) do nothing;
    exception when others then
      insert into auth.users (id, email)
      values
        (v_user1_id, 'user1_test@example.com'),
        (v_user2_id, 'user2_test@example.com')
      on conflict (id) do nothing;
    end;
  end if;

  -- Ensure profiles exist for both users
  insert into public.profiles (id, display_name, email, timezone, default_currency)
  values
    (v_user1_id, 'User One', 'user1_test@example.com', 'Asia/Dhaka', 'USD'),
    (v_user2_id, 'User Two', 'user2_test@example.com', 'Asia/Dhaka', 'USD')
  on conflict (id) do update set
    display_name = excluded.display_name,
    email = excluded.email;

  -- ------------------------------------------------------------
  -- TEST 1: Anonymous Access Restrictions
  -- ------------------------------------------------------------
  raise notice 'Running Test 1: Anonymous access restrictions...';
  execute 'reset role';
  execute 'set local role anon';
  perform set_config('request.jwt.claims', '{"role": "anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);

  -- Profiles should be inaccessible or return 0 rows to anonymous users
  v_count := -1;
  begin
    select count(*) into v_count from public.profiles;
  exception when others then
    v_count := 0; -- Permission denied via REVOKE ALL is expected
  end;
  if v_count <> 0 then
    raise exception 'FAILED Test 1: Anonymous user was able to read profiles (count: %)', v_count;
  end if;

  -- Clients should be inaccessible or return 0 rows to anonymous users
  v_count := -1;
  begin
    select count(*) into v_count from public.clients;
  exception when others then
    v_count := 0;
  end;
  if v_count <> 0 then
    raise exception 'FAILED Test 1: Anonymous user was able to read clients (count: %)', v_count;
  end if;

  -- Invoices should be inaccessible or return 0 rows to anonymous users
  v_count := -1;
  begin
    select count(*) into v_count from public.invoices;
  exception when others then
    v_count := 0;
  end;
  if v_count <> 0 then
    raise exception 'FAILED Test 1: Anonymous user was able to read invoices (count: %)', v_count;
  end if;

  -- Anonymous insert must be blocked
  v_caught_error := false;
  begin
    insert into public.clients (user_id, name, email, preferred_channel)
    values (v_user1_id, 'Hacked Client', 'hack@test.com', 'email');
  exception when others then
    v_caught_error := true;
  end;
  if not v_caught_error then
    raise exception 'FAILED Test 1: Anonymous insert into clients was not rejected!';
  end if;
  raise notice '  -> PASS Test 1: Anonymous users completely blocked from viewing or mutating data.';

  -- ------------------------------------------------------------
  -- TEST 2: User A Authenticated Operations
  -- ------------------------------------------------------------
  raise notice 'Running Test 2: User A authorized creation...';
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', v_user1_id::text, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user1_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  -- Insert Client for User A
  insert into public.clients (user_id, name, email, whatsapp_number, preferred_channel)
  values (v_user1_id, 'Acme Corp', 'billing@acme.com', '+8801700000001', 'both')
  returning id into v_client1_id;

  -- Insert Custom Template for User A
  insert into public.templates (user_id, name, tone, subject, body, is_default)
  values (v_user1_id, 'Custom Late Fee Notice', 'firm', 'Invoice Overdue', 'Please pay immediately.', false)
  returning id into v_template1_id;

  -- Insert Default Template for User A (simulating signup trigger)
  insert into public.templates (user_id, name, tone, subject, body, is_default)
  values (v_user1_id, 'Friendly Reminder System', 'friendly', 'Friendly Notice', 'Friendly reminder.', true)
  returning id into v_default_template_id;

  -- Insert Invoice for User A referencing User A client and template
  insert into public.invoices (user_id, client_id, template_id, invoice_number, amount, currency, issue_date, due_date, status)
  values (v_user1_id, v_client1_id, v_template1_id, 'INV-USER1-001', 1500.00, 'USD', '2026-10-01', '2026-10-15', 'pending')
  returning id into v_invoice1_id;

  -- Insert Reminder for User A referencing User A invoice
  insert into public.reminders (user_id, invoice_id, channel, tone, send_at, status)
  values (v_user1_id, v_invoice1_id, 'email', 'friendly', '2026-10-10 10:00:00+00', 'scheduled')
  returning id into v_reminder1_id;

  raise notice '  -> PASS Test 2: User A successfully created owned client, template, invoice, and reminder.';

  -- ------------------------------------------------------------
  -- TEST 3: User B Cross-User Read Isolation
  -- ------------------------------------------------------------
  raise notice 'Running Test 3: User B cross-user read isolation...';
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', v_user2_id::text, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user2_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  -- User B should NOT see User A's client
  select count(*) into v_count from public.clients where id = v_client1_id;
  if v_count <> 0 then
    raise exception 'FAILED Test 3: User B could see User A client (count: %)', v_count;
  end if;

  -- User B should NOT see User A's invoice
  select count(*) into v_count from public.invoices where id = v_invoice1_id;
  if v_count <> 0 then
    raise exception 'FAILED Test 3: User B could see User A invoice (count: %)', v_count;
  end if;

  -- User B should NOT see User A's custom template
  select count(*) into v_count from public.templates where id = v_template1_id;
  if v_count <> 0 then
    raise exception 'FAILED Test 3: User B could see User A template (count: %)', v_count;
  end if;

  -- User B should NOT see User A's reminder
  select count(*) into v_count from public.reminders where id = v_reminder1_id;
  if v_count <> 0 then
    raise exception 'FAILED Test 3: User B could see User A reminder (count: %)', v_count;
  end if;
  raise notice '  -> PASS Test 3: User B cannot view any records owned by User A.';

  -- ------------------------------------------------------------
  -- TEST 4: Cross-User Mutation & Hijacking Attack Vectors
  -- ------------------------------------------------------------
  raise notice 'Running Test 4: Cross-user mutation attack vectors...';

  -- Attack 4A: User B attempts to create an invoice referencing User A's client
  v_caught_error := false;
  begin
    insert into public.invoices (user_id, client_id, invoice_number, amount, issue_date, due_date)
    values (v_user2_id, v_client1_id, 'INV-ATTACK-01', 999.00, '2026-10-01', '2026-10-15');
  exception when others then
    v_caught_error := true;
  end;
  if not v_caught_error then
    raise exception 'FAILED Test 4A: RLS failed to prevent User B from referencing User A client!';
  end if;
  raise notice '  -> PASS Test 4A: User B cannot create invoice referencing User A client.';

  -- Attack 4B: User B attempts to create an invoice referencing User A's custom template
  v_caught_error := false;
  begin
    -- First User B creates their own valid client
    declare
      v_client2_id uuid;
    begin
      insert into public.clients (user_id, name, email, preferred_channel)
      values (v_user2_id, 'User B Client', 'client_b@test.com', 'email')
      returning id into v_client2_id;

      -- Attempt to attach User A's template
      insert into public.invoices (user_id, client_id, template_id, invoice_number, amount, issue_date, due_date)
      values (v_user2_id, v_client2_id, v_template1_id, 'INV-ATTACK-02', 500.00, '2026-10-01', '2026-10-15');
    end;
  exception when others then
    v_caught_error := true;
  end;
  if not v_caught_error then
    raise exception 'FAILED Test 4B: RLS failed to prevent User B from referencing User A template!';
  end if;
  raise notice '  -> PASS Test 4B: User B cannot create invoice referencing User A template.';

  -- Attack 4C: User B attempts to create a reminder referencing User A's invoice
  v_caught_error := false;
  begin
    insert into public.reminders (user_id, invoice_id, channel, tone, send_at, status)
    values (v_user2_id, v_invoice1_id, 'email', 'firm', '2026-10-12 10:00:00+00', 'scheduled');
  exception when others then
    v_caught_error := true;
  end;
  if not v_caught_error then
    raise exception 'FAILED Test 4C: RLS failed to prevent User B from attaching reminder to User A invoice!';
  end if;
  raise notice '  -> PASS Test 4C: User B cannot attach reminder to User A invoice.';

  -- Attack 4D: User B attempts to delete User A's client
  delete from public.clients where id = v_client1_id;

  -- Verify client was not deleted
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);

  select count(*) into v_count from public.clients where id = v_client1_id;
  if v_count <> 1 then
    raise exception 'FAILED Test 4D: User B unauthorized delete succeeded!';
  end if;
  raise notice '  -> PASS Test 4D: User B delete attempt on User A client silently deleted 0 rows.';

  -- ------------------------------------------------------------
  -- TEST 5: Default Template Deletion Protection
  -- ------------------------------------------------------------
  raise notice 'Running Test 5: Default template deletion protection...';
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', v_user1_id::text, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user1_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  -- User A attempts to delete default template (is_default = true)
  delete from public.templates where id = v_default_template_id;

  -- Verify it still exists in the database
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);

  select count(*) into v_count from public.templates where id = v_default_template_id;
  if v_count <> 1 then
    raise exception 'FAILED Test 5: User A was able to delete default template!';
  end if;
  raise notice '  -> PASS Test 5: Default template deletion is strictly blocked by RLS.';

  -- User A deletes custom template (is_default = false)
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', v_user1_id::text, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user1_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  delete from public.templates where id = v_template1_id;

  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);

  select count(*) into v_count from public.templates where id = v_template1_id;
  if v_count <> 0 then
    raise exception 'FAILED Test 5: User A was unable to delete their custom template.';
  end if;
  raise notice '  -> PASS Test 5: User A can delete custom template without issue.';

  raise notice '============================================================';
  raise notice '>>> ALL RLS TESTS PASSED SUCCESSFULLY! <<<';
  raise notice '============================================================';
end $$;

rollback;
