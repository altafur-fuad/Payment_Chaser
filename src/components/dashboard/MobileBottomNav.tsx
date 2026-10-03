/**
 * @file src/components/dashboard/MobileBottomNav.tsx
 * @description Mobile bottom navigation for the Payment Chaser app shell.
 * @phase 3
 * @author Payment Chaser Team
 * @created 2026-10-03
 */

import Link from 'next/link'
import {
    FileText,
    LayoutDashboard,
    MoreHorizontal,
    Users,
} from 'lucide-react'

const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
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
        label: 'More',
        href: '/settings',
        icon: MoreHorizontal,
    },
]

export function MobileBottomNav() {
    return (
        <nav
            aria-label="Mobile navigation"
            className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-background lg:hidden"
        >
            <div className="grid grid-cols-4">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/dashboard'

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={[
                                'flex min-h-16 flex-col items-center justify-center gap-1',
                                'text-xs font-medium transition-colors duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                                isActive
                                    ? 'text-primary'
                                    : 'text-foreground hover:bg-surface',
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
            </div>
        </nav>
    )
}