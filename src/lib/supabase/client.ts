/**
 * @file src/lib/supabase/client.ts
 * @description Browser-side Supabase client for authenticated client interactions.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config'

export function createClient() {
    return createBrowserClient(
        SUPABASE_URL || 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY || 'placeholder-anon-key'
    )
}
