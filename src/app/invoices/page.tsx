/**
 * @file src/app/invoices/page.tsx
 * @description Invoice list page for the Payment Chaser application.
 * @phase 5
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { InvoiceList } from './InvoiceList'

export default function InvoicesPage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="flex-1 pb-16 lg:pb-0">
                    <section className="space-y-6 p-6 md:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Invoices
                                </h1>

                                <p className="mt-1 text-sm ">
                                    Manage your invoices and payment reminders.
                                </p>
                            </div>

                            <Link
                                href="/invoices/new"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <Plus
                                    size={18}
                                    strokeWidth={1.75}
                                    aria-hidden="true"
                                />
                                New Invoice
                            </Link>
                        </div>

                        <InvoiceList />
                    </section>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}