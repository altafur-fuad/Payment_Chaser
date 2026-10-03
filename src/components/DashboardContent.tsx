/**
 * @file src/components/DashboardContent.tsx
 * @description Dashboard overview content with payment statistics and invoice sections.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { NeedsAttention } from '@/components/NeedsAttention'
import { UpcomingInvoices } from '@/components/UpcomingInvoices'
import { RecentReminders } from '@/components/RecentReminders'

import { StatCard } from '@/components/dashboard/StatCard'

export function DashboardContent() {
    return (
        <section className="space-y-8 p-6 md:p-8">
            <div>
                <h2 className="text-2xl font-semibold text-foreground">
                    Overview
                </h2>

                <p className="mt-1 text-sm text-muted">
                    Keep track of your invoices, payments, and reminders.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Outstanding"
                    value="$0.00"
                    description="Unpaid invoice amount"
                />

                <StatCard
                    label="Total Overdue"
                    value="$0.00"
                    description="Past due invoice amount"
                />

                <StatCard
                    label="Paid This Month"
                    value="$0.00"
                    description="Payments received this month"
                />

                <StatCard
                    label="Reminders Sent This Week"
                    value="0"
                    description="Automated reminders sent"
                />
            </div>

            <NeedsAttention />

            <UpcomingInvoices />
            <RecentReminders/>
        </section>
    )
}