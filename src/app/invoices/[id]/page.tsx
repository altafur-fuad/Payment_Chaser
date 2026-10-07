/**
 * @file src/app/invoices/[id]/page.tsx
 * @description Invoice details page for the Payment Chaser application.
 * @phase 5
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import Link from 'next/link'
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Edit,
    FileText,
    Mail,
    MessageCircle,
} from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ToneBadge } from '@/components/shared/ToneBadge'
import { CurrencyText } from '@/components/shared/CurrencyText'
import { mockInvoices } from '@/lib/mock/invoices'

interface InvoiceDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function InvoiceDetailsPage({
    params,
}: InvoiceDetailsPageProps) {
    const { id } = await params

    const invoice = mockInvoices.find(
        (item) => item.id === id,
    )

    if (!invoice) {
        return (
            <div className="flex min-h-screen bg-background">
                <Sidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar />

                    <main className="flex-1 pb-16 lg:pb-0">
                        <section className="p-6 md:p-8">
                            <div className="rounded-lg border border-border bg-background p-8 text-center">
                                <FileText
                                    size={40}
                                    className="mx-auto "
                                    aria-hidden="true"
                                />

                                <h1 className="mt-4 text-xl font-semibold text-foreground">
                                    Invoice not found
                                </h1>

                                <p className="mt-2 text-sm ">
                                    The invoice you are looking for does not exist.
                                </p>

                                <Link
                                    href="/invoices"
                                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <ArrowLeft
                                        size={18}
                                        aria-hidden="true"
                                    />
                                    Back to Invoices
                                </Link>
                            </div>
                        </section>
                    </main>
                </div>

                <MobileBottomNav />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="flex-1 pb-16 lg:pb-0">
                    <section className="space-y-6 p-6 md:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <Link
                                    href="/invoices"
                                    className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <ArrowLeft
                                        size={18}
                                        aria-hidden="true"
                                    />
                                    Back to Invoices
                                </Link>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <h1 className="font-mono text-2xl font-semibold text-foreground">
                                        {invoice.invoiceNumber}
                                    </h1>

                                    <StatusBadge
                                        status={invoice.status}
                                    />
                                </div>

                                <p className="mt-1 text-sm ">
                                    Invoice details and reminder settings.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <Edit
                                    size={18}
                                    aria-hidden="true"
                                />
                                Edit Invoice
                            </button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                <div className="rounded-lg border border-border bg-background p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm ">
                                                Invoice Amount
                                            </p>

                                            <div className="mt-2 text-3xl font-semibold text-foreground">
                                                <CurrencyText
                                                    amount={invoice.amount}
                                                    currency={invoice.currency}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                                            <FileText
                                                size={22}
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border bg-background p-6">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Invoice Information
                                    </h2>

                                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm ">
                                                Client
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {invoice.clientName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm ">
                                                Invoice Number
                                            </p>

                                            <p className="mt-1 font-mono text-sm font-medium text-foreground">
                                                {invoice.invoiceNumber}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm ">
                                                Issue Date
                                            </p>

                                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                                                <CalendarDays
                                                    size={16}
                                                    className=""
                                                    aria-hidden="true"
                                                />
                                                {invoice.issueDate}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm ">
                                                Due Date
                                            </p>

                                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                                                <CalendarDays
                                                    size={16}
                                                    className="text-muted"
                                                    aria-hidden="true"
                                                />
                                                {invoice.dueDate}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border bg-background p-6">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Reminder Settings
                                    </h2>

                                    <div className="mt-6 space-y-5">
                                        <div>
                                            <p className="text-sm ">
                                                Reminder Channels
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-3">
                                                {invoice.channels.includes(
                                                    'email',
                                                ) && (
                                                    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground">
                                                        <Mail
                                                            size={17}
                                                            aria-hidden="true"
                                                        />
                                                        Email
                                                    </div>
                                                )}

                                                {invoice.channels.includes(
                                                    'whatsapp',
                                                ) && (
                                                    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground">
                                                        <MessageCircle
                                                            size={17}
                                                            aria-hidden="true"
                                                        />
                                                        WhatsApp
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm ">
                                                Reminder Status
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {invoice.remindersEnabled
                                                    ? 'Reminders are enabled'
                                                    : 'Reminders are disabled'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm ">
                                                Reminders Sent
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {invoice.remindersSent ?? 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {invoice.notes && (
                                    <div className="rounded-lg border border-border bg-background p-6">
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Notes
                                        </h2>

                                        <p className="mt-3 text-sm leading-6 ">
                                            {invoice.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-6">
                                <div className="rounded-lg border border-border bg-background p-6">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Payment Status
                                    </h2>

                                    <div className="mt-5">
                                        <StatusBadge
                                            status={invoice.status}
                                        />
                                    </div>

                                    {invoice.status === 'overdue' &&
                                        invoice.daysOverdue !== undefined && (
                                            <p className="mt-4 text-sm text-danger">
                                                {invoice.daysOverdue} days overdue
                                            </p>
                                        )}

                                    {invoice.paidAt && (
                                        <div className="mt-4 flex items-start gap-3">
                                            <CheckCircle2
                                                size={20}
                                                className="mt-0.5 shrink-0 text-success"
                                                aria-hidden="true"
                                            />

                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    Payment received
                                                </p>

                                                <p className="mt-1 text-xs ">
                                                    {invoice.paidAt}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border border-border bg-background p-6">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Reminder Tone
                                    </h2>

                                    <div className="mt-4">
                                        <ToneBadge
                                            tone={
                                                invoice.templateId ===
                                                'template-urgent'
                                                    ? 'urgent'
                                                    : invoice.templateId ===
                                                        'template-firm'
                                                      ? 'firm'
                                                      : 'friendly'
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border bg-background p-6">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Actions
                                    </h2>

                                    <div className="mt-4 space-y-3">
                                        {invoice.status !== 'paid' && (
                                            <button
                                                type="button"
                                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
                                            >
                                                <CheckCircle2
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                                Mark as Paid
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                            Send Reminder
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}