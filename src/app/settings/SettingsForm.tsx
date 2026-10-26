'use client'

import { useState } from 'react'

import { useProfile } from '@/lib/mock/use-mock-data'
import { saveProfile } from '@/lib/mock/storage'
import type { Profile, ProfileInput } from '@/types'

const timezones = [
    'Asia/Dhaka',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Europe/London',
    'America/New_York',
]

const currencies = ['USD', 'BDT', 'EUR', 'GBP', 'CAD']

interface SettingsFormFieldsProps {
    initialProfile: Profile
}

function SettingsFormFields({ initialProfile }: SettingsFormFieldsProps) {
    const [displayName, setDisplayName] = useState(initialProfile.displayName)
    const [businessName, setBusinessName] = useState(
        initialProfile.businessName ?? '',
    )
    const [timezone, setTimezone] = useState(initialProfile.timezone)
    const [defaultCurrency, setDefaultCurrency] = useState(
        initialProfile.defaultCurrency,
    )
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

        try {
            saveProfile(profileData)
            setSaved(true)

            window.setTimeout(() => {
                setSaved(false)
            }, 2500)
        } catch (err) {
            console.error('Failed to save profile:', err)
            setError('Failed to save profile settings.')
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl rounded-lg border border-border bg-card p-6 shadow-sm"
        >
            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="displayName"
                        className="text-sm font-medium text-foreground"
                    >
                        Display Name
                    </label>

                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(event) =>
                            setDisplayName(event.target.value)
                        }
                        className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="businessName"
                        className="text-sm font-medium text-foreground"
                    >
                        Business Name
                    </label>

                    <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(event) =>
                            setBusinessName(event.target.value)
                        }
                        placeholder="Your business name"
                        className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />
                </div>

                <div>
                    <label
                        htmlFor="timezone"
                        className="text-sm font-medium text-foreground"
                    >
                        Timezone
                    </label>

                    <select
                        id="timezone"
                        value={timezone}
                        onChange={(event) =>
                            setTimezone(event.target.value)
                        }
                        className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {timezones.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="defaultCurrency"
                        className="text-sm font-medium text-foreground"
                    >
                        Default Currency
                    </label>

                    <select
                        id="defaultCurrency"
                        value={defaultCurrency}
                        onChange={(event) =>
                            setDefaultCurrency(event.target.value)
                        }
                        className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <p className="text-sm font-medium text-danger">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        type="submit"
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        Save Changes
                    </button>

                    {saved && (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Changes saved successfully.
                        </p>
                    )}
                </div>
            </div>
        </form>
    )
}

export function SettingsForm() {
    const profile = useProfile()
    const formKey = `${profile.displayName}-${profile.businessName ?? ''}-${profile.timezone}-${profile.defaultCurrency}`

    return <SettingsFormFields key={formKey} initialProfile={profile} />
}