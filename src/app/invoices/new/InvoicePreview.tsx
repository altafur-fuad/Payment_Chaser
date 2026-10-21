'use client'

import {
    CalendarDays,
    FileText,
    Receipt,
} from 'lucide-react'

type InvoicePreviewProps = {
    templateId?: string
    clientName?: string
    invoiceNumber?: string
    amount?: number | string
    currency?: string
    issueDate?: string
    dueDate?: string
    notes?: string
}

const designs: Record<
    string,
    { name: string; accent: string; background: string; border: string }
> = {
    modern: {
        name: 'Modern',
        accent: '#2563eb',
        background: '#eff6ff',
        border: '#bfdbfe',
    },
    minimal: {
        name: 'Minimal',
        accent: '#475569',
        background: '#f8fafc',
        border: '#e2e8f0',
    },
    professional: {
        name: 'Professional',
        accent: '#4f46e5',
        background: '#eef2ff',
        border: '#c7d2fe',
    },
    creative: {
        name: 'Creative',
        accent: '#7c3aed',
        background: '#f5f3ff',
        border: '#ddd6fe',
    },
    classic: {
        name: 'Classic',
        accent: '#047857',
        background: '#ecfdf5',
        border: '#a7f3d0',
    },
    elegant: {
        name: 'Elegant',
        accent: '#e11d48',
        background: '#fff1f2',
        border: '#fecdd3',
    },
}

function formatDate(value?: string) {
    if (!value) return 'Not set'

    const date = new Date(`${value}T00:00:00`)

    if (Number.isNaN(date.getTime())) return 'Not set'

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function InvoicePreview({
    templateId = 'modern',
    clientName,
    invoiceNumber,
    amount,
    currency = 'USD',
    issueDate,
    dueDate,
    notes,
}: InvoicePreviewProps) {
    const design = designs[templateId] ?? designs.modern

    const parsedAmount =
        amount === '' || amount === undefined || amount === null
            ? 0
            : Number(amount)

    const safeAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0

    const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'USD'

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: safeCurrency,
    }).format(safeAmount)

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Live Invoice Preview
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {design.name} design
                    </p>
                </div>
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: design.background }}
                >
                    <FileText size={20} style={{ color: design.accent }} />
                </div>
            </div>

            <div className="bg-slate-100 p-3 sm:p-5">
                <article
                    className="mx-auto max-w-[520px] overflow-hidden rounded-lg bg-white shadow-sm"
                    style={{ border: `1px solid ${design.border}`, color: '#0f172a' }}
                >
                    <div
                        className="px-5 py-7 sm:px-8"
                        style={{
                            backgroundColor: design.background,
                            borderBottom: `3px solid ${design.accent}`,
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p
                                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                                    style={{ color: design.accent }}
                                >
                                    INVOICE
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    PAYMENT CHASER
                                </p>
                            </div>
                            <Receipt size={30} style={{ color: design.accent }} />
                        </div>

                        <div className="mt-7">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Invoice Number
                            </p>
                            <p className="mt-1 break-all text-sm font-semibold">
                                {invoiceNumber?.trim() || 'INV-001'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 px-5 py-6 sm:px-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Bill To</p>
                                <p className="mt-2 break-words text-sm font-semibold">
                                    {clientName?.trim() || 'Client name'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Total Due</p>
                                <p
                                    className="mt-2 break-all text-xl font-bold sm:text-2xl"
                                    style={{ color: design.accent }}
                                >
                                    {formattedAmount}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-slate-200 p-3">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <CalendarDays size={14} />
                                    <span className="text-xs">Issue Date</span>
                                </div>
                                <p className="mt-2 text-xs font-medium sm:text-sm">
                                    {formatDate(issueDate)}
                                </p>
                            </div>

                            <div
                                className="rounded-lg p-3"
                                style={{
                                    backgroundColor: design.background,
                                    border: `1px solid ${design.border}`,
                                }}
                            >
                                <div className="flex items-center gap-2 text-slate-600">
                                    <CalendarDays size={14} style={{ color: design.accent }} />
                                    <span className="text-xs">Due Date</span>
                                </div>
                                <p className="mt-2 text-xs font-semibold sm:text-sm">
                                    {formatDate(dueDate)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div
                                className="grid grid-cols-[1fr_auto] gap-3 border-b-2 px-3 py-3 text-xs font-semibold"
                                style={{ borderColor: design.accent, color: design.accent }}
                            >
                                <span>Description</span>
                                <span>Amount</span>
                            </div>

                            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 px-3 py-4">
                                <div>
                                    <p className="text-sm font-medium">Services</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Invoice payment
                                    </p>
                                </div>
                                <p className="text-sm font-semibold">{formattedAmount}</p>
                            </div>

                            <div className="flex justify-between gap-3 px-3 py-4">
                                <span className="text-sm font-semibold">Total</span>
                                <span
                                    className="text-base font-bold"
                                    style={{ color: design.accent }}
                                >
                                    {formattedAmount}
                                </span>
                            </div>
                        </div>

                        {notes?.trim() && (
                            <div
                                className="rounded-lg p-3"
                                style={{ backgroundColor: design.background }}
                            >
                                <p className="text-xs font-semibold">Notes</p>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
                                    {notes}
                                </p>
                            </div>
                        )}

                        <div className="border-t border-slate-200 pt-4 text-center">
                            <p className="text-xs text-slate-500">
                                Thank you for your business!
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    )
}