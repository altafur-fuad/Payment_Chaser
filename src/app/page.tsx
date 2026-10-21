/**
 * @file src/app/page.tsx
 * @description Payment Chaser dashboard page.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { DashboardContent } from '@/components/DashboardContent'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'

export default function Home() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="min-w-0 flex-1">
                    <DashboardContent />
                </main>

                <MobileBottomNav />
            </div>
        </div>
    )
}