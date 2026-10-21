'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    Search,
    FileText,
    ArrowUpRight,
    Check,
    Palette,
} from 'lucide-react'

const invoiceTemplates = [
    {
        id: 'modern',
        name: 'Modern Blue',
        description: 'Clean layout for modern businesses.',
        accent: '#2563eb',
        background: '#eff6ff',
        label: 'Popular',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple, elegant and distraction-free.',
        accent: '#334155',
        background: '#f1f5f9',
        label: '',
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'A polished look for client invoices.',
        accent: '#0f766e',
        background: '#f0fdfa',
        label: 'Business',
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'A bold style for creative freelancers.',
        accent: '#7c3aed',
        background: '#f5f3ff',
        label: '',
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'A timeless format with clear details.',
        accent: '#475569',
        background: '#f8fafc',
        label: '',
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'A refined style for premium services.',
        accent: '#a16207',
        background: '#fefce8',
        label: 'Premium style',
    },
]

function InvoicePreview({
    accent,
    background,
}: {
    accent: string
    background: string
}) {
    return (
        <div
            className="relative overflow-hidden rounded-xl border border-slate-200 p-4 sm:p-5 dark:border-slate-700"
            style={{ backgroundColor: background }}
        >
            <div className="mx-auto max-w-[250px] bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div
                            className="mb-1.5 h-2 w-16 rounded-sm"
                            style={{ backgroundColor: accent }}
                        />
                        <div className="h-1.5 w-12 rounded-sm bg-slate-200" />
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold tracking-[0.15em] text-slate-700">
                            INVOICE
                        </p>
                        <p className="mt-1 text-[7px] text-slate-400">
                            # INV-001
                        </p>
                    </div>
                </div>

                <div className="my-5 grid grid-cols-2 gap-3">
                    <div>
                        <p className="mb-2 text-[7px] font-semibold uppercase text-slate-400">
                            Billed to
                        </p>
                        <div className="h-1.5 w-16 rounded-sm bg-slate-300" />
                        <div className="mt-1.5 h-1 w-20 rounded-sm bg-slate-100" />
                        <div className="mt-1 h-1 w-14 rounded-sm bg-slate-100" />
                    </div>
                    <div>
                        <p className="mb-2 text-[7px] font-semibold uppercase text-slate-400">
                            Invoice date
                        </p>
                        <div className="h-1.5 w-14 rounded-sm bg-slate-300" />
                        <div className="mt-1.5 h-1 w-16 rounded-sm bg-slate-100" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-sm border border-slate-100">
                    <div
                        className="grid grid-cols-[1fr_35px] gap-2 px-2 py-1.5"
                        style={{ backgroundColor: accent }}
                    >
                        <span className="text-[7px] font-medium text-white">
                            Description
                        </span>
                        <span className="text-right text-[7px] font-medium text-white">
                            Amount
                        </span>
                    </div>

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="grid grid-cols-[1fr_35px] gap-2 border-b border-slate-100 px-2 py-2 last:border-0"
                        >
                            <div>
                                <div className="h-1 w-20 rounded-sm bg-slate-200" />
                                <div className="mt-1 h-1 w-12 rounded-sm bg-slate-100" />
                            </div>
                            <div className="ml-auto h-1 w-7 rounded-sm bg-slate-200" />
                        </div>
                    ))}
                </div>

                <div className="ml-auto mt-4 w-24 space-y-2">
                    <div className="flex justify-between">
                        <span className="h-1 w-8 rounded-sm bg-slate-200" />
                        <span className="h-1 w-8 rounded-sm bg-slate-200" />
                    </div>
                    <div
                        className="flex justify-between rounded-sm px-2 py-2"
                        style={{ backgroundColor: background }}
                    >
                        <span className="h-1 w-7 rounded-sm bg-slate-400" />
                        <span
                            className="h-1 w-9 rounded-sm"
                            style={{ backgroundColor: accent }}
                        />
                    </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                    <div className="h-1 w-20 rounded-sm bg-slate-200" />
                    <div className="mt-1.5 h-1 w-32 rounded-sm bg-slate-100" />
                </div>
            </div>
        </div>
    )
}

export function InvoiceTemplateGallery() {
    const [search, setSearch] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
        null,
    )

    const filteredTemplates = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) return invoiceTemplates

        return invoiceTemplates.filter((template) =>
            `${template.name} ${template.description} ${template.label}`
                .toLowerCase()
                .includes(query),
        )
    }, [search])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search invoice templates..."
                        aria-label="Search invoice templates"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Palette size={17} aria-hidden="true" />
                    <span>{filteredTemplates.length} designs</span>
                </div>
            </div>

            {selectedTemplate && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
                >
                    <Check
                        size={19}
                        className="mt-0.5 text-blue-600 dark:text-blue-400"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {invoiceTemplates.find(
                                (template) => template.id === selectedTemplate,
                            )?.name}{' '}
                            selected
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Continue to the invoice creation page to use this
                            design.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate(null)}
                        className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {filteredTemplates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center dark:border-slate-700">
                    <FileText
                        size={30}
                        className="mx-auto text-slate-400"
                    />
                    <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">
                        No templates found
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Try searching with another keyword.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <article
                            key={template.id}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:hover:shadow-none"
                        >
                            <div className="relative p-3 pb-0">
                                <InvoicePreview
                                    accent={template.accent}
                                    background={template.background}
                                />

                                {template.label && (
                                    <span className="absolute left-6 top-6 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
                                        {template.label}
                                    </span>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-slate-900 dark:text-white">
                                            {template.name}
                                        </h2>
                                        <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                            {template.description}
                                        </p>
                                    </div>
                                    <span
                                        className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-slate-100 dark:ring-slate-800"
                                        style={{
                                            backgroundColor: template.accent,
                                        }}
                                        aria-label={`${template.name} accent color`}
                                    />
                                </div>

                                <div className="mt-5 flex items-center gap-2">
                                    <Link
                                        href={`/invoices/new?template=${template.id}`}
                                        onClick={() =>
                                            setSelectedTemplate(template.id)
                                        }
                                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        style={{
                                            backgroundColor: template.accent,
                                        }}
                                    >
                                        Use Template
                                        <ArrowUpRight
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}