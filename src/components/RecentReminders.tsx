'use client'

/**
 * @file src/components/RecentReminders.tsx
 * @description Dashboard section showing recent reminder activity from dynamic mock storage.
 */

import {
    ArrowRight,
    CheckCircle2,
    Mail,
    MessageCircle,
    BellOff,
} from 'lucide-react'
import Link from 'next/link'

import { useInvoices } from '@/lib/mock/use-mock-data'
import { getRecentRemindersList } from '@/lib/mock/storage'
import type { Invoice } from '@/types'

interface RecentRemindersProps {
    invoices?: Invoice[]
}

export function RecentReminders({ invoices: propInvoices }: RecentRemindersProps) {
    const storeInvoices = useInvoices()
    const invoices = propInvoices ?? storeInvoices
    const reminders = getRecentRemindersList(invoices)

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Recent Reminders
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Latest payment reminder activity.
                    </p>
                </div>

                <Link
                    href="/invoices"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    View all
                    <ArrowRight
                        size={16}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <div className="rounded-lg border border-border bg-background">
                {reminders.length === 0 ? (
                    <div className="flex items-center gap-3 p-6 text-sm text-slate-600 dark:text-slate-400">
                        <BellOff
                            size={20}
                            className="text-slate-400 shrink-0"
                            aria-hidden="true"
                        />
                        <p>No reminders sent yet. Send reminders from the invoice detail page.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {reminders.map((reminder) => (
                            <Link
                                key={reminder.id}
                                href={reminder.invoiceId ? `/invoices/${reminder.invoiceId}` : '/invoices'}
                                className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        {reminder.channel === 'Email' ? (
                                            <Mail
                                                size={20}
                                                strokeWidth={1.75}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <MessageCircle
                                                size={20}
                                                strokeWidth={1.75}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-medium text-foreground">
                                            {reminder.clientName}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {reminder.channel} · {reminder.invoiceNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:text-right">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {reminder.status}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {reminder.sentAt}
                                        </p>
                                    </div>

                                    <CheckCircle2
                                        size={20}
                                        strokeWidth={1.75}
                                        className="text-emerald-600 dark:text-emerald-400"
                                        aria-label="Reminder successful"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}