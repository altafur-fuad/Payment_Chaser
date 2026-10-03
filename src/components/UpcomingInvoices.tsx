/**
 * @file src/components/UpcomingInvoices.tsx
 * @description Dashboard section for upcoming invoices.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { ArrowRight, CalendarDays } from 'lucide-react'
import Link from 'next/link'

const invoices = [
    {
        invoiceNumber: 'INV-002',
        clientName: 'Sample Client',
        amount: '$500.00',
        dueDate: 'Oct 10, 2026',
        daysUntilDue: 7,
    },
    {
        invoiceNumber: 'INV-003',
        clientName: 'Demo Company',
        amount: '$750.00',
        dueDate: 'Oct 14, 2026',
        daysUntilDue: 11,
    },
]

export function UpcomingInvoices() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Upcoming Invoices
                    </h2>

                    <p className="mt-1 text-sm text-foreground">
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
                <div className="divide-y divide-border">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.invoiceNumber}
                            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
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

                                    <p className="mt-1 text-sm text-foreground">
                                        {invoice.invoiceNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="sm:text-right">
                                <p className="font-mono text-sm font-semibold text-foreground">
                                    {invoice.amount}
                                </p>

                                <p className="mt-1 text-xs text-foreground">
                                    Due {invoice.dueDate} ·{' '}
                                    {invoice.daysUntilDue} days left
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}