/**
 * @file src/lib/config.ts
 * @description Central application configuration and environment variable validation.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

/**
 * Returns true if public Supabase environment variables are present and non-empty.
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(
        SUPABASE_URL &&
        SUPABASE_URL.startsWith('http') &&
        !SUPABASE_URL.includes('your-project-id') &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_ANON_KEY.includes('your-anon-key') &&
        !SUPABASE_ANON_KEY.includes('your-publishable-key')
    )
}

/**
 * Data-access strategy flag.
 * - In production: Mock mode is strictly forbidden unless explicitly enabled for demo/testing via NEXT_PUBLIC_USE_MOCK === 'true'.
 * - In local development: Defaults to true if Supabase credentials are not yet configured, or when NEXT_PUBLIC_USE_MOCK === 'true'.
 */
export const USE_MOCK: boolean = (() => {
    const mockEnv = process.env.NEXT_PUBLIC_USE_MOCK

    if (process.env.NODE_ENV === 'production') {
        return mockEnv === 'true'
    }

    if (mockEnv === 'false') {
        return false
    }

    if (mockEnv === 'true') {
        return true
    }

    // Default for development when credentials are not yet configured
    return !isSupabaseConfigured()
})()