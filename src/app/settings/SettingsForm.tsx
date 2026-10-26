'use client'

/**
 * @file src/app/settings/SettingsForm.tsx
 * @description Settings and profile form connected to Profile Server Actions.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { getProfile, updateProfile } from '@/app/actions/profile'
import { useProfile } from '@/lib/mock/use-mock-data'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { Profile, ProfileInput } from '@/types'

const timezones = [
    'Asia/Dhaka',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Europe/London',
    'America/New_York',
]

const currencies = ['USD', 'BDT', 'EUR', 'GBP', 'CAD']

export function SettingsForm() {
    const isMockLocal = USE_MOCK && !isSupabaseConfigured()
    const mockProfile = useProfile()

    const [profile, setProfile] = useState<Profile>(mockProfile)
    const [loading, setLoading] = useState(!isMockLocal)

    const [displayName, setDisplayName] = useState(mockProfile.displayName)
    const [businessName, setBusinessName] = useState(mockProfile.businessName ?? '')
    const [timezone, setTimezone] = useState(mockProfile.timezone)
    const [defaultCurrency, setDefaultCurrency] = useState(mockProfile.defaultCurrency)

    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isMockLocal) return

        let isCancelled = false

        getProfile().then((res) => {
            if (isCancelled) return
            setLoading(false)
            if (res.ok && res.data) {
                setProfile(res.data)
                setDisplayName(res.data.displayName)
                setBusinessName(res.data.businessName ?? '')
                setTimezone(res.data.timezone)
                setDefaultCurrency(res.data.defaultCurrency)
            }
        })

        return () => {
            isCancelled = true
        }
    }, [isMockLocal, mockProfile])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!displayName.trim()) {
            setError('Display name is required.')
            return
        }

        const profileData: ProfileInput = {
            displayName: displayName.trim(),
            businessName: businessName.trim() || undefined,
            timezone,
            defaultCurrency,
        }

        setSaving(true)
        const res = await updateProfile(profileData)
        setSaving(false)

        if (!res.ok) {
            setError(res.error)
            return
        }

        setSaved(true)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('payment-chaser-profile-update', {
                    detail: { displayName: profileData.displayName },
                })
            )
        }
        window.setTimeout(() => {
            setSaved(false)
        }, 3000)
    }

    if (loading) {
        return (
            <div className="max-w-2xl rounded-2xl border border-border bg-card p-8 text-center text-slate-500">
                Loading profile settings...
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                    <span>{error}</span>
                </div>
            )}

            {saved && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Settings successfully saved to your database account.</span>
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground"
                    >
                        Account Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={profile.email || ''}
                        disabled
                        className="mt-2 flex h-11 w-full cursor-not-allowed rounded-xl border border-border bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Email is managed by Supabase Authentication.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="displayName"
                        className="block text-sm font-medium text-foreground"
                    >
                        Display Name <span className="text-red-500">*</span>
                    </label>

                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(event) =>
                            setDisplayName(event.target.value)
                        }
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-foreground"
                    >
                        Business or Studio Name
                    </label>

                    <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(event) =>
                            setBusinessName(event.target.value)
                        }
                        placeholder="e.g. Mahatab Studio"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />
                </div>

                <div>
                    <label
                        htmlFor="timezone"
                        className="block text-sm font-medium text-foreground"
                    >
                        Timezone
                    </label>

                    <select
                        id="timezone"
                        value={timezone}
                        onChange={(event) => setTimezone(event.target.value)}
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {timezones.map((tz) => (
                            <option key={tz} value={tz}>
                                {tz}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                        Payment due dates and automated reminder schedules are calculated in this timezone.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="defaultCurrency"
                        className="block text-sm font-medium text-foreground"
                    >
                        Default Currency
                    </label>

                    <select
                        id="defaultCurrency"
                        value={defaultCurrency}
                        onChange={(event) =>
                            setDefaultCurrency(event.target.value)
                        }
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {currencies.map((curr) => (
                            <option key={curr} value={curr}>
                                {curr}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    )
}