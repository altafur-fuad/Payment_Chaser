/**
 * @file src/app/invoices/new/InvoiceForm.tsx
 * @description Invoice creation form with live preview and reminder settings.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Upload,
} from 'lucide-react'
import {
    useForm,
    useWatch,
    type SubmitHandler,
} from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { mockClients } from '@/lib/mock/clients'
import { mockTemplates } from '@/lib/mock/templates'
import { mockInvoices } from '@/lib/mock/invoices'
import { saveInvoice } from '@/lib/mock/invoice-storage'
import type { Invoice, ReminderChannel } from '@/types'
import { InvoicePreview } from './InvoicePreview'

const invoiceSchema = z
    .object({
        clientId: z.string().min(1, 'Please select a client.'),
        invoiceNumber: z
            .string()
            .trim()
            .min(1, 'Invoice number is required.')
            .max(50, 'Invoice number is too long.'),
        amount: z
            .number({ message: 'Amount is required.' })
            .positive('Amount must be greater than 0.')
            .finite('Enter a valid amount.'),
        currency: z.string().min(1, 'Please select a currency.'),
        issueDate: z.string().min(1, 'Issue date is required.'),
        dueDate: z.string().min(1, 'Due date is required.'),
        templateId: z.string().min(1, 'Please select a reminder template.'),
        channels: z
            .array(z.enum(['email', 'whatsapp']))
            .min(1, 'Select at least one reminder channel.'),
        remindersEnabled: z.boolean(),
        notes: z
            .string()
            .max(1000, 'Notes cannot exceed 1000 characters.')
            .optional(),
        file: z.preprocess(
            (value) => {
                if (
                    typeof FileList !== 'undefined' &&
                    value instanceof FileList
                ) {
                    return value.length > 0
                        ? value.item(0) ?? undefined
                        : undefined
                }

                return value
            },
            z
                .custom<File | undefined>(
                    (value) =>
                        value === undefined ||
                        (typeof File !== 'undefined' && value instanceof File),
                    { message: 'Please select a valid file.' },
                )
                .optional(),
        ),
    })
    .refine((data) => data.dueDate >= data.issueDate, {
        message: 'Due date cannot be before the issue date.',
        path: ['dueDate'],
    })
    .refine(
        (data) =>
            !data.file ||
            ['application/pdf', 'image/png', 'image/jpeg'].includes(
                data.file.type,
            ),
        {
            message: 'Only PDF, PNG, and JPG files are allowed.',
            path: ['file'],
        },
    )
    .refine(
        (data) => !data.file || data.file.size <= 10 * 1024 * 1024,
        {
            message: 'File size must be 10MB or less.',
            path: ['file'],
        },
    )

type InvoiceFormInput = z.input<typeof invoiceSchema>
type InvoiceFormValues = z.infer<typeof invoiceSchema>

type InvoiceFormProps = {
    initialInvoiceTemplateId?: string
}

const invoiceDesignTemplates = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary',
        accent: 'bg-blue-600',
        preview: 'bg-blue-50',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and minimal',
        accent: 'bg-slate-500',
        preview: 'bg-slate-100',
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Business focused',
        accent: 'bg-indigo-600',
        preview: 'bg-indigo-50',
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Bold and expressive',
        accent: 'bg-violet-600',
        preview: 'bg-violet-50',
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional business',
        accent: 'bg-emerald-700',
        preview: 'bg-emerald-50',
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'Refined and stylish',
        accent: 'bg-rose-600',
        preview: 'bg-rose-50',
    },
] as const

const currencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'BDT - Bangladeshi Taka', value: 'BDT' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
]

const channelOptions: {
    label: string
    value: ReminderChannel
}[] = [
    { label: 'Email', value: 'email' },
    { label: 'WhatsApp', value: 'whatsapp' },
]

const STORAGE_KEY = 'payment-chaser-created-invoices'

function getLocalDate(): string {
    const date = new Date()

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-')
}

export function InvoiceForm({
    initialInvoiceTemplateId,
}: InvoiceFormProps) {
    const [submitted, setSubmitted] = useState(false)
    const [savedInvoiceNumber, setSavedInvoiceNumber] = useState('')
    const [saveError, setSaveError] = useState('')

    const [selectedInvoiceTemplateId, setSelectedInvoiceTemplateId] =
        useState<string>(() => {
            const isValid = invoiceDesignTemplates.some(
                (template) => template.id === initialInvoiceTemplateId,
            )

            return isValid ? initialInvoiceTemplateId! : 'modern'
        })

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<InvoiceFormInput, any, InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            clientId: '',
            invoiceNumber: '',
            amount: undefined,
            currency: 'USD',
            issueDate: getLocalDate(),
            dueDate: '',
            templateId: mockTemplates[0]?.id ?? '',
            channels: ['email'],
            remindersEnabled: true,
            notes: '',
            file: undefined,
        },
    })

    const selectedClientId = useWatch({
        control,
        name: 'clientId',
    })

    const watchedChannels = useWatch({
        control,
        name: 'channels',
    })

    const watchedInvoiceNumber = useWatch({
        control,
        name: 'invoiceNumber',
    })

    const watchedAmount = useWatch({
        control,
        name: 'amount',
    })

    const watchedCurrency = useWatch({
        control,
        name: 'currency',
    })

    const watchedIssueDate = useWatch({
        control,
        name: 'issueDate',
    })

    const watchedDueDate = useWatch({
        control,
        name: 'dueDate',
    })

    const watchedNotes = useWatch({
        control,
        name: 'notes',
    })

    const selectedChannels = useMemo(
        () => watchedChannels ?? [],
        [watchedChannels],
    )

    const selectedClient = useMemo(
        () => mockClients.find((client) => client.id === selectedClientId),
        [selectedClientId],
    )

    const whatsappAvailable = Boolean(selectedClient?.whatsappNumber)

    const selectedDesign =
        invoiceDesignTemplates.find(
            (template) => template.id === selectedInvoiceTemplateId,
        ) ?? invoiceDesignTemplates[0]

    useEffect(() => {
        if (
            !whatsappAvailable &&
            selectedChannels.includes('whatsapp')
        ) {
            setValue(
                'channels',
                selectedChannels.filter((channel) => channel !== 'whatsapp'),
                { shouldValidate: true },
            )
        }
    }, [whatsappAvailable, selectedChannels, setValue])

    const toggleChannel = (channel: ReminderChannel) => {
        const nextChannels = selectedChannels.includes(channel)
            ? selectedChannels.filter((item) => item !== channel)
            : [...selectedChannels, channel]

        setValue('channels', nextChannels, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const onSubmit: SubmitHandler<InvoiceFormValues> = async (values) => {
        setSaveError('')

        const client = mockClients.find(
            (item) => item.id === values.clientId,
        )

        if (!client) {
            setSaveError('Please select a valid client.')
            return
        }

        const invoiceNumber = values.invoiceNumber.trim().toLowerCase()

        let savedInvoices: Invoice[]

        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            const parsed: unknown = stored ? JSON.parse(stored) : []

            if (!Array.isArray(parsed)) {
                throw new Error('Invalid saved invoice data.')
            }

            savedInvoices = parsed as Invoice[]
        } catch (error) {
            console.error('Could not read saved invoices:', error)
            setSaveError(
                'Could not read saved invoices. Please check browser storage.',
            )
            return
        }

        const duplicateExists = [
            ...mockInvoices,
            ...savedInvoices,
        ].some(
            (invoice) =>
                invoice.invoiceNumber.trim().toLowerCase() === invoiceNumber,
        )

        if (duplicateExists) {
            setSaveError(
                'This invoice number already exists. Please enter a different number.',
            )
            return
        }

        const todayString = getLocalDate()
        const dueDate = new Date(`${values.dueDate}T00:00:00`)
        const today = new Date(`${todayString}T00:00:00`)

        const daysOverdue = Math.max(
            0,
            Math.floor(
                (today.getTime() - dueDate.getTime()) /
                    (1000 * 60 * 60 * 24),
            ),
        )

        const invoice: Invoice = {
            id: `inv-${Date.now()}`,
            userId: 'demo-user',
            clientId: values.clientId,
            clientName: client.name,
            templateId: values.templateId,
            invoiceNumber: values.invoiceNumber.trim(),
            amount: values.amount,
            currency: values.currency,
            issueDate: values.issueDate,
            dueDate: values.dueDate,
            status: values.dueDate < todayString ? 'overdue' : 'pending',
            channels: values.channels,
            remindersEnabled: values.remindersEnabled,
            filePath: null,
            notes: values.notes?.trim() || null,
            paidAt: null,
            createdAt: new Date().toISOString(),
            remindersSent: 0,
            daysOverdue,
        }

        try {
            saveInvoice(invoice)
            setSavedInvoiceNumber(invoice.invoiceNumber)
            setSubmitted(true)
        } catch (error) {
            console.error('Failed to save invoice:', error)
            setSaveError(
                'Could not save the invoice. Please check browser storage and try again.',
            )
        }
    }

    if (submitted) {
        return (
            <div className="rounded-xl border border-border bg-background p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 size={30} aria-hidden="true" />
                </div>

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                    Invoice created successfully
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {savedInvoiceNumber} has been saved in this browser.
                    Backend sync is not connected yet.
                </p>

                <p className="mt-3 text-sm text-foreground">
                    Selected design:{' '}
                    <span className="font-semibold">{selectedDesign.name}</span>
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/invoices"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        View Invoices
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            setSubmitted(false)
                            setSavedInvoiceNumber('')
                            setSaveError('')
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
                    >
                        Create Another
                    </button>
                </div>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <section className="rounded-xl border border-border bg-background p-6">
                <h2 className="text-lg font-semibold text-foreground">
                    Invoice Design
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Select a design for your invoice.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                    {invoiceDesignTemplates.map((template) => {
                        const isSelected =
                            selectedInvoiceTemplateId === template.id

                        return (
                            <button
                                key={template.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() =>
                                    setSelectedInvoiceTemplateId(template.id)
                                }
                                className={[
                                    'rounded-xl border p-3 text-left transition-all',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    isSelected
                                        ? 'border-primary bg-primary-soft ring-2 ring-primary'
                                        : 'border-border hover:bg-surface',
                                ].join(' ')}
                            >
                                <div
                                    className={`flex h-32 flex-col rounded-md border border-slate-200 bg-white p-3 ${template.preview}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`h-2 w-10 rounded ${template.accent}`}
                                        />
                                        <FileText
                                            size={14}
                                            className="text-slate-400"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="mt-4 h-1.5 w-full rounded bg-slate-200" />
                                    <div className="mt-2 h-1.5 w-3/4 rounded bg-slate-200" />

                                    <div className="mt-3 space-y-1.5">
                                        <div className="h-1 w-full rounded bg-slate-100" />
                                        <div className="h-1 w-full rounded bg-slate-100" />
                                        <div className="h-1 w-2/3 rounded bg-slate-100" />
                                    </div>

                                    <div className="mt-auto flex justify-end">
                                        <div
                                            className={`h-3 w-10 rounded ${template.accent}`}
                                        />
                                    </div>
                                </div>

                                <span className="mt-3 flex items-center justify-between gap-1 text-sm font-semibold text-foreground">
                                    {template.name}
                                    {isSelected && (
                                        <CheckCircle2
                                            size={16}
                                            className="shrink-0 text-primary"
                                            aria-hidden="true"
                                        />
                                    )}
                                </span>

                                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">
                                    {template.description}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
                <div className="space-y-6">
                    <section className="rounded-xl border border-border bg-background p-6">
                        <h2 className="text-lg font-semibold text-foreground">
                            Invoice Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Enter the basic information for this invoice.
                        </p>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="clientId" className="text-sm font-medium text-foreground">
                                    Client
                                </label>

                                <select
                                    id="clientId"
                                    {...register('clientId')}
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">Select a client</option>
                                    {mockClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.clientId && (
                                    <p className="text-sm text-danger">
                                        {errors.clientId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="invoiceNumber" className="text-sm font-medium text-foreground">
                                    Invoice Number
                                </label>

                                <input
                                    id="invoiceNumber"
                                    {...register('invoiceNumber')}
                                    placeholder="INV-011"
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                />

                                {errors.invoiceNumber && (
                                    <p className="text-sm text-danger">
                                        {errors.invoiceNumber.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="amount" className="text-sm font-medium text-foreground">
                                    Amount
                                </label>

                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('amount', { valueAsNumber: true })}
                                    placeholder="1250.00"
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                />

                                {errors.amount && (
                                    <p className="text-sm text-danger">
                                        {errors.amount.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="currency" className="text-sm font-medium text-foreground">
                                    Currency
                                </label>

                                <select
                                    id="currency"
                                    {...register('currency')}
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.value} value={currency.value}>
                                            {currency.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="issueDate" className="text-sm font-medium text-foreground">
                                    Issue Date
                                </label>

                                <input
                                    id="issueDate"
                                    type="date"
                                    {...register('issueDate')}
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                />

                                {errors.issueDate && (
                                    <p className="text-sm text-danger">
                                        {errors.issueDate.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                                    Due Date
                                </label>

                                <input
                                    id="dueDate"
                                    type="date"
                                    {...register('dueDate')}
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                />

                                {errors.dueDate && (
                                    <p className="text-sm text-danger">
                                        {errors.dueDate.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-background p-6">
                        <h2 className="text-lg font-semibold text-foreground">
                            Reminder Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Choose how to remind your client.
                        </p>

                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="templateId" className="text-sm font-medium text-foreground">
                                    Reminder Template
                                </label>

                                <select
                                    id="templateId"
                                    {...register('templateId')}
                                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                                >
                                    {mockTemplates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} — {template.tone}
                                        </option>
                                    ))}
                                </select>

                                {errors.templateId && (
                                    <p className="text-sm text-danger">
                                        {errors.templateId.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Reminder Channels
                                </p>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {channelOptions.map((channel) => {
                                        const isSelected =
                                            selectedChannels.includes(channel.value)

                                        const isDisabled =
                                            channel.value === 'whatsapp' &&
                                            !whatsappAvailable

                                        return (
                                            <label
                                                key={channel.value}
                                                className={[
                                                    'flex min-h-12 items-center gap-3 rounded-md border px-4',
                                                    isDisabled
                                                        ? 'cursor-not-allowed border-border bg-surface opacity-60'
                                                        : isSelected
                                                          ? 'cursor-pointer border-primary bg-primary-soft'
                                                          : 'cursor-pointer border-border hover:bg-surface',
                                                ].join(' ')}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isDisabled}
                                                    onChange={() => toggleChannel(channel.value)}
                                                    className="h-4 w-4 rounded border-border text-primary"
                                                />

                                                <span className="text-sm font-medium text-foreground">
                                                    {channel.label}
                                                </span>

                                                {isDisabled && (
                                                    <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                                                        No WhatsApp number
                                                    </span>
                                                )}
                                            </label>
                                        )
                                    })}
                                </div>

                                {errors.channels && (
                                    <p className="mt-2 text-sm text-danger">
                                        {errors.channels.message}
                                    </p>
                                )}
                            </div>

                            <label className="flex min-h-11 cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    {...register('remindersEnabled')}
                                    className="h-4 w-4 rounded border-border text-primary"
                                />

                                <span className="text-sm font-medium text-foreground">
                                    Enable automatic reminders
                                </span>
                            </label>
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-background p-6">
                        <h2 className="text-lg font-semibold text-foreground">
                            Invoice File & Notes
                        </h2>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Upload a document and add optional notes.
                        </p>

                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="file" className="text-sm font-medium text-foreground">
                                    Invoice File
                                </label>

                                <div className="rounded-md border border-dashed border-border p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <Upload
                                            size={28}
                                            className="text-slate-500 dark:text-slate-400"
                                            aria-hidden="true"
                                        />

                                        <p className="mt-3 text-sm font-medium text-foreground">
                                            Upload invoice document
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            PDF, PNG, or JPG · Maximum 10MB
                                        </p>

                                        <input
                                            id="file"
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                                            {...register('file')}
                                            className="mt-4 block w-full max-w-sm text-sm text-foreground"
                                        />
                                    </div>
                                </div>

                                {errors.file?.message && (
                                    <p className="text-sm text-danger">
                                        {String(errors.file.message)}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                    Notes
                                </label>

                                <textarea
                                    id="notes"
                                    rows={4}
                                    {...register('notes')}
                                    placeholder="Add any notes about this invoice..."
                                    className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                />

                                {errors.notes && (
                                    <p className="text-sm text-danger">
                                        {errors.notes.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-4 xl:sticky xl:top-6">
                    <InvoicePreview
                        templateId={selectedInvoiceTemplateId}
                        clientName={selectedClient?.name}
                        invoiceNumber={watchedInvoiceNumber}
                        amount={watchedAmount}
                        currency={watchedCurrency}
                        issueDate={watchedIssueDate}
                        dueDate={watchedDueDate}
                        notes={watchedNotes}
                    />
                </div>
            </section>

            {saveError && (
                <div
                    role="alert"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                >
                    {saveError}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/invoices"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-surface"
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
                </button>
            </div>
        </form>
    )
}