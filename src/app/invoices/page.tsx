/**
 * @file src/app/invoices/page.tsx
 * @description Payment Chaser invoices listing page.
 */

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { InvoiceList } from './InvoiceList'

export default function InvoicesPage() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Invoices
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Manage invoices and track outstanding payments.
                            </p>
                        </div>

                        <InvoiceList />
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    )
}