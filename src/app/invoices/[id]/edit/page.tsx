'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
} from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import {
    getInvoiceById,
    saveInvoice,
    getAllClients,
    isInvoiceNumberTaken,
} from '@/lib/mock/storage'
import type { Invoice } from '@/types'

export default function EditInvoicePage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const invoiceId = params.id

    const clients = useMemo(() => getAllClients(), [])
    const initialInvoice = useMemo(() => {
        if (!invoiceId) return undefined
        return getInvoiceById(invoiceId)
    }, [invoiceId])

    const [invoiceNumber, setInvoiceNumber] = useState(
        () => initialInvoice?.invoiceNumber ?? '',
    )
    const [clientId, setClientId] = useState(
        () => initialInvoice?.clientId ?? '',
    )
    const [amount, setAmount] = useState(
        () => (initialInvoice ? String(initialInvoice.amount) : ''),
    )
    const [currency, setCurrency] = useState(
        () => initialInvoice?.currency ?? 'USD',
    )
    const [issueDate, setIssueDate] = useState(
        () => initialInvoice?.issueDate ?? '',
    )
    const [dueDate, setDueDate] = useState(
        () => initialInvoice?.dueDate ?? '',
    )
    const [notes, setNotes] = useState(
        () => initialInvoice?.notes ?? '',
    )
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!initialInvoice) return

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

        if (isInvoiceNumberTaken(invoiceNumber, initialInvoice.id)) {
            setError(
                'This invoice number is already in use by another invoice. Please choose a different number.',
            )
            return
        }

        const client = clients.find((item) => item.id === clientId)
        if (!client) {
            setError('Please select a valid client.')
            return
        }

        setSaving(true)
        setError('')

        try {
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
                ...initialInvoice,
                invoiceNumber: invoiceNumber.trim(),
                clientId,
                clientName: client.name,
                amount: Number(amount),
                currency,
                issueDate,
                dueDate,
                notes: notes.trim() || null,
                status:
                    initialInvoice.status === 'paid'
                        ? 'paid'
                        : dueDate < today
                          ? 'overdue'
                          : 'pending',
                daysOverdue:
                    initialInvoice.status === 'paid' ? 0 : daysOverdue,
            }

            saveInvoice(updatedInvoice)
            router.push(`/invoices/${initialInvoice.id}`)
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
                            href={
                                initialInvoice
                                    ? `/invoices/${initialInvoice.id}`
                                    : '/invoices'
                            }
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} />
                            {initialInvoice
                                ? 'Back to Invoice'
                                : 'Back to Invoices'}
                        </Link>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Edit Invoice
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update invoice information and save your changes.
                            </p>
                        </div>

                        {!initialInvoice ? (
                            <div className="rounded-xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-slate-900">
                                <p className="font-semibold text-red-600">
                                    Invoice not found.
                                </p>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    The invoice you are trying to edit does not exist
                                    or may have been removed.
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
                                            {clients.map((client) => (
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
                                            step="0.01"
                                            min="0.01"
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
                                            <option value="USD">
                                                USD — US Dollar
                                            </option>
                                            <option value="BDT">
                                                BDT — Bangladeshi Taka
                                            </option>
                                            <option value="EUR">
                                                EUR — Euro
                                            </option>
                                            <option value="GBP">
                                                GBP — British Pound
                                            </option>
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
                                        placeholder="Add any notes about this invoice..."
                                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <Link
                                        href={
                                            initialInvoice
                                                ? `/invoices/${initialInvoice.id}`
                                                : '/invoices'
                                        }
                                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}