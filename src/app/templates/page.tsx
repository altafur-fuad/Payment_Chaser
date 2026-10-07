import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { TemplateList } from './TemplateList'

export default function TemplatesPage() {
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
                                    Templates
                                </h1>

                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Create and manage your payment reminder templates.
                                </p>
                            </div>

                            <Link
                                href="/templates/new"
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                <Plus size={18} aria-hidden="true" />
                                Add Template
                            </Link>
                        </div>

                        <TemplateList />
                    </section>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}