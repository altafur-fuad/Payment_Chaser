'use client'

/**
 * @file src/components/DashboardContent.tsx
 * @description Dynamic Payment Chaser dashboard overview backed by unified mock storage.
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    BellRing,
    CircleDollarSign,
    Clock3,
    CreditCard,
    FilePlus2,
    LayoutDashboard,
    RefreshCw,
} from 'lucide-react'

import {
    getDashboardStats,
    getNeedsAttention,
    getUpcomingInvoices,
    getRecentActivity,
} from '@/app/actions/dashboard'
import { useInvoices } from '@/lib/mock/use-mock-data'
import { calculateDashboardStats, type ReminderActivityItem } from '@/lib/mock/storage'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { DashboardStats, NeedsAttentionItem, UpcomingInvoice } from '@/types'
import { NeedsAttention } from '@/components/NeedsAttention'
import { UpcomingInvoices } from '@/components/UpcomingInvoices'
import { RecentReminders } from '@/components/RecentReminders'

function formatCurrency(amount: number, currency: string = 'USD'): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 2,
        }).format(amount)
    } catch {
        return `$${amount.toFixed(2)}`
    }
}

export function DashboardContent() {
    const isMockLocal = USE_MOCK && !isSupabaseConfigured()
    const mockInvoices = useInvoices()
    const mockStatsData = useMemo(
        () => calculateDashboardStats(mockInvoices),
        [mockInvoices],
    )

    const [statsData, setStatsData] = useState<DashboardStats | null>(null)
    const [attentionItems, setAttentionItems] = useState<NeedsAttentionItem[]>([])
    const [upcomingItems, setUpcomingItems] = useState<UpcomingInvoice[]>([])
    const [recentActivity, setRecentActivity] = useState<ReminderActivityItem[]>([])
    const [loading, setLoading] = useState(!isMockLocal)
    const [error, setError] = useState<string | null>(null)

    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        if (isMockLocal) return

        let isCancelled = false

        Promise.all([
            getDashboardStats(),
            getNeedsAttention(),
            getUpcomingInvoices(),
            getRecentActivity(),
        ])
            .then(([statsRes, attentionRes, upcomingRes, activityRes]) => {
                if (isCancelled) return
                setLoading(false)

                if (statsRes.ok) setStatsData(statsRes.data)
                if (attentionRes.ok) setAttentionItems(attentionRes.data)
                if (upcomingRes.ok) setUpcomingItems(upcomingRes.data)
                if (activityRes.ok) setRecentActivity(activityRes.data)

                if (
                    !statsRes.ok ||
                    !attentionRes.ok ||
                    !upcomingRes.ok ||
                    !activityRes.ok
                ) {
                    setError('Some dashboard data could not be retrieved.')
                }
            })
            .catch((err: unknown) => {
                if (isCancelled) return
                setLoading(false)
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to retrieve dashboard data.'
                )
            })

        return () => {
            isCancelled = true
        }
    }, [isMockLocal, refreshTrigger])

    const activeStats: DashboardStats = useMemo(() => {
        if (isMockLocal) {
            return mockStatsData
        }
        return (
            statsData || {
                totalOutstanding: 0,
                totalOverdue: 0,
                paidThisMonth: 0,
                remindersSentThisWeek: 0,
                currency: 'USD',
            }
        )
    }, [isMockLocal, mockStatsData, statsData])

    const stats = [
        {
            label: 'Total Outstanding',
            value: formatCurrency(
                activeStats.totalOutstanding,
                activeStats.currency,
            ),
            description: 'Unpaid invoice amount',
            icon: CircleDollarSign,
            iconStyle:
                'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
            trend: 'Pending payments',
            trendStyle: 'text-blue-700 dark:text-blue-400',
            trendIcon: ArrowDownRight,
        },
        {
            label: 'Total Overdue',
            value: formatCurrency(activeStats.totalOverdue, activeStats.currency),
            description: 'Past due invoice amount',
            icon: Clock3,
            iconStyle:
                'bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
            trend: 'Past due invoices',
            trendStyle: 'text-red-700 dark:text-red-400',
            trendIcon: ArrowUpRight,
        },
        {
            label: 'Paid This Month',
            value: formatCurrency(activeStats.paidThisMonth, activeStats.currency),
            description: 'Payments received this month',
            icon: CreditCard,
            iconStyle:
                'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
            trend: 'Payments collected',
            trendStyle: 'text-emerald-700 dark:text-emerald-400',
            trendIcon: ArrowUpRight,
        },
        {
            label: 'Reminders Sent',
            value: activeStats.remindersSentThisWeek.toString(),
            description: 'Total reminders sent this week',
            icon: BellRing,
            iconStyle:
                'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
            trend: 'Active follow-ups',
            trendStyle: 'text-amber-700 dark:text-amber-400',
            trendIcon: ArrowDownRight,
        },
    ]

    return (
        <section className="min-h-full space-y-7 bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-[#0B1220]">
            {/* Page heading */}
            <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                        <LayoutDashboard size={15} aria-hidden="true" />
                        Payment overview
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                        Dashboard
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                        Keep track of your invoices, payments, and reminders all
                        in one place.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-[#111A2E] dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Overview
                    </div>

                    <Link
                        href="/invoices/new"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1220]"
                    >
                        <FilePlus2 size={17} aria-hidden="true" />
                        New invoice
                    </Link>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                >
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="shrink-0 text-red-600 dark:text-red-400" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true)
                            setRefreshTrigger((prev) => prev + 1)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900"
                    >
                        <RefreshCw size={13} />
                        Retry
                    </button>
                </div>
            )}

            {/* Statistics */}
            <section aria-label="Payment statistics" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Financial summary
                    </h2>

                    <div className="flex items-center gap-2">
                        {loading && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <RefreshCw size={12} className="animate-spin text-blue-500" />
                                Updating...
                            </span>
                        )}
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {isMockLocal ? `Demo mode (${mockInvoices.length} invoices)` : 'Live database'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        const TrendIcon = stat.trendIcon

                        return (
                            <article
                                key={stat.label}
                                className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-[#111A2E] dark:hover:border-blue-900"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {stat.label}
                                        </p>

                                        <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                                            {loading ? (
                                                <span className="inline-block h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                            ) : (
                                                stat.value
                                            )}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${stat.iconStyle}`}
                                    >
                                        <Icon size={21} aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {stat.description}
                                    </p>

                                    <div
                                        className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${stat.trendStyle}`}
                                    >
                                        <TrendIcon
                                            size={14}
                                            aria-hidden="true"
                                        />
                                        {stat.trend}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>

            {/* Invoice and reminder sections */}
            <section
                aria-label="Invoice activity"
                className="grid items-start gap-6 xl:grid-cols-2"
            >
                <div className="min-w-0 space-y-6">
                    <NeedsAttention
                        items={isMockLocal ? undefined : attentionItems}
                        invoices={isMockLocal ? mockInvoices : undefined}
                    />
                    <UpcomingInvoices
                        items={isMockLocal ? undefined : upcomingItems}
                        invoices={isMockLocal ? mockInvoices : undefined}
                    />
                </div>

                <div className="min-w-0">
                    <RecentReminders
                        items={isMockLocal ? undefined : recentActivity}
                        invoices={isMockLocal ? mockInvoices : undefined}
                    />
                </div>
            </section>

            <footer className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Payment Chaser · Manage invoices and get paid faster.
                </p>
            </footer>
        </section>
    )
}