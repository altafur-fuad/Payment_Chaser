'use client'

/**
 * @file src/app/invoices/[id]/edit/page.tsx
 * @description Edit invoice details connected to updateInvoice Server Action.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
} from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { getInvoiceById, updateInvoice } from '@/app/actions/invoices'
import { getClients } from '@/app/actions/clients'
import { getAllClients, getInvoiceById as getMockInvoiceById } from '@/lib/mock/storage'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { Client, Invoice } from '@/types'

export default function EditInvoicePage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const invoiceId = params.id

    const isMockLocal = USE_MOCK && !isSupabaseConfigured()

    const initialMockInvoice = useMemo(() => {
        if (isMockLocal && invoiceId) {
            return getMockInvoiceById(invoiceId) || null
        }
        return null
    }, [isMockLocal, invoiceId])

    const [clients, setClients] = useState<Client[]>(() => isMockLocal ? getAllClients() : [])
    const [invoice, setInvoice] = useState<Invoice | null>(initialMockInvoice)
    const [loading, setLoading] = useState(!isMockLocal)

    const [invoiceNumber, setInvoiceNumber] = useState(initialMockInvoice?.invoiceNumber || '')
    const [clientId, setClientId] = useState(initialMockInvoice?.clientId || '')
    const [amount, setAmount] = useState(initialMockInvoice ? String(initialMockInvoice.amount) : '')
    const [currency, setCurrency] = useState(initialMockInvoice?.currency || 'USD')
    const [issueDate, setIssueDate] = useState(initialMockInvoice?.issueDate || '')
    const [dueDate, setDueDate] = useState(initialMockInvoice?.dueDate || '')
    const [notes, setNotes] = useState(initialMockInvoice?.notes || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isMockLocal) return

        let isCancelled = false

        Promise.all([
            getInvoiceById(invoiceId),
            getClients(),
        ]).then(([invRes, clientsRes]) => {
            if (isCancelled) return
            setLoading(false)

            if (clientsRes.ok) {
                setClients(clientsRes.data)
            }

            if (invRes.ok && invRes.data) {
                const inv = invRes.data
                setInvoice(inv)
                setInvoiceNumber(inv.invoiceNumber)
                setClientId(inv.clientId)
                setAmount(String(inv.amount))
                setCurrency(inv.currency)
                setIssueDate(inv.issueDate)
                setDueDate(inv.dueDate)
                setNotes(inv.notes || '')
            }
        })

        return () => {
            isCancelled = true
        }
    }, [isMockLocal, invoiceId])

    async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
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

        const client = clients.find((item) => item.id === clientId)
        if (!client) {
            setError('Please select a valid client.')
            return
        }

        setSaving(true)
        setError('')

        const res = await updateInvoice(invoice.id, {
            invoiceNumber: invoiceNumber.trim(),
            clientId,
            amount: Number(amount),
            currency,
            issueDate,
            dueDate,
            notes: notes.trim() || undefined,
        })

        setSaving(false)

        if (!res.ok) {
            setError(res.error)
            return
        }

        router.push(`/invoices/${invoice.id}`)
        router.refresh()
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar />
                    <main className="flex-1 p-8 text-center text-slate-500">
                        Loading invoice data...
                    </main>
                </div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar />
                    <main className="flex-1 p-8 text-center text-slate-500">
                        <p>Invoice not found.</p>
                        <Link href="/invoices" className="mt-4 inline-block text-blue-600 underline">
                            Back to invoices
                        </Link>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-4xl space-y-6">
                        <Link
                            href={`/invoices/${invoice.id}`}
                            className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        >
                            <ArrowLeft size={17} aria-hidden="true" />
                            Back to Invoice
                        </Link>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit Invoice {invoice.invoiceNumber}
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update invoice details. Changes will persist directly to your account.
                            </p>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="invoiceNumber"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Invoice Number
                                    </label>
                                    <input
                                        id="invoiceNumber"
                                        type="text"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="client"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Client
                                    </label>
                                    <select
                                        id="client"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    >
                                        <option value="">Select a client</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="amount"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Amount
                                    </label>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="block flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="BDT">BDT</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="issueDate"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Issue Date
                                    </label>
                                    <input
                                        id="issueDate"
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="dueDate"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Due Date
                                    </label>
                                    <input
                                        id="dueDate"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="notes"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="Add any internal payment notes..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link
                                    href={`/invoices/${invoice.id}`}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    )
}