/**
 * @file src/components/dashboard/Topbar.tsx
 * @description Top navigation bar for the Payment Chaser app shell.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useTheme } from 'next-themes'
import {
    Bell,
    Moon,
    Search,
} from 'lucide-react'

export function Topbar() {
    const { theme, setTheme } = useTheme()

    return (
        <header className="flex min-h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
            <div className="flex min-w-0 items-center">
                <h1 className="truncate text-lg font-semibold text-foreground">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <button
                    type="button"
                    aria-label="Search"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Bell
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />

                    <span
                        aria-label="1 unread notification"
                        className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger"
                    />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    aria-label="Toggle dark mode"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Moon
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                </button>

                <div
                    className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary sm:ml-2"
                    aria-label="User profile"
                >
                    MH
                </div>
            </div>
        </header>
    )
}