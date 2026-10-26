/**
 * @file src/components/dashboard/Sidebar.tsx
 * @description Desktop sidebar navigation for the Payment Chaser app shell with user info and logout.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    BarChart3,
    FileText,
    LayoutTemplate,
    LogOut,
    Settings,
    Users,
} from 'lucide-react'
import { getCurrentUser, logOut } from '@/app/actions/auth'

const navItems = [
    {
        label: 'Dashboard',
        href: '/',
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
    const pathname = usePathname()
    const router = useRouter()
    const [userDisplayName, setUserDisplayName] = useState('Workspace')
    const [userEmail, setUserEmail] = useState('')
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        const fetchUser = () => {
            getCurrentUser().then((res) => {
                if (res.ok && res.data) {
                    setUserDisplayName(res.data.displayName || res.data.email.split('@')[0] || 'Freelancer')
                    setUserEmail(res.data.email)
                }
            })
        }

        fetchUser()

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<{ displayName?: string }>
            if (customEvent.detail?.displayName) {
                setUserDisplayName(customEvent.detail.displayName)
            } else {
                fetchUser()
            }
        }

        window.addEventListener('payment-chaser-profile-update', handleUpdate)
        return () => {
            window.removeEventListener('payment-chaser-profile-update', handleUpdate)
        }
    }, [])

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        await logOut()
        router.push('/login')
        router.refresh()
    }

    const initials = userDisplayName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'PC'

    return (
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0F172A] text-white lg:flex lg:flex-col">
            {/* Header / Logo */}
            <div className="flex h-16 shrink-0 items-center border-b border-slate-800 px-6">
                <Link
                    href="/"
                    aria-label="Payment Chaser home"
                    className="flex items-center gap-2 text-lg font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                        P
                    </span>
                    <span>Payment Chaser</span>
                </Link>
            </div>

            <nav
                aria-label="Main navigation"
                className="flex-1 space-y-1 overflow-y-auto p-4"
            >
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                        item.href === '/'
                            ? pathname === '/'
                            : pathname === item.href ||
                              pathname.startsWith(`${item.href}/`)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={[
                                'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                                'transition-colors duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
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

            <div className="shrink-0 border-t border-slate-800 p-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/70 bg-slate-800/60 p-3">
                    <Link
                        href="/settings"
                        title="Go to settings"
                        className="flex items-center gap-3 min-w-0 flex-1 rounded hover:opacity-85 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-xs font-semibold text-blue-300">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                                {userDisplayName}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                                {userEmail || 'Active'}
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        title="Sign out"
                        aria-label="Sign out"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    )
}