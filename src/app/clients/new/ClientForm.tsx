'use client'

/**
 * @file src/app/clients/new/ClientForm.tsx
 * @description Form to add a new client connected to createClient Server Action.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { createClient } from '@/app/actions/clients'
import type { ClientInput } from '@/types'

const clientSchema = z.object({
    name: z
        .string()
        .min(2, 'Client name must be at least 2 characters.')
        .max(100, 'Client name is too long.'),

    email: z
        .string()
        .email('Enter a valid email address.')
        .or(z.literal('')),

    whatsappNumber: z
        .string()
        .regex(
            /^\+?[0-9\s()-]{8,20}$/,
            'Enter a valid WhatsApp number.',
        )
        .or(z.literal('')),

    preferredChannel: z.enum(['email', 'whatsapp', 'both']),
})

type ClientFormValues = z.infer<typeof clientSchema>

export function ClientForm() {
    const [submitted, setSubmitted] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            email: '',
            whatsappNumber: '',
            preferredChannel: 'email',
        },
    })

    const onSubmit = async (values: ClientFormValues) => {
        setServerError(null)

        const input: ClientInput = {
            name: values.name.trim(),
            email: values.email.trim() || undefined,
            whatsappNumber: values.whatsappNumber.trim() || undefined,
            preferredChannel: values.preferredChannel,
        }

        const res = await createClient(input)

        if (!res.ok) {
            setServerError(res.error)
            return
        }

        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <CheckCircle2
                    size={48}
                    className="mx-auto text-emerald-500"
                    aria-hidden="true"
                />

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                    Client created successfully
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    The client has been added to your database and is available for invoicing.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/clients"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        Back to Clients
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            reset({
                                name: '',
                                email: '',
                                whatsappNumber: '',
                                preferredChannel: 'email',
                            })
                            setSubmitted(false)
                            setServerError(null)
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        Add Another Client
                    </button>
                </div>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
            <Link
                href="/clients"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
                <ArrowLeft size={16} />
                Back to clients
            </Link>

            {serverError && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground"
                    >
                        Client Name <span className="text-red-500">*</span>
                    </label>

                    <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder="Acme Corp or Jane Doe"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground"
                    >
                        Email Address
                    </label>

                    <input
                        {...register('email')}
                        id="email"
                        type="email"
                        placeholder="billing@acmecorp.com"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="whatsappNumber"
                        className="block text-sm font-medium text-foreground"
                    >
                        WhatsApp Number
                    </label>

                    <input
                        {...register('whatsappNumber')}
                        id="whatsappNumber"
                        type="tel"
                        placeholder="+1 555 123 4567"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.whatsappNumber && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.whatsappNumber.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="preferredChannel"
                        className="block text-sm font-medium text-foreground"
                    >
                        Preferred Reminder Channel
                    </label>

                    <select
                        {...register('preferredChannel')}
                        id="preferredChannel"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="both">Both (Email & WhatsApp)</option>
                    </select>

                    {errors.preferredChannel && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.preferredChannel.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Link
                    href="/clients"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                >
                    {isSubmitting ? 'Saving Client...' : 'Create Client'}
                </button>
            </div>
        </form>
    )
}