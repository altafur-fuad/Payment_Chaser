/**
 * @file src/components/dashboard/Sidebar.tsx
 * @description Desktop sidebar navigation for the Payment Chaser app shell.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import Link from 'next/link'
import {
    BarChart3,
    FileText,
    LayoutTemplate,
    Settings,
    Users,
} from 'lucide-react'

const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
    },
    {
        label: 'Invoices',
        href: '/invoices',
        icon: FileText,
    },
    {
        label: 'Clients',
        href: '/clients',
        icon: Users,
    },
    {
        label: 'Templates',
        href: '/templates',
        icon: LayoutTemplate,
    },
    {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
    },
]

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link
                    href="/dashboard"
                    className="text-lg font-semibold text-foreground"
                >
                    Payment Chaser
                </Link>
            </div>

            <nav
                aria-label="Main navigation"
                className="flex-1 space-y-1 p-4"
            >
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/dashboard'

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={[
                                'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                                'transition-colors duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                isActive
                                    ? 'bg-primary-soft text-primary'
                                    : 'text-muted hover:bg-surface hover:text-foreground',
                            ].join(' ')}
                        >
                            <Icon
                                size={20}
                                strokeWidth={1.75}
                                aria-hidden="true"
                            />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-border p-4">
                <div className="rounded-lg bg-surface p-3">
                    <p className="text-sm font-medium text-foreground">
                        Demo User
                    </p>
                    <p className="mt-1 text-xs text-muted">
                        demo@example.com
                    </p>
                </div>
            </div>
        </aside>
    )
}