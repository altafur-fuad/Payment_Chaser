'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { mockClients } from '@/lib/mock/clients'
import { CurrencyText } from '@/components/shared/CurrencyText'
import { ChannelIcons } from '@/components/shared/ChannelIcons'
import { Input } from '@/components/ui/input'

export function ClientList() {
    const [search, setSearch] = useState('')

    const filteredClients = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) {
            return mockClients
        }

        return mockClients.filter((client) => {
            return (
                client.name.toLowerCase().includes(query) ||
                client.email?.toLowerCase().includes(query) ||
                client.whatsappNumber?.includes(query)
            )
        })
    }, [search])

    return (
        <div className="space-y-4">
            <div className="relative max-w-md">
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

            <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                                    Channel
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
                            {filteredClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-foreground">
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

                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {client.invoiceCount ?? 0}
                                    </td>

                                    <td className="px-6 py-4 text-right font-medium text-foreground">
                                        <CurrencyText
                                            amount={client.outstandingAmount ?? 0}
                                            currency="USD"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredClients.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm font-medium text-foreground">
                            No clients found
                        </p>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Try a different search term.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}