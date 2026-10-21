/**
 * @file src/components/NeedsAttention.tsx
 * @description Dashboard section for invoices that need attention.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const items = [
    {
        invoiceNumber: 'INV-001',
        clientName: 'Demo Client',
        amount: '$0.00',
        daysOverdue: 0,
    },
]

export function NeedsAttention() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Needs Attention
                    </h2>

                    <p className="mt-1 text-sm text-foreground">
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
                {items.map((item) => (
                    <div
                        key={item.invoiceNumber}
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
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

                                <p className="mt-1 text-sm text-foreground">
                                    {item.invoiceNumber}
                                </p>
                            </div>
                        </div>

                        <div className="sm:text-right">
                            <p className="font-mono text-sm font-semibold text-foreground">
                                {item.amount}
                            </p>

                            <p className="mt-1 text-xs text-foreground">
                                {item.daysOverdue} days overdue
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}