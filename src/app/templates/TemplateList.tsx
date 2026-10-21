'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    FileText,
    Pencil,
    Search,
    Trash2,
    X,
    LockKeyhole,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { ToneBadge } from '@/components/shared/ToneBadge'
import { mockTemplates } from '@/lib/mock/templates'

export function TemplateList() {
    const [search, setSearch] = useState('')
    const [templates, setTemplates] = useState(mockTemplates)

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

    const handleDelete = (id: string) => {
        const template = templates.find((item) => item.id === id)

        if (!template) return

        if (template.isDefault) {
            window.alert('Default templates cannot be deleted.')
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${template.name}"?`,
        )

        if (!confirmed) return

        setTemplates((currentTemplates) =>
            currentTemplates.filter((item) => item.id !== id),
        )
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

                <p
                    className="text-sm text-slate-500 dark:text-slate-400"
                    aria-live="polite"
                >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {filteredTemplates.length}
                    </span>{' '}
                    {filteredTemplates.length === 1 ? 'template' : 'templates'}
                    {search.trim() ? ' found' : ' available'}
                </p>
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
                        <Search size={25} aria-hidden="true" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                        No templates found
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
                        We couldn&apos;t find any templates matching your
                        search. Try another keyword.
                    </p>

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <X size={15} aria-hidden="true" />
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <article
                            key={template.id}
                            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-blue-900 dark:hover:shadow-black/20"
                        >
                            {/* Card Header */}
                            <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:bg-blue-950">
                                        <FileText
                                            size={20}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h2
                                            className="truncate text-base font-semibold text-slate-900 dark:text-white"
                                            title={template.name}
                                        >
                                            {template.name}
                                        </h2>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <ToneBadge tone={template.tone} />

                                            {template.isDefault && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    <LockKeyhole
                                                        size={11}
                                                        aria-hidden="true"
                                                    />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Content */}
                            <div className="flex flex-1 flex-col p-5 sm:p-6">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                        Email subject
                                    </p>

                                    <p
                                        className="mt-2 break-words text-sm font-medium leading-6 text-slate-800 dark:text-slate-200"
                                        title={template.subject}
                                    >
                                        {template.subject}
                                    </p>
                                </div>

                                <div className="mt-5 flex-1 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                            Message preview
                                        </p>
                                    </div>

                                    <p className="line-clamp-4 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                                        {template.body}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    <Link
                                        href={`/templates/${template.id}/edit`}
                                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                                    >
                                        <Pencil
                                            size={15}
                                            aria-hidden="true"
                                        />
                                        Edit template
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(template.id)}
                                        disabled={template.isDefault}
                                        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-900 dark:disabled:hover:text-slate-400"
                                        aria-label={`Delete ${template.name}`}
                                        title={
                                            template.isDefault
                                                ? 'Default templates cannot be deleted'
                                                : `Delete ${template.name}`
                                        }
                                    >
                                        <Trash2
                                            size={15}
                                            aria-hidden="true"
                                        />
                                        <span className="hidden sm:inline">
                                            Delete
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}