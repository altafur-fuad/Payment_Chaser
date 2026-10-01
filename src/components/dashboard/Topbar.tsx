/**
 * @file src/components/dashboard/Topbar.tsx
 * @description Top navigation bar for the Payment Chaser app shell.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import {
    Bell,
    Moon,
    Search,
} from 'lucide-react'

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-foreground">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Search"
                    className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Search
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </button>

                <button
                    type="button"
                    aria-label="Notifications"
                    className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Bell
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </button>

                <button
                    type="button"
                    aria-label="Toggle dark mode"
                    className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Moon
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </button>

                <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    MH
                </div>
            </div>
        </header>
    )
}