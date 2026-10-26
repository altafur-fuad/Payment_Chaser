'use server'

/**
 * @file src/app/actions/auth.ts
 * @description Server Actions for Supabase authentication, session handling, and password flows.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
    signUpSchema,
    logInSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    type SignUpInput,
    type LogInInput,
    type ForgotPasswordInput,
    type ResetPasswordInput,
} from '@/lib/validation/auth'
import type { Result } from '@/types'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'

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

export interface AuthUserResponse {
    id: string
    email: string
    displayName?: string
}

export async function signUp(
    input: SignUpInput
): Promise<Result<{ user: AuthUserResponse; needsEmailConfirmation: boolean }>> {
    try {
        const validated = signUpSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            return {
                ok: true,
                data: {
                    user: {
                        id: 'demo-user-id',
                        email: validated.data.email,
                        displayName: validated.data.fullName,
                    },
                    needsEmailConfirmation: false,
                },
            }
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.signUp({
            email: validated.data.email,
            password: validated.data.password,
            options: {
                data: {
                    full_name: validated.data.fullName,
                    business_name: validated.data.businessName || '',
                },
            },
        })

        if (error) {
            return {
                ok: false,
                error: error.message || 'Unable to sign up. Please try again.',
            }
        }

        if (!data.user) {
            return {
                ok: false,
                error: 'Signup failed. No user was returned by authentication provider.',
            }
        }

        const needsEmailConfirmation = Boolean(
            data.user && !data.session && data.user.identities && data.user.identities.length > 0
        )

        return {
            ok: true,
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email ?? validated.data.email,
                    displayName: validated.data.fullName,
                },
                needsEmailConfirmation,
            },
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.'
        return { ok: false, error: message }
    }
}

export async function logIn(
    input: LogInInput
): Promise<Result<{ user: AuthUserResponse }>> {
    try {
        const validated = logInSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            return {
                ok: true,
                data: {
                    user: {
                        id: 'demo-user-id',
                        email: validated.data.email,
                        displayName: 'Demo User',
                    },
                },
            }
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email: validated.data.email,
            password: validated.data.password,
        })

        if (error) {
            return {
                ok: false,
                error: error.message || 'Invalid email or password.',
            }
        }

        if (!data.user) {
            return {
                ok: false,
                error: 'Login failed. User session could not be established.',
            }
        }

        revalidatePath('/', 'layout')

        return {
            ok: true,
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email ?? validated.data.email,
                    displayName: (data.user.user_metadata?.full_name as string) || undefined,
                },
            },
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.'
        return { ok: false, error: message }
    }
}

export async function logOut(): Promise<Result<boolean>> {
    try {
        if (!USE_MOCK || isSupabaseConfigured()) {
            const supabase = await createClient()
            const { error } = await supabase.auth.signOut()
            if (error) {
                return { ok: false, error: error.message }
            }
        }

        revalidatePath('/', 'layout')
        return { ok: true, data: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to sign out.'
        return { ok: false, error: message }
    }
}

export async function forgotPassword(
    input: ForgotPasswordInput
): Promise<Result<boolean>> {
    try {
        const validated = forgotPasswordSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please enter a valid email address.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            return { ok: true, data: true }
        }

        const supabase = await createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(
            validated.data.email
        )

        if (error) {
            return { ok: false, error: error.message }
        }

        return { ok: true, data: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to send password recovery email.'
        return { ok: false, error: message }
    }
}

export async function resetPassword(
    input: ResetPasswordInput
): Promise<Result<boolean>> {
    try {
        const validated = resetPasswordSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            return { ok: true, data: true }
        }

        const supabase = await createClient()
        const { error } = await supabase.auth.updateUser({
            password: validated.data.password,
        })

        if (error) {
            return { ok: false, error: error.message }
        }

        return { ok: true, data: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update password.'
        return { ok: false, error: message }
    }
}

export async function getCurrentUser(): Promise<Result<AuthUserResponse | null>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            return {
                ok: true,
                data: {
                    id: 'demo-user-id',
                    email: 'demo@paymentchaser.com',
                    displayName: 'Mahatab Hossain',
                },
            }
        }

        const supabase = await createClient()
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        if (error || !user) {
            return { ok: true, data: null }
        }

        return {
            ok: true,
            data: {
                id: user.id,
                email: user.email || '',
                displayName: (user.user_metadata?.full_name as string) || undefined,
            },
        }
    } catch {
        return { ok: true, data: null }
    }
}
