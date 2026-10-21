import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'

import { SettingsForm } from './SettingsForm'

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main className="flex-1 pb-16 lg:pb-0">
                    <section className="space-y-6 p-6 md:p-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Settings
                            </h1>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Manage your profile and payment preferences.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Profile Settings
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update your profile and default payment preferences.
                            </p>
                        </div>

                        <SettingsForm />
                    </section>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    )
}