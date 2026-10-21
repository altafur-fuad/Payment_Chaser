'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Loader2,
    Save,
} from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { getAllInvoices, saveInvoice } from '@/lib/mock/invoice-storage'
import { mockClients } from '@/lib/mock/clients'
import type { Invoice } from '@/types'

export default function EditInvoicePage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const invoiceId = params.id

    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [clientId, setClientId] = useState('')
    const [amount, setAmount] = useState('')
    const [currency, setCurrency] = useState('USD')
    const [issueDate, setIssueDate] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        try {
            const found = getAllInvoices().find(
                (item) => item.id === invoiceId,
            )

            if (!found) {
                setError('Invoice not found.')
                return
            }

            setInvoice(found)
            setInvoiceNumber(found.invoiceNumber)
            setClientId(found.clientId)
            setAmount(String(found.amount))
            setCurrency(found.currency)
            setIssueDate(found.issueDate)
            setDueDate(found.dueDate)
            setNotes(found.notes ?? '')
        } catch {
            setError('Unable to load invoice data.')
        } finally {
            setLoading(false)
        }
    }, [invoiceId])

    function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!invoice) return

        if (
            !invoiceNumber.trim() ||
            !clientId ||
            !amount ||
            Number(amount) <= 0 ||
            !issueDate ||
            !dueDate
        ) {
            setError('Please complete all required fields.')
            return
        }

        if (dueDate < issueDate) {
            setError('Due date cannot be earlier than issue date.')
            return
        }

        setSaving(true)
        setError('')

        try {
            const client = mockClients.find(
                (item) => item.id === clientId,
            )

            if (!client) {
                setError('Please select a valid client.')
                setSaving(false)
                return
            }

            const today = new Date().toISOString().split('T')[0]
            const daysOverdue =
                dueDate < today
                    ? Math.floor(
                          (new Date(today).getTime() -
                              new Date(dueDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                      )
                    : 0

            const updatedInvoice: Invoice = {
                ...invoice,
                invoiceNumber: invoiceNumber.trim(),
                clientId,
                clientName: client.name,
                amount: Number(amount),
                currency,
                issueDate,
                dueDate,
                notes: notes.trim() || null,
                status:
                    invoice.status === 'paid'
                        ? 'paid'
                        : dueDate < today
                          ? 'overdue'
                          : 'pending',
                daysOverdue:
                    invoice.status === 'paid' ? 0 : daysOverdue,
            }

            saveInvoice(updatedInvoice)
            router.push('/invoices')
            router.refresh()
        } catch {
            setError('Failed to update invoice. Please try again.')
            setSaving(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-4xl space-y-6">
                        <Link
                            href="/invoices"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} />
                            Back to Invoices
                        </Link>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Edit Invoice
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update invoice information and save your changes.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 dark:border-slate-700 dark:bg-slate-900">
                                <Loader2 className="animate-spin" />
                                <span className="ml-2">Loading invoice...</span>
                            </div>
                        ) : !invoice ? (
                            <div className="rounded-xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-slate-900">
                                <p className="font-semibold text-red-600">
                                    {error || 'Invoice not found.'}
                                </p>
                                <Link
                                    href="/invoices"
                                    className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    Return to Invoices
                                </Link>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleUpdate}
                                className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8"
                            >
                                {error && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                                    >
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="invoiceNumber"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Invoice Number *
                                        </label>
                                        <input
                                            id="invoiceNumber"
                                            value={invoiceNumber}
                                            onChange={(event) =>
                                                setInvoiceNumber(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="clientId"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Client *
                                        </label>
                                        <select
                                            id="clientId"
                                            value={clientId}
                                            onChange={(event) =>
                                                setClientId(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="">
                                                Select client
                                            </option>
                                            {mockClients.map((client) => (
                                                <option
                                                    key={client.id}
                                                    value={client.id}
                                                >
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="amount"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Amount *
                                        </label>
                                        <input
                                            id="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={amount}
                                            onChange={(event) =>
                                                setAmount(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="currency"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Currency *
                                        </label>
                                        <select
                                            id="currency"
                                            value={currency}
                                            onChange={(event) =>
                                                setCurrency(event.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="BDT">BDT (৳)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="issueDate"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Issue Date *
                                        </label>
                                        <input
                                            id="issueDate"
                                            type="date"
                                            value={issueDate}
                                            onChange={(event) =>
                                                setIssueDate(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="dueDate"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Due Date *
                                        </label>
                                        <input
                                            id="dueDate"
                                            type="date"
                                            min={issueDate || undefined}
                                            value={dueDate}
                                            onChange={(event) =>
                                                setDueDate(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="notes"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                    >
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={4}
                                        value={notes}
                                        onChange={(event) =>
                                            setNotes(event.target.value)
                                        }
                                        placeholder="Add invoice notes..."
                                        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:justify-end">
                                    <Link
                                        href="/invoices"
                                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        {saving ? 'Updating...' : 'Update Invoice'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    )
}