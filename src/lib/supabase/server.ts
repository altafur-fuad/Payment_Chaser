/**
 * @file src/lib/supabase/server.ts
 * @description Server-side authenticated Supabase client for Server Actions and Server Components.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        SUPABASE_URL || 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY || 'placeholder-anon-key',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be safely ignored when proxy/middleware refreshes sessions.
                    }
                },
            },
        }
    )
}
