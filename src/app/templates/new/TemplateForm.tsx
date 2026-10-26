'use client'

/**
 * @file src/app/templates/new/TemplateForm.tsx
 * @description Form to create or edit reminder templates connected to Server Actions.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
    createTemplate,
    getTemplateById,
    updateTemplate,
} from '@/app/actions/templates'
import { getTemplateById as getMockTemplateById } from '@/lib/mock/storage'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import type { ReminderTone, Template, TemplateInput } from '@/types'

const templateSchema = z.object({
    name: z
        .string()
        .min(2, 'Template name must be at least 2 characters.')
        .max(100, 'Template name is too long.'),

    tone: z.enum(['friendly', 'firm', 'urgent']),

    subject: z
        .string()
        .min(3, 'Subject must be at least 3 characters.')
        .max(150, 'Subject is too long.'),

    body: z
        .string()
        .min(10, 'Message body must be at least 10 characters.')
        .max(3000, 'Message body is too long.'),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateFormProps {
    templateId?: string
}

export function TemplateForm({ templateId }: TemplateFormProps) {
    const isMockLocal = USE_MOCK && !isSupabaseConfigured()
    const isEditMode = Boolean(templateId)

    const [existingTemplate, setExistingTemplate] = useState<Template | null>(() => {
        if (isMockLocal && templateId) {
            return getMockTemplateById(templateId) || null
        }
        return null
    })
    const [loading, setLoading] = useState(isEditMode && !isMockLocal)
    const [submitted, setSubmitted] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            tone: 'friendly',
            subject: '',
            body: '',
        },
    })

    useEffect(() => {
        if (!templateId || isMockLocal) return

        let isCancelled = false

        getTemplateById(templateId).then((res) => {
            if (isCancelled) return
            setLoading(false)

            if (res.ok && res.data) {
                setExistingTemplate(res.data)
                setValue('name', res.data.name)
                setValue('tone', res.data.tone)
                setValue('subject', res.data.subject)
                setValue('body', res.data.body)
            }
        })

        return () => {
            isCancelled = true
        }
    }, [templateId, isMockLocal, setValue])

    const onSubmit = async (values: TemplateFormValues) => {
        setServerError(null)

        const input: TemplateInput = {
            name: values.name.trim(),
            tone: values.tone as ReminderTone,
            subject: values.subject.trim(),
            body: values.body.trim(),
        }

        const res = isEditMode && templateId
            ? await updateTemplate(templateId, input)
            : await createTemplate(input)

        if (!res.ok) {
            setServerError(res.error)
            return
        }

        setSubmitted(true)
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                Loading template details...
            </div>
        )
    }

    if (isEditMode && !existingTemplate && !loading) {
        return (
            <div className="max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Template not found
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    The template you are trying to edit does not exist or may have been deleted.
                </p>
                <Link
                    href="/templates"
                    className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                    Back to Templates
                </Link>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <CheckCircle2
                    size={48}
                    className="mx-auto text-emerald-500"
                    aria-hidden="true"
                />

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                    {isEditMode ? 'Template updated successfully' : 'Template created successfully'}
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Your template has been saved to your account and is ready to use in payment reminders.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/templates"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                        Back to Templates
                    </Link>

                    {!isEditMode && (
                        <button
                            type="button"
                            onClick={() => {
                                reset({
                                    name: '',
                                    tone: 'friendly',
                                    subject: '',
                                    body: '',
                                })
                                setSubmitted(false)
                                setServerError(null)
                            }}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Create Another Template
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
            <Link
                href="/templates"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
                <ArrowLeft size={16} />
                Back to templates
            </Link>

            {serverError && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground"
                    >
                        Template Name <span className="text-red-500">*</span>
                    </label>

                    <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder="e.g. Standard Follow-up"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="tone"
                        className="block text-sm font-medium text-foreground"
                    >
                        Reminder Tone
                    </label>

                    <select
                        {...register('tone')}
                        id="tone"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="friendly">Friendly</option>
                        <option value="firm">Firm</option>
                        <option value="urgent">Urgent</option>
                    </select>

                    {errors.tone && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.tone.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-foreground"
                    >
                        Subject Line <span className="text-red-500">*</span>
                    </label>

                    <input
                        {...register('subject')}
                        id="subject"
                        type="text"
                        placeholder="e.g. Friendly reminder: Invoice {{invoice_number}} is due soon"
                        className="mt-2 flex h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.subject && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.subject.message}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="body"
                            className="block text-sm font-medium text-foreground"
                        >
                            Message Body <span className="text-red-500">*</span>
                        </label>

                        <span className="text-xs text-slate-500">
                            Variables: &#123;&#123;client_name&#125;&#125;, &#123;&#123;invoice_number&#125;&#125;, &#123;&#123;amount&#125;&#125;, &#123;&#123;due_date&#125;&#125;
                        </span>
                    </div>

                    <textarea
                        {...register('body')}
                        id="body"
                        rows={7}
                        placeholder="Hi {{client_name}}, this is a friendly reminder that invoice {{invoice_number}} for {{amount}} is due on {{due_date}}..."
                        className="mt-2 flex w-full rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.body && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.body.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Link
                    href="/templates"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                >
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
                </button>
            </div>
        </form>
    )
}