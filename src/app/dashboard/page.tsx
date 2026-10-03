/**
 * @file src/app/dashboard/page.tsx
 * @description Payment Chaser dashboard page using the application shell.
 * @phase 3
 * @author Payment Chaser Team
 * @created 2026-10-03
 */

import { DashboardContent } from '@/components/DashboardContent'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="flex-1 pb-16 lg:pb-0">
                    <DashboardContent />
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}