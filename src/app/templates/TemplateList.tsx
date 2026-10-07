'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Search, Trash2 } from 'lucide-react'

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

        if (!template) {
            return
        }

        if (template.isDefault) {
            window.alert('Default templates cannot be deleted.')
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${template.name}"?`,
        )

        if (!confirmed) {
            return
        }

        setTemplates((currentTemplates) =>
            currentTemplates.filter((item) => item.id !== id),
        )
    }

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                    aria-hidden="true"
                />

                <Input
                    value={search}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search templates..."
                    className="pl-10"
                    aria-label="Search templates"
                />
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <h2 className="text-lg font-semibold text-foreground">
                        No templates found
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Try a different search term.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="rounded-lg border border-border bg-card p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="truncate text-lg font-semibold text-foreground">
                                        {template.name}
                                    </h2>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <ToneBadge tone={template.tone} />

                                        {template.isDefault && (
                                            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Subject
                                    </p>

                                    <p className="mt-1 text-sm text-foreground">
                                        {template.subject}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Message
                                    </p>

                                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                        {template.body}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
                                <Link
                                    href={`/templates/${template.id}/edit`}
                                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <Pencil size={16} aria-hidden="true" />
                                    Edit
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(template.id)}
                                    disabled={template.isDefault}
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    aria-label={`Delete ${template.name}`}
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}