'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import type { ClientInput, ReminderChannel } from '@/types'

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

    preferredChannel: z.enum(['email', 'whatsapp']),
})

type ClientFormValues = z.infer<typeof clientSchema>

export function ClientForm() {
    const [submitted, setSubmitted] = useState(false)

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
        const input: ClientInput = {
            name: values.name.trim(),
            email: values.email.trim() || undefined,
            whatsappNumber:
                values.whatsappNumber.trim() || undefined,
            preferredChannel: values.preferredChannel as ReminderChannel,
        }

        console.log('Create client:', input)

        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })

        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
                <CheckCircle2
                    size={48}
                    className="mx-auto text-emerald-500"
                    aria-hidden="true"
                />

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                    Client created successfully
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    The client has been added to your client list.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/clients"
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
    }}
    className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
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
            className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6 md:p-8"
        >
            <div className="space-y-5">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Client Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        placeholder="e.g. John Doe"
                        {...register('name')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="client@example.com"
                        {...register('email')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.email && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="whatsappNumber"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        WhatsApp Number
                    </label>

                    <input
                        id="whatsappNumber"
                        type="tel"
                        placeholder="+8801712345678"
                        {...register('whatsappNumber')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.whatsappNumber && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.whatsappNumber.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="preferredChannel"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Preferred Reminder Channel
                    </label>

                    <select
                        id="preferredChannel"
                        {...register('preferredChannel')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>

                    {errors.preferredChannel && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.preferredChannel.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Link
                    href="/clients"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {isSubmitting ? 'Saving...' : 'Save Client'}
                </button>
            </div>
        </form>
    )
}