/**
 * @file src/app/invoices/InvoiceList.tsx
 * @description Interactive invoice list with Server Action query, search, and status filters.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Plus,
    Search,
    X,
} from 'lucide-react'

import { getInvoices } from '@/app/actions/invoices'
import { useInvoices } from '@/lib/mock/use-mock-data'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { InvoiceListResult } from '@/types'

const PAGE_SIZE = 6

type StatusFilter = 'all' | 'pending' | 'paid' | 'overdue'
type DateFilter = 'all' | 'this-month'

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

function formatAmount(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 2,
        }).format(amount)
    } catch {
        return `${currency || 'USD'} ${amount.toLocaleString('en-US')}`
    }
}

function getStatusClasses(status: string): string {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
        case 'overdue':
            return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20'
        case 'pending':
        default:
            return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20'
    }
}

function getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1)
}

export function InvoiceList() {
    const isMockLocal = USE_MOCK && !isSupabaseConfigured()
    const mockStoreInvoices = useInvoices()

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)

    const [dbResult, setDbResult] = useState<InvoiceListResult | null>(null)
    const [loading, setLoading] = useState(!isMockLocal)
    const [fetchError, setFetchError] = useState<string | null>(null)

    // Query database via Server Action when connected
    useEffect(() => {
        if (isMockLocal) return

        let isCancelled = false

        getInvoices({
            status: statusFilter,
            search: search.trim() || undefined,
            page: currentPage,
            pageSize: PAGE_SIZE,
        }).then((res) => {
            if (isCancelled) return
            setLoading(false)
            if (res.ok) {
                setDbResult(res.data)
            } else {
                setFetchError(res.error)
            }
        })

        return () => {
            isCancelled = true
        }
    }, [isMockLocal, search, statusFilter, currentPage])

    // Fallback/compute for mock local mode
    const invoices = useMemo(() => {
        if (isMockLocal) {
            return mockStoreInvoices
        }
        return dbResult?.items || []
    }, [isMockLocal, mockStoreInvoices, dbResult])

    const counts = useMemo(() => {
        if (isMockLocal) {
            return {
                all: mockStoreInvoices.length,
                pending: mockStoreInvoices.filter((i) => i.status === 'pending').length,
                paid: mockStoreInvoices.filter((i) => i.status === 'paid').length,
                overdue: mockStoreInvoices.filter((i) => i.status === 'overdue').length,
            }
        }
        return (
            dbResult?.counts || {
                all: 0,
                pending: 0,
                paid: 0,
                overdue: 0,
            }
        )
    }, [isMockLocal, mockStoreInvoices, dbResult])

    const filteredInvoices = useMemo(() => {
        if (!isMockLocal) {
            return invoices
        }

        const normalizedSearch = search.trim().toLowerCase()
        const now = new Date()

        return mockStoreInvoices.filter((invoice) => {
            const matchesSearch =
                !normalizedSearch ||
                invoice.invoiceNumber.toLowerCase().includes(normalizedSearch) ||
                invoice.clientName.toLowerCase().includes(normalizedSearch) ||
                invoice.id.toLowerCase().includes(normalizedSearch) ||
                String(invoice.amount).includes(normalizedSearch)

            const matchesStatus =
                statusFilter === 'all' || invoice.status === statusFilter

            const issueDate = new Date(
                `${invoice.issueDate.slice(0, 10)}T00:00:00`
            )

            const matchesDate =
                dateFilter === 'all' ||
                (issueDate.getMonth() === now.getMonth() &&
                    issueDate.getFullYear() === now.getFullYear())

            return matchesSearch && matchesStatus && matchesDate
        })
    }, [isMockLocal, mockStoreInvoices, invoices, search, statusFilter, dateFilter])

    const totalPages = isMockLocal
        ? Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE))
        : Math.max(1, Math.ceil((dbResult?.total || 0) / PAGE_SIZE))

    const safePage = Math.min(currentPage, totalPages)

    const paginatedInvoices = useMemo(() => {
        if (!isMockLocal) {
            return invoices
        }
        const startIndex = (safePage - 1) * PAGE_SIZE
        return filteredInvoices.slice(startIndex, startIndex + PAGE_SIZE)
    }, [isMockLocal, invoices, filteredInvoices, safePage])

    const totalCount = isMockLocal ? filteredInvoices.length : dbResult?.total || 0
    const startItem = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
    const endItem = isMockLocal
        ? Math.min(safePage * PAGE_SIZE, filteredInvoices.length)
        : Math.min(safePage * PAGE_SIZE, totalCount)

    function clearFilters() {
        setSearch('')
        setStatusFilter('all')
        setDateFilter('all')
        setCurrentPage(1)
    }

    return (
        <section className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                    type="button"
                    onClick={() => {
                        setStatusFilter('all')
                        setCurrentPage(1)
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                        statusFilter === 'all'
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                >
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        All invoices
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {counts.all}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setStatusFilter('pending')
                        setCurrentPage(1)
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                        statusFilter === 'pending'
                            ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                >
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Pending
                    </p>
                    <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {counts.pending}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setStatusFilter('paid')
                        setCurrentPage(1)
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                        statusFilter === 'paid'
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                >
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Paid
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {counts.paid}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setStatusFilter('overdue')
                        setCurrentPage(1)
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                        statusFilter === 'overdue'
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                >
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Overdue
                    </p>
                    <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {counts.overdue}
                    </p>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                <div className="relative flex-1">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search by invoice #, client, or amount..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => {
                            setDateFilter(e.target.value as DateFilter)
                            setCurrentPage(1)
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">All dates</option>
                        <option value="this-month">This month</option>
                    </select>

                    <Link
                        href="/invoices/new"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <Plus size={16} />
                        <span>Create invoice</span>
                    </Link>
                </div>
            </div>

            {/* Error notice */}
            {fetchError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    {fetchError}
                </div>
            )}

            {/* Invoices Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Invoice
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Client
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Amount
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Due date
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Status
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Channels
                                </th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : paginatedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <FileText
                                            size={36}
                                            className="mx-auto text-slate-300 dark:text-slate-600"
                                        />
                                        <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                                            No invoices found
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {search || statusFilter !== 'all'
                                                ? 'Try clearing your search or status filters.'
                                                : 'Get started by creating your first invoice.'}
                                        </p>
                                        {(search || statusFilter !== 'all') && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="mt-3 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                Reset all filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {invoice.invoiceNumber}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        Issued{' '}
                                                        {formatDate(invoice.issueDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                {invoice.clientName || 'Unknown client'}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatAmount(
                                                    invoice.amount,
                                                    invoice.currency
                                                )}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                                {formatDate(invoice.dueDate)}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                    invoice.status
                                                )}`}
                                            >
                                                {getStatusLabel(invoice.status)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex max-w-40 flex-wrap gap-1.5">
                                                {invoice.channels?.length ? (
                                                    invoice.channels.map(
                                                        (channel, index) => (
                                                            <span
                                                                key={`${invoice.id}-${channel}-${index}`}
                                                                className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                            >
                                                                {String(channel)}
                                                            </span>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <Link
                                                href={`/invoices/${invoice.id}`}
                                                aria-label={`View invoice ${invoice.invoiceNumber}`}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                            >
                                                <Eye size={17} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                        <p>
                            Showing <span className="font-semibold">{startItem}</span> to{' '}
                            <span className="font-semibold">{endItem}</span> of{' '}
                            <span className="font-semibold">{totalCount}</span> invoices
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={safePage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span>
                                Page {safePage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={safePage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}