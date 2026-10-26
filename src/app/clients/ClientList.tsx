/**
 * @file src/app/clients/ClientList.tsx
 * @description Interactive client list connected to getClients Server Action.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'

import { getClients } from '@/app/actions/clients'
import { useClients } from '@/lib/mock/use-mock-data'
import { CurrencyText } from '@/components/shared/CurrencyText'
import { ChannelIcons } from '@/components/shared/ChannelIcons'
import { Input } from '@/components/ui/input'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { Client } from '@/types'

export function ClientList() {
    const isMockLocal = USE_MOCK && !isSupabaseConfigured()
    const mockStoreClients = useClients()

    const [search, setSearch] = useState('')
    const [dbClients, setDbClients] = useState<Client[] | null>(null)
    const [loading, setLoading] = useState(!isMockLocal)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        if (isMockLocal) return

        let isCancelled = false
        getClients().then((res) => {
            if (isCancelled) return
            setLoading(false)
            if (res.ok) {
                setDbClients(res.data)
            } else {
                setFetchError(res.error)
            }
        })

        return () => {
            isCancelled = true
        }
    }, [isMockLocal])

    const clients = useMemo(() => {
        if (isMockLocal) return mockStoreClients
        return dbClients || []
    }, [isMockLocal, mockStoreClients, dbClients])

    const filteredClients = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) {
            return clients
        }

        return clients.filter((client) => {
            return (
                client.name.toLowerCase().includes(query) ||
                client.email?.toLowerCase().includes(query) ||
                client.whatsappNumber?.includes(query)
            )
        })
    }, [search, clients])

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                    <Search
                        size={18}
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search clients..."
                        className="pl-10"
                        aria-label="Search clients"
                    />
                </div>

                <Link
                    href="/clients/new"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Client</span>
                </Link>
            </div>

            {fetchError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    {fetchError}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                        <thead className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Preferred Channel
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                                    Invoices
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                                    Outstanding
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <Users
                                            size={36}
                                            className="mx-auto text-slate-300 dark:text-slate-600"
                                        />
                                        <p className="mt-3 font-semibold text-foreground">
                                            No clients found
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {search
                                                ? 'No clients matched your search term.'
                                                : 'Add your first client to start creating invoices.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-foreground">
                                                {client.name}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-sm">
                                                {client.email && (
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        {client.email}
                                                    </p>
                                                )}

                                                {client.whatsappNumber && (
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        {client.whatsappNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <ChannelIcons
                                                channels={[client.preferredChannel]}
                                            />
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {client.invoiceCount ?? 0}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <CurrencyText
                                                amount={client.outstandingAmount ?? 0}
                                                currency="USD"
                                                className="font-semibold text-foreground"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}