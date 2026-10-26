/**
 * @file src/components/dashboard/Topbar.tsx
 * @description Top navigation bar for the Payment Chaser app shell with search, theme toggle, and user logout.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react'
import { getCurrentUser, logOut } from '@/app/actions/auth'

const emptySubscribe = () => () => {}

export function Topbar() {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [hasUnread, setHasUnread] = useState(false)
    const [userDisplayName, setUserDisplayName] = useState('User')
    const [userEmail, setUserEmail] = useState('')
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    )

    useEffect(() => {
        const fetchUser = () => {
            getCurrentUser().then((res) => {
                if (res.ok && res.data) {
                    setUserDisplayName(res.data.displayName || res.data.email.split('@')[0] || 'User')
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/invoices?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        await logOut()
        router.push('/login')
        router.refresh()
    }

    const initials = userDisplayName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'

    return (
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 dark:border-slate-800 dark:bg-[#0F172A]">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xs md:max-w-sm">
                <div className="relative flex items-center">
                    <Search
                        size={16}
                        strokeWidth={2}
                        className="absolute left-3 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search invoices or clients..."
                        className="w-full rounded-lg bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                    />
                </div>
            </form>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    <Bell size={18} strokeWidth={2} aria-hidden="true" />
                    {hasUnread && (
                        <span
                            aria-label="1 unread notification"
                            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
                        />
                    )}
                </button>

                {/* Theme Toggle Button */}
                <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle dark mode"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    {!mounted ? (
                        <span className="inline-block h-[18px] w-[18px]" aria-hidden="true" />
                    ) : theme === 'dark' ? (
                        <Sun size={18} strokeWidth={2} />
                    ) : (
                        <Moon size={18} strokeWidth={2} />
                    )}
                </button>

                {/* Profile Badge & Info */}
                <div className="ml-2 flex items-center gap-3">
                    <Link
                        href="/settings"
                        title="Go to settings"
                        className="flex items-center gap-3 rounded-lg p-1 -m-1 transition hover:bg-slate-100 dark:hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                            aria-label="User profile"
                        >
                            {initials}
                        </div>
                        <div className="hidden text-left md:block">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{userDisplayName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{userEmail || 'Active'}</p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        title="Sign out"
                        aria-label="Sign out"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    )
}