'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { mockTemplates } from '@/lib/mock/templates'
import type { ReminderTone, TemplateInput } from '@/types'

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
        .max(2000, 'Message body is too long.'),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateFormProps {
    templateId?: string
}

export function TemplateForm({ templateId }: TemplateFormProps) {
    const [submitted, setSubmitted] = useState(false)

    const existingTemplate = templateId
        ? mockTemplates.find((template) => template.id === templateId)
        : undefined

    const isEditMode = Boolean(templateId)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: existingTemplate?.name ?? '',
            tone: existingTemplate?.tone ?? 'friendly',
            subject: existingTemplate?.subject ?? '',
            body: existingTemplate?.body ?? '',
        },
    })

    const onSubmit = async (values: TemplateFormValues) => {
        const input: TemplateInput = {
            name: values.name.trim(),
            tone: values.tone as ReminderTone,
            subject: values.subject.trim(),
            body: values.body.trim(),
        }

        console.log(
            isEditMode ? 'Update template:' : 'Create template:',
            input,
        )

        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })

        setSubmitted(true)
    }

    if (templateId && !existingTemplate) {
        return (
            <div className="max-w-2xl rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Template not found
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    The template you are trying to edit does not exist.
                </p>

                <Link
                    href="/templates"
                    className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                    Back to Templates
                </Link>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="max-w-2xl rounded-lg border border-border bg-card p-8 text-center">
                <CheckCircle2
                    size={48}
                    className="mx-auto text-emerald-500"
                    aria-hidden="true"
                />

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                    {isEditMode
                        ? 'Template updated successfully'
                        : 'Template created successfully'}
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {isEditMode
                        ? 'Your template changes have been saved.'
                        : 'Your payment reminder template has been created.'}
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/templates"
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
                            }}
                            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                        >
                            Add Another Template
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6 md:p-8"
        >
            <div className="space-y-5">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Template Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        placeholder="e.g. Friendly Payment Reminder"
                        {...register('name')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="tone"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Tone
                    </label>

                    <select
                        id="tone"
                        {...register('tone')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="friendly">Friendly</option>
                        <option value="firm">Firm</option>
                        <option value="urgent">Urgent</option>
                    </select>

                    {errors.tone && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.tone.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Subject
                    </label>

                    <input
                        id="subject"
                        type="text"
                        placeholder="Payment reminder for invoice {{invoiceNumber}}"
                        {...register('subject')}
                        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    {errors.subject && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.subject.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="body"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Message Body
                    </label>

                    <textarea
                        id="body"
                        rows={8}
                        placeholder="Hi {{clientName}}, this is a reminder about invoice {{invoiceNumber}}."
                        {...register('body')}
                        className="w-full resize-y rounded-md border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                        You can use variables like {'{{clientName}}'} and {'{{invoiceNumber}}'}.
                    </p>

                    {errors.body && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {errors.body.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Link
                    href="/templates"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {isSubmitting
                        ? 'Saving...'
                        : isEditMode
                          ? 'Update Template'
                          : 'Save Template'}
                </button>
            </div>
        </form>
    )
}