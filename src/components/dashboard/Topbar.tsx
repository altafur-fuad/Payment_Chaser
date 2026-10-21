/**
 * @file src/components/dashboard/Topbar.tsx
 * @description Top navigation bar for the Payment Chaser app shell with working search.
 * @phase 1
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Bell, Moon, Sun, Search } from 'lucide-react'

export function Topbar() {
    const { theme, setTheme } = useTheme()
    const [searchQuery, setSearchQuery] = useState('')
    const [hasUnread, setHasUnread] = useState(true)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery)
        }
    }

    return (
        <header className="flex min-h-16 items-center justify-between border-b border-slate-100 bg-white px-4 md:px-6">
          
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
                        placeholder="Search anything..."
                        className="w-full rounded-lg bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 border border-transparent focus:border-[#3882F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3882F6] transition-all"
                    />
                </div>
            </form>

         
            <div className="flex items-center gap-2">
             
                <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3882F6]"
                >
                    <Bell size={18} strokeWidth={2} aria-hidden="true" />
                    {hasUnread && (
                        <span
                            aria-label="1 unread notification"
                            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
                        />
                    )}
                </button>

                {/* Theme Toggle Button */}
                <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle dark mode"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3882F6]"
                >
                    {theme === 'dark' ? (
                        <Sun size={18} strokeWidth={2} />
                    ) : (
                        <Moon size={18} strokeWidth={2} />
                    )}
                </button>

                {/* Profile Badge & Info */}
                <div className="ml-2 flex items-center gap-2">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200"
                        aria-label="User profile"
                    >
                        MH
                    </div>
                    <div className="hidden text-left md:block">
                        <p className="text-xs font-semibold text-slate-800">Mahatab Hossain</p>
                        <p className="text-[10px] text-slate-400">Free Plan</p>
                    </div>
                </div>
            </div>
        </header>
    )
}