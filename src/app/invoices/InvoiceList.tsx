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
import { Search } from 'lucide-react'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { ChannelIcons } from '@/components/shared/ChannelIcons'
import { CurrencyText } from '@/components/shared/CurrencyText'
import { mockInvoices } from '@/lib/mock/invoices'
import type { InvoiceStatus } from '@/types'

type FilterStatus = 'all' | InvoiceStatus

const filters: {
    label: string
    value: FilterStatus
}[] = [
    {
        label: 'All',
        value: 'all',
    },
    {
        label: 'Pending',
        value: 'pending',
    },
    {
        label: 'Paid',
        value: 'paid',
    },
    {
        label: 'Overdue',
        value: 'overdue',
    },
]

export function InvoiceList() {
    const [search, setSearch] = useState('')
    const [status, setStatus] =
        useState<FilterStatus>('all')

    const counts = useMemo(() => {
        return {
            all: mockInvoices.length,
            pending: mockInvoices.filter(
                (invoice) => invoice.status === 'pending',
            ).length,
            paid: mockInvoices.filter(
                (invoice) => invoice.status === 'paid',
            ).length,
            overdue: mockInvoices.filter(
                (invoice) => invoice.status === 'overdue',
            ).length,
        }
    }, [])

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase()

        return mockInvoices.filter((invoice) => {
            const matchesStatus =
                status === 'all' ||
                invoice.status === status

            const matchesSearch =
                query === '' ||
                invoice.invoiceNumber
                    .toLowerCase()
                    .includes(query) ||
                invoice.clientName
                    .toLowerCase()
                    .includes(query)

            return matchesStatus && matchesSearch
        })
    }, [search, status])

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search
                        size={18}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 "
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search invoice or client..."
                        aria-label="Search invoices"
                        className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary"
                    />
                </div>

                <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Invoice status filter"
                >
                    {filters.map((filter) => {
                        const isActive =
                            status === filter.value

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() =>
                                    setStatus(
                                        filter.value,
                                    )
                                }
                                className={[
                                    'min-h-10 rounded-md border px-3 text-sm font-medium transition-colors duration-150',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    isActive
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background text-foreground hover:bg-surface',
                                ].join(' ')}
                            >
                                {filter.label}

                                <span className="ml-1.5 opacity-80">
                                    {counts[filter.value]}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-background">
                {filteredInvoices.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm font-medium text-foreground">
                            No invoices found
                        </p>

                        <p className="mt-1 text-sm ">
                            Try a different search or status filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead className="border-b border-border bg-surface">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide ">
                                            Invoice
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide ">
                                            Client
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide ">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide ">
                                            Due Date
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide ">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide ">
                                            Channels
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {filteredInvoices.map(
                                        (invoice) => (
                                            <tr
                                                key={
                                                    invoice.id
                                                }
                                                className="transition-colors duration-150 hover:bg-surface"
                                            >
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={`/invoices/${invoice.id}`}
                                                        className="font-mono text-sm font-medium text-primary hover:underline"
                                                    >
                                                        {
                                                            invoice.invoiceNumber
                                                        }
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {
                                                            invoice.clientName
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <CurrencyText
                                                        amount={
                                                            invoice.amount
                                                        }
                                                        currency={
                                                            invoice.currency
                                                        }
                                                        className="text-sm text-foreground"
                                                    />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-foreground">
                                                        {
                                                            invoice.dueDate
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        status={
                                                            invoice.status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <ChannelIcons
                                                        channels={
                                                            invoice.channels
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-border px-6 py-4">
                            <p className="text-sm ">
                                Showing{' '}
                                {
                                    filteredInvoices.length
                                }{' '}
                                of{' '}
                                {mockInvoices.length}{' '}
                                invoices
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}