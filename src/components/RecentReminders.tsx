/**
 * @file src/components/RecentReminders.tsx
 * @description Dashboard section showing recent reminder activity.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import {
    ArrowRight,
    CheckCircle2,
    Mail,
    MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

const reminders = [
    {
        id: 'REM-001',
        clientName: 'Demo Client',
        channel: 'Email',
        status: 'Delivered',
        sentAt: 'Today, 10:30 AM',
    },
    {
        id: 'REM-002',
        clientName: 'Sample Client',
        channel: 'WhatsApp',
        status: 'Sent',
        sentAt: 'Yesterday, 3:15 PM',
    },
]

export function RecentReminders() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Recent Reminders
                    </h2>

                    <p className="mt-1 text-sm text-foreground">
                        Latest automated payment reminder activity.
                    </p>
                </div>

                <Link
                    href="/invoices"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    View all
                    <ArrowRight
                        size={16}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <div className="rounded-lg border border-border bg-background">
                <div className="divide-y divide-border">
                    {reminders.map((reminder) => (
                        <div
                            key={reminder.id}
                            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                                    {reminder.channel === 'Email' ? (
                                        <Mail
                                            size={20}
                                            strokeWidth={1.75}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <MessageCircle
                                            size={20}
                                            strokeWidth={1.75}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium text-foreground">
                                        {reminder.clientName}
                                    </p>

                                    <p className="mt-1 text-sm text-foreground">
                                        {reminder.channel} · {reminder.id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:text-right">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {reminder.status}
                                    </p>

                                    <p className="mt-1 text-xs text-foreground">
                                        {reminder.sentAt}
                                    </p>
                                </div>

                                <CheckCircle2
                                    size={20}
                                    strokeWidth={1.75}
                                    className="text-success"
                                    aria-label="Reminder successful"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}