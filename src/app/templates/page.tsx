/**
 * @file src/app/templates/page.tsx
 * @description Payment Chaser templates listing page.
 */

import Link from 'next/link'
import { Plus, FileText, ArrowUpRight } from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { TemplateList } from './TemplateList'

export default function TemplatesPage() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="min-w-0 flex-1 pb-20 lg:pb-8">
                    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        {/* Page Header */}
                        <section className="mb-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-400">
                                        <FileText
                                            size={23}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                                Templates
                                            </h1>

                                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                Email reminders
                                            </span>
                                        </div>

                                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                                            Create reusable payment reminders and
                                            keep your client communication
                                            consistent.
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/templates/new"
                                    className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1220]"
                                >
                                    <Plus
                                        size={18}
                                        strokeWidth={2.3}
                                        aria-hidden="true"
                                    />
                                    Add Template
                                    <ArrowUpRight
                                        size={16}
                                        className="opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        </section>

                        {/* Templates Content */}
                        <section
                            aria-label="Payment reminder templates"
                            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-6 lg:p-7 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
                        >
                            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                        Your templates
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        Manage the messages you use to follow
                                        up on payments.
                                    </p>
                                </div>

                                <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    Reusable messages
                                </div>
                            </div>

                            <TemplateList />
                        </section>

                        {/* Helpful Note */}
                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                                <FileText size={16} aria-hidden="true" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Save time with reusable templates
                                </p>

                                <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                                    Keep your payment follow-ups organized by
                                    reusing message templates instead of
                                    writing every reminder from scratch.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}