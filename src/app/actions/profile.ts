'use server'

/**
 * @file src/app/actions/profile.ts
 * @description Type-safe Server Actions for freelancer settings and profile persistence.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validation/profile'
import type { Profile, ProfileInput, Result } from '@/types'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import * as mockStorage from '@/lib/mock/storage'

function formatZodErrors(issues: Array<{ path: unknown[]; message: string }>): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of issues) {
        const path = issue.path.map(String).join('.') || 'general'
        if (!fieldErrors[path]) {
            fieldErrors[path] = []
        }
        fieldErrors[path].push(issue.message)
    }
    return fieldErrors
}

interface DbProfileRow {
    id: string
    display_name: string
    business_name: string | null
    email: string | null
    timezone: string
    default_currency: string
    created_at: string
    updated_at: string
}

function mapDbToProfile(row: DbProfileRow, fallbackEmail = ''): Profile {
    return {
        id: row.id,
        displayName: row.display_name,
        businessName: row.business_name,
        email: row.email || fallbackEmail,
        timezone: row.timezone,
        defaultCurrency: row.default_currency,
        createdAt: row.created_at,
    }
}

export async function getProfile(): Promise<Result<Profile | null>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            return { ok: true, data: mockStorage.getProfile() }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (error) {
            return { ok: false, error: 'Failed to fetch profile settings.' }
        }

        if (!data) {
            // Profile not yet created by trigger, create fallback
            const defaultName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Freelancer'
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    display_name: defaultName,
                    email: user.email,
                    timezone: 'Asia/Dhaka',
                    default_currency: 'USD',
                })
                .select()
                .single()

            if (insertError || !newProfile) {
                return {
                    ok: true,
                    data: {
                        id: user.id,
                        displayName: defaultName,
                        businessName: null,
                        email: user.email || '',
                        timezone: 'Asia/Dhaka',
                        defaultCurrency: 'USD',
                        createdAt: new Date().toISOString(),
                    },
                }
            }

            return { ok: true, data: mapDbToProfile(newProfile as DbProfileRow, user.email) }
        }

        return { ok: true, data: mapDbToProfile(data as DbProfileRow, user.email) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve profile.'
        return { ok: false, error: message }
    }
}

export async function updateProfile(
    input: ProfileInput
): Promise<Result<Profile>> {
    try {
        const validated = profileSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const updated = mockStorage.saveProfile(validated.data)
            return { ok: true, data: updated }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({
                display_name: validated.data.displayName.trim(),
                business_name: validated.data.businessName?.trim() || null,
                timezone: validated.data.timezone,
                default_currency: validated.data.defaultCurrency,
            })
            .eq('id', user.id)
            .select()
            .single()

        if (error) {
            return { ok: false, error: 'Failed to update profile settings.' }
        }

        // Also synchronize full_name in auth user metadata
        await supabase.auth.updateUser({
            data: {
                full_name: validated.data.displayName.trim(),
            },
        })

        revalidatePath('/', 'layout')
        revalidatePath('/settings')

        return { ok: true, data: mapDbToProfile(data as DbProfileRow, user.email) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update profile.'
        return { ok: false, error: message }
    }
}
