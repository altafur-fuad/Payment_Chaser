'use client'

/**
 * @file src/components/UpcomingInvoices.tsx
 * @description Dashboard section for upcoming invoices with dynamic mock calculations.
 */

import { ArrowRight, CalendarDays, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { useInvoices } from '@/lib/mock/use-mock-data'
import { getUpcomingInvoicesList } from '@/lib/mock/storage'
import type { Invoice, UpcomingInvoice } from '@/types'

function formatAmount(amount: number, currency: string = 'USD'): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 2,
        }).format(amount)
    } catch {
        return `$${amount.toFixed(2)}`
    }
}

function formatDate(dateString: string): string {
    if (!dateString) return '—'
    const date = new Date(`${dateString.slice(0, 10)}T00:00:00`)
    if (Number.isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

interface UpcomingInvoicesProps {
    invoices?: Invoice[]
    items?: UpcomingInvoice[]
}

export function UpcomingInvoices({ invoices: propInvoices, items: propItems }: UpcomingInvoicesProps) {
    const storeInvoices = useInvoices()
    const invoices = propInvoices ?? storeInvoices
    const upcomingList = propItems ?? getUpcomingInvoicesList(invoices)

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Upcoming Invoices
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Invoices with upcoming payment deadlines.
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
                {upcomingList.length === 0 ? (
                    <div className="flex items-center gap-3 p-6 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2
                            size={20}
                            className="text-primary shrink-0"
                            aria-hidden="true"
                        />
                        <p>No upcoming pending invoices.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {upcomingList.slice(0, 5).map((invoice) => (
                            <Link
                                key={invoice.invoiceNumber}
                                href={`/invoices/${invoice.invoiceId}`}
                                className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                        <CalendarDays
                                            size={20}
                                            strokeWidth={1.75}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium text-foreground">
                                            {invoice.clientName}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {invoice.invoiceNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="sm:text-right">
                                    <p className="font-mono text-sm font-semibold text-foreground">
                                        {formatAmount(invoice.amount, invoice.currency)}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Due {formatDate(invoice.dueDate)} ·{' '}
                                        {invoice.daysUntilDue === 0
                                            ? 'Due today'
                                            : `${invoice.daysUntilDue} days left`}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}