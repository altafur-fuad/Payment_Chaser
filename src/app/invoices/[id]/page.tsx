/**
 * @file src/app/invoices/[id]/page.tsx
 * @description Responsive invoice details page supporting both mock and stored invoices.
 */

'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit,
    FileText,
    Mail,
    MessageCircle,
    Send,
    UserRound,
} from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ToneBadge } from '@/components/shared/ToneBadge'
import { CurrencyText } from '@/components/shared/CurrencyText'
import { useInvoices } from '@/lib/mock/use-mock-data'
import { markInvoiceAsPaid, saveInvoice } from '@/lib/mock/storage'
import type { Invoice } from '@/types'

function DetailItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserRound
    label: string
    value: string
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Icon size={18} aria-hidden="true" />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {value}
                </p>
            </div>
        </div>
    )
}

function SectionCard({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title}
            </h2>

            <div className="mt-5">{children}</div>
        </section>
    )
}

export default function InvoiceDetailsPage() {
    const params = useParams<{ id: string }>()
    const invoiceId = params.id
    const invoices = useInvoices()

    const invoice = useMemo(() => {
        return invoices.find((item) => item.id === invoiceId)
    }, [invoices, invoiceId])

    const [actionNotice, setActionNotice] = useState<string | null>(null)

    if (!invoice) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
                <Sidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar />

                    <main className="flex-1 px-4 py-8 sm:px-6 lg:p-8">
                        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <FileText size={30} aria-hidden="true" />
                            </div>

                            <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-100">
                                Invoice not found
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                This invoice does not exist or may have been removed.
                            </p>

                            <Link
                                href="/invoices"
                                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                                <ArrowLeft size={17} aria-hidden="true" />
                                Back to Invoices
                            </Link>
                        </div>
                    </main>
                </div>

                <MobileBottomNav />
            </div>
        )
    }

    const reminderTone =
        invoice.templateId === 'template-urgent'
            ? 'urgent'
            : invoice.templateId === 'template-firm'
              ? 'firm'
              : 'friendly'

    const handleMarkAsPaid = () => {
        markInvoiceAsPaid(invoice.id)
        setActionNotice(
            `Invoice ${invoice.invoiceNumber} has been marked as paid. Future reminders have been cancelled.`,
        )
    }

    const handleSimulateReminder = () => {
        const nextSent = (invoice.remindersSent ?? 0) + 1
        const updatedInvoice: Invoice = {
            ...invoice,
            remindersSent: nextSent,
        }
        saveInvoice(updatedInvoice)
        setActionNotice(
            `Simulated reminder sent to ${invoice.clientName} via ${invoice.channels.join(' & ')}. (Production sending will connect to email/WhatsApp webhooks).`,
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220]">
            <div className="flex min-h-screen">
                <Sidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar />

                    <main className="min-w-0 flex-1 pb-24 lg:pb-8">
                        <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                            {/* Page header */}
                            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <Link
                                        href="/invoices"
                                        className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                                    >
                                        <ArrowLeft
                                            size={17}
                                            aria-hidden="true"
                                        />
                                        Back to Invoices
                                    </Link>

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <h1 className="break-all font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                                            {invoice.invoiceNumber}
                                        </h1>

                                        <StatusBadge
                                            status={invoice.status}
                                        />
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                        View invoice information, payment status,
                                        and reminder settings.
                                    </p>
                                </div>

                                <Link
                                    href={`/invoices/${invoice.id}/edit`}
                                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <Edit size={17} aria-hidden="true" />
                                    Edit Invoice
                                </Link>
                            </header>

                            {actionNotice && (
                                <div
                                    role="status"
                                    className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
                                >
                                    <span>{actionNotice}</span>
                                    <button
                                        type="button"
                                        onClick={() => setActionNotice(null)}
                                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {/* Main layout */}
                            <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-3">
                                <div className="min-w-0 space-y-6 xl:col-span-2">
                                    {/* Invoice amount */}
                                    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
                                        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-900/20" />

                                        <div className="relative flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    Total invoice amount
                                                </p>

                                                <div className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                                    <CurrencyText
                                                        amount={invoice.amount}
                                                        currency={invoice.currency}
                                                    />
                                                </div>

                                                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                                    Invoice for{' '}
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {invoice.clientName}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14 dark:bg-blue-950/50 dark:text-blue-400">
                                                <FileText
                                                    size={25}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Invoice information */}
                                    <SectionCard title="Invoice Information">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <DetailItem
                                                icon={UserRound}
                                                label="Client"
                                                value={invoice.clientName}
                                            />

                                            <DetailItem
                                                icon={FileText}
                                                label="Invoice Number"
                                                value={invoice.invoiceNumber}
                                            />

                                            <DetailItem
                                                icon={CalendarDays}
                                                label="Issue Date"
                                                value={invoice.issueDate}
                                            />

                                            <DetailItem
                                                icon={CalendarDays}
                                                label="Due Date"
                                                value={invoice.dueDate}
                                            />
                                        </div>
                                    </SectionCard>

                                    {/* Reminder settings */}
                                    <SectionCard title="Reminder Settings">
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    Reminder channels
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {invoice.channels.includes(
                                                        'email',
                                                    ) && (
                                                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                                                            <Mail
                                                                size={16}
                                                                className="text-blue-600 dark:text-blue-400"
                                                                aria-hidden="true"
                                                            />
                                                            Email
                                                        </div>
                                                    )}

                                                    {invoice.channels.includes(
                                                        'whatsapp',
                                                    ) && (
                                                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                                                            <MessageCircle
                                                                size={16}
                                                                className="text-emerald-600 dark:text-emerald-400"
                                                                aria-hidden="true"
                                                            />
                                                            WhatsApp
                                                        </div>
                                                    )}

                                                    {invoice.channels.length ===
                                                        0 && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            No reminder channels configured.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 dark:border-slate-800">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        Automatic reminders
                                                    </p>

                                                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        <span
                                                            className={`h-2.5 w-2.5 rounded-full ${
                                                                invoice.remindersEnabled
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-slate-400'
                                                            }`}
                                                        />

                                                        {invoice.remindersEnabled
                                                            ? 'Enabled'
                                                            : 'Disabled'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        Reminders sent
                                                    </p>

                                                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {invoice.remindersSent ??
                                                            0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </SectionCard>

                                    {/* Document attachment notice */}
                                    <SectionCard title="Invoice Document">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {invoice.filePath ? (
                                                `Attached document: ${invoice.filePath}`
                                            ) : (
                                                <span className="italic text-slate-500">
                                                    No document attached. (File uploads are validated locally in this prototype and will be stored securely when cloud storage is connected).
                                                </span>
                                            )}
                                        </p>
                                    </SectionCard>

                                    {/* Notes */}
                                    {invoice.notes && (
                                        <SectionCard title="Notes">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                {invoice.notes}
                                            </p>
                                        </SectionCard>
                                    )}
                                </div>

                                {/* Right sidebar */}
                                <aside className="min-w-0 space-y-6">
                                    {/* Payment status */}
                                    <SectionCard title="Payment Status">
                                        <div>
                                            <StatusBadge
                                                status={invoice.status}
                                            />
                                        </div>

                                        {invoice.status === 'overdue' &&
                                            invoice.daysOverdue !==
                                                undefined && (
                                                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                                                    <Clock3
                                                        size={18}
                                                        className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                                                        aria-hidden="true"
                                                    />

                                                    <div>
                                                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                                            Payment overdue
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-red-600 dark:text-red-300">
                                                            {invoice.daysOverdue}{' '}
                                                            days past the due
                                                            date.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        {invoice.paidAt && (
                                            <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                                                <CheckCircle2
                                                    size={19}
                                                    className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                                    aria-hidden="true"
                                                />

                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                                        Payment received
                                                    </p>

                                                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                                                        {invoice.paidAt}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </SectionCard>

                                    {/* Reminder tone */}
                                    <SectionCard title="Reminder Tone">
                                        <ToneBadge tone={reminderTone} />

                                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {reminderTone === 'urgent'
                                                ? 'A direct tone for overdue or time-sensitive payments.'
                                                : reminderTone === 'firm'
                                                   ? 'A professional and firm tone for payment follow-ups.'
                                                   : 'A friendly tone to maintain positive client relationships.'}
                                        </p>
                                    </SectionCard>

                                    {/* Quick actions */}
                                    <SectionCard title="Quick Actions">
                                        <div className="space-y-3">
                                            {invoice.status !== 'paid' ? (
                                                <button
                                                    type="button"
                                                    onClick={handleMarkAsPaid}
                                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                >
                                                    <CheckCircle2
                                                        size={17}
                                                        aria-hidden="true"
                                                    />
                                                    Mark as Paid
                                                </button>
                                            ) : (
                                                <div className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                    <CheckCircle2
                                                        size={17}
                                                        aria-hidden="true"
                                                    />
                                                    Invoice Paid
                                                </div>
                                            )}

                                            {invoice.status !== 'paid' && (
                                                <button
                                                    type="button"
                                                    onClick={handleSimulateReminder}
                                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <Send
                                                        size={17}
                                                        aria-hidden="true"
                                                    />
                                                    Simulate Send Reminder
                                                </button>
                                            )}

                                            <p className="pt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                                Action updates will persist across
                                                all screens in this session.
                                            </p>
                                        </div>
                                    </SectionCard>
                                </aside>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <MobileBottomNav />
        </div>
    )
}