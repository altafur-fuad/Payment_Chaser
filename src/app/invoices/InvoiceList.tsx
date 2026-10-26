/**
 * @file src/app/invoices/InvoiceList.tsx
 * @description Interactive invoice list with search and status filters.
 * @phase 5
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Plus,
    Search,
    X,
} from 'lucide-react'

import { useInvoices } from '@/lib/mock/use-mock-data'

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
    const invoices = useInvoices()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>('all')
    const [dateFilter, setDateFilter] =
        useState<DateFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)

    const counts = useMemo(() => {
        return {
            all: invoices.length,
            pending: invoices.filter(
                (invoice) => invoice.status === 'pending',
            ).length,
            paid: invoices.filter(
                (invoice) => invoice.status === 'paid',
            ).length,
            overdue: invoices.filter(
                (invoice) => invoice.status === 'overdue',
            ).length,
        }
    }, [invoices])

    const filteredInvoices = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()
        const now = new Date()

        return invoices.filter((invoice) => {
            const matchesSearch =
                !normalizedSearch ||
                invoice.invoiceNumber
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                invoice.clientName
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                invoice.id.toLowerCase().includes(normalizedSearch) ||
                String(invoice.amount).includes(normalizedSearch)

            const matchesStatus =
                statusFilter === 'all' ||
                invoice.status === statusFilter

            const issueDate = new Date(
                `${invoice.issueDate.slice(0, 10)}T00:00:00`,
            )

            const matchesDate =
                dateFilter === 'all' ||
                (issueDate.getMonth() === now.getMonth() &&
                    issueDate.getFullYear() === now.getFullYear())

            return matchesSearch && matchesStatus && matchesDate
        })
    }, [invoices, search, statusFilter, dateFilter])

    const totalPages = Math.max(
        1,
        Math.ceil(filteredInvoices.length / PAGE_SIZE),
    )

    const safePage = Math.min(currentPage, totalPages)

    const paginatedInvoices = useMemo(() => {
        const startIndex = (safePage - 1) * PAGE_SIZE

        return filteredInvoices.slice(
            startIndex,
            startIndex + PAGE_SIZE,
        )
    }, [filteredInvoices, safePage])

    const startItem =
        filteredInvoices.length === 0
            ? 0
            : (safePage - 1) * PAGE_SIZE + 1

    const endItem = Math.min(
        safePage * PAGE_SIZE,
        filteredInvoices.length,
    )

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

            {/* Search and filters */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search invoice or client..."
                        aria-label="Search invoices"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(
                                    event.target.value as StatusFilter,
                                )
                                setCurrentPage(1)
                            }}
                            aria-label="Filter by status"
                            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:w-40"
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    <div className="relative">
                        <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                            value={dateFilter}
                            onChange={(event) => {
                                setDateFilter(
                                    event.target.value as DateFilter,
                                )
                                setCurrentPage(1)
                            }}
                            aria-label="Filter by issue date"
                            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:w-40"
                        >
                            <option value="all">All dates</option>
                            <option value="this-month">This month</option>
                        </select>
                    </div>

                    {(search ||
                        statusFilter !== 'all' ||
                        dateFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <X size={16} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Invoice table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Invoice list
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Track invoices and outstanding payments.
                        </p>
                    </div>

                    <Link
                        href="/invoices/new"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        <Plus size={17} />
                        New Invoice
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950/60">
                            <tr className="border-b border-slate-200 dark:border-slate-800">
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
                            {paginatedInvoices.map((invoice) => (
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
                                                invoice.currency,
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
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(invoice.status)}`}
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
                                                    ),
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
                                            title="View invoice"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                        >
                                            <Eye size={17} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {paginatedInvoices.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-14 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                            <Search
                                                size={21}
                                                className="text-slate-400"
                                            />
                                        </div>
                                        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            No invoices found
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Try changing your search or filters.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            Clear filters
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                            {startItem}-{endItem}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                            {filteredInvoices.length}
                        </span>{' '}
                        invoices
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.max(1, page - 1),
                                )
                            }
                            disabled={safePage <= 1}
                            aria-label="Previous page"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="min-w-20 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                            Page {safePage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1),
                                )
                            }
                            disabled={safePage >= totalPages}
                            aria-label="Next page"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}