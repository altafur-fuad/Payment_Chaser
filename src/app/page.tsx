/**
 * @file src/app/page.tsx
 * @description Payment Chaser app shell PoC dashboard page.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export default function Home() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="flex-1">
                    <EmptyDashboard />
                </main>
            </div>
        </div>
    )
}