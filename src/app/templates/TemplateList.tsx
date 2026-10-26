'use client'

/**
 * @file src/app/templates/TemplateList.tsx
 * @description Reminder templates management list connected to Server Actions.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    FileText,
    Pencil,
    Search,
    Trash2,
    X,
    LockKeyhole,
    Plus,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { ToneBadge } from '@/components/shared/ToneBadge'
import { deleteTemplate, getTemplates } from '@/app/actions/templates'
import { useTemplates } from '@/lib/mock/use-mock-data'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { Template } from '@/types'

export function TemplateList() {
    const isMockLocal = USE_MOCK && !isSupabaseConfigured()
    const mockStoreTemplates = useTemplates()

    const [search, setSearch] = useState('')
    const [dbTemplates, setDbTemplates] = useState<Template[] | null>(null)
    const [loading, setLoading] = useState(!isMockLocal)
    const [notice, setNotice] = useState<string | null>(null)

    useEffect(() => {
        if (isMockLocal) return

        let isCancelled = false

        getTemplates().then((res) => {
            if (isCancelled) return
            setLoading(false)
            if (res.ok) {
                setDbTemplates(res.data)
            }
        })

        return () => {
            isCancelled = true
        }
    }, [isMockLocal])

    const templates = useMemo(() => {
        if (isMockLocal) return mockStoreTemplates
        return dbTemplates || []
    }, [isMockLocal, mockStoreTemplates, dbTemplates])

    const filteredTemplates = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) {
            return templates
        }

        return templates.filter((template) =>
            [
                template.name,
                template.subject,
                template.body,
                template.tone,
            ].some((value) => value.toLowerCase().includes(query)),
        )
    }, [search, templates])

    const handleDelete = async (id: string) => {
        setNotice(null)
        const template = templates.find((item) => item.id === id)

        if (!template) return

        if (template.isDefault) {
            setNotice('Default system templates cannot be deleted.')
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${template.name}"?`,
        )

        if (!confirmed) return

        const res = await deleteTemplate(id)
        if (res.ok) {
            setDbTemplates((prev) => (prev ? prev.filter((t) => t.id !== id) : prev))
            setNotice(`Template "${template.name}" deleted.`)
        } else {
            setNotice(res.error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Search and Results */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                        aria-hidden="true"
                    />

                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, subject, or message..."
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-800"
                        aria-label="Search templates"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                            aria-label="Clear search"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <p
                        className="text-sm text-slate-500 dark:text-slate-400"
                        aria-live="polite"
                    >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {filteredTemplates.length}
                        </span>{' '}
                        {filteredTemplates.length === 1 ? 'template' : 'templates'}
                    </p>

                    <Link
                        href="/templates/new"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        <span>New Template</span>
                    </Link>
                </div>
            </div>

            {notice && (
                <div
                    role="status"
                    className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
                >
                    <span>{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Template Cards Grid */}
            {loading ? (
                <div className="p-12 text-center text-slate-500">
                    Loading templates...
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
                    <FileText
                        className="mx-auto text-slate-400"
                        size={40}
                        aria-hidden="true"
                    />
                    <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                        No templates found
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {search
                            ? 'Try searching with a different term.'
                            : 'Get started by creating a reminder template.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                                                {template.name}
                                            </h3>
                                            {template.isDefault && (
                                                <span
                                                    title="Default system template"
                                                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                >
                                                    <LockKeyhole size={11} />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ToneBadge tone={template.tone} />
                                </div>

                                <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Subject line
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-800 dark:text-slate-200">
                                        {template.subject}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Message body
                                    </p>
                                    <p className="mt-1 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                        {template.body}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                                <Link
                                    href={`/templates/${template.id}/edit`}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <Pencil size={13} />
                                    <span>Edit</span>
                                </Link>

                                {!template.isDefault && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(template.id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                                    >
                                        <Trash2 size={13} />
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}