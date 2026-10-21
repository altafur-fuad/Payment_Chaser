/**
 * @file src/components/dashboard/EmptyDashboard.tsx
 * @description Empty dashboard content for the Payment Chaser app shell PoC.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { FileText } from 'lucide-react'

export function EmptyDashboard() {
    return (
        <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 md:p-8">
            <div className="flex max-w-md flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <FileText
                        size={24}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-foreground">
                    Welcome to Payment Chaser
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                    Your dashboard is ready. Invoice and payment management
                    features will appear here.
                </p>
            </div>
        </section>
    )
}