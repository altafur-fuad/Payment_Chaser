import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { InvoiceForm } from './InvoiceForm'

export default function NewInvoicePage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="flex-1 pb-16 lg:pb-0">
                    <section className="space-y-6 p-6 md:p-8">
                        <div>
                            <Link
                                href="/invoices"
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-slate-400"
                            >
                                <ArrowLeft size={18} aria-hidden="true" />
                                Back to Invoices
                            </Link>

                            <div className="mt-4">
                                <h1 className="text-2xl font-semibold text-foreground">
                                    New Invoice
                                </h1>

                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Create an invoice and configure automatic payment reminders.
                                </p>
                            </div>
                        </div>

                        <InvoiceForm />
                    </section>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}