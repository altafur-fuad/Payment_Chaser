'use client'

/**
 * @file src/components/NeedsAttention.tsx
 * @description Dashboard section for invoices that need attention, backed by dynamic mock data.
 */

import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { useInvoices } from '@/lib/mock/use-mock-data'
import { getNeedsAttentionItems } from '@/lib/mock/storage'
import type { Invoice } from '@/types'

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

interface NeedsAttentionProps {
    invoices?: Invoice[]
}

export function NeedsAttention({ invoices: propInvoices }: NeedsAttentionProps) {
    const storeInvoices = useInvoices()
    const invoices = propInvoices ?? storeInvoices
    const items = getNeedsAttentionItems(invoices)

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Needs Attention
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Invoices that may need your attention.
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
                {items.length === 0 ? (
                    <div className="flex items-center gap-3 p-6 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2
                            size={20}
                            className="text-emerald-500 shrink-0"
                            aria-hidden="true"
                        />
                        <p>No overdue invoices. All accounts are in good standing!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {items.slice(0, 5).map((item) => (
                            <Link
                                key={item.invoiceNumber}
                                href={`/invoices/${item.invoiceId}`}
                                className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                        <AlertTriangle
                                            size={20}
                                            strokeWidth={1.75}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium text-foreground">
                                            {item.clientName}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {item.invoiceNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="sm:text-right">
                                    <p className="font-mono text-sm font-semibold text-foreground">
                                        {formatAmount(item.amount, item.currency)}
                                    </p>

                                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                                        {item.daysOverdue > 0
                                            ? `${item.daysOverdue} days overdue`
                                            : 'Due today / overdue'}
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