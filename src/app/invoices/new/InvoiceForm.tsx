/**
 * @file src/app/invoices/new/InvoiceForm.tsx
 * @description New invoice form with client, reminder, and file settings.
 * @phase 5
 * @author Payment Chaser Team
 * @created 2026-10-05
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { mockClients } from '@/lib/mock/clients'
import { mockTemplates } from '@/lib/mock/templates'
import type {
    InvoiceInput,
    ReminderChannel,
} from '@/types'

const invoiceSchema = z
    .object({
        clientId: z
            .string()
            .min(1, 'Please select a client.'),

        invoiceNumber: z
            .string()
            .min(1, 'Invoice number is required.')
            .max(50, 'Invoice number is too long.'),

        amount: z
            .number({
                message: 'Amount is required.',
            })
            .positive('Amount must be greater than 0.'),

        currency: z
            .string()
            .min(1, 'Please select a currency.'),

        issueDate: z
            .string()
            .min(1, 'Issue date is required.'),

        dueDate: z
            .string()
            .min(1, 'Due date is required.'),

        templateId: z
            .string()
            .min(
                1,
                'Please select a reminder template.',
            ),

        channels: z
            .array(z.enum(['email', 'whatsapp']))
            .min(
                1,
                'Select at least one reminder channel.',
            ),

        remindersEnabled: z.boolean(),

        notes: z
            .string()
            .max(
                1000,
                'Notes cannot exceed 1000 characters.',
            )
            .optional(),

        file: z
            .instanceof(File)
            .optional(),
    })
    .refine(
        (data) => data.dueDate >= data.issueDate,
        {
            message:
                'Due date cannot be before the issue date.',
            path: ['dueDate'],
        },
    )
    .refine(
        (data) => {
            if (!data.file) {
                return true
            }

            const allowedTypes = [
                'application/pdf',
                'image/png',
                'image/jpeg',
            ]

            return allowedTypes.includes(data.file.type)
        },
        {
            message:
                'Only PDF, PNG, and JPG files are allowed.',
            path: ['file'],
        },
    )
    .refine(
        (data) => {
            if (!data.file) {
                return true
            }

            return data.file.size <= 10 * 1024 * 1024
        },
        {
            message: 'File size must be 10MB or less.',
            path: ['file'],
        },
    )

type InvoiceFormValues = z.infer<typeof invoiceSchema>

const currencies = [
    {
        label: 'USD - US Dollar',
        value: 'USD',
    },
    {
        label: 'BDT - Bangladeshi Taka',
        value: 'BDT',
    },
    {
        label: 'EUR - Euro',
        value: 'EUR',
    },
    {
        label: 'GBP - British Pound',
        value: 'GBP',
    },
]

const channelOptions: {
    label: string
    value: ReminderChannel
}[] = [
    {
        label: 'Email',
        value: 'email',
    },
    {
        label: 'WhatsApp',
        value: 'whatsapp',
    },
]

export function InvoiceForm() {
    const [submitted, setSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),

        defaultValues: {
            clientId: '',
            invoiceNumber: '',
            amount: undefined,
            currency: 'USD',

            issueDate: new Date()
                .toISOString()
                .split('T')[0],

            dueDate: '',

            templateId: 'template-friendly',

            channels: ['email'],

            remindersEnabled: true,

            notes: '',
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

const selectedChannels = useMemo(
    () => watchedChannels ?? [],
    [watchedChannels],
)

    const selectedClient = useMemo(
        () =>
            mockClients.find(
                (client) =>
                    client.id === selectedClientId,
            ),
        [selectedClientId],
    )

    const whatsappAvailable =
        Boolean(selectedClient?.whatsappNumber)

    useEffect(() => {
        if (
            !whatsappAvailable &&
            selectedChannels.includes('whatsapp')
        ) {
            setValue(
                'channels',
                selectedChannels.filter(
                    (channel) =>
                        channel !== 'whatsapp',
                ),
                {
                    shouldValidate: true,
                },
            )
        }
    }, [
        whatsappAvailable,
        selectedChannels,
        setValue,
    ])

    const toggleChannel = (
        channel: ReminderChannel,
    ) => {
        const isSelected =
            selectedChannels.includes(channel)

        if (isSelected) {
            setValue(
                'channels',
                selectedChannels.filter(
                    (item) => item !== channel,
                ),
                {
                    shouldValidate: true,
                },
            )

            return
        }

        setValue(
            'channels',
            [
                ...selectedChannels,
                channel,
            ],
            {
                shouldValidate: true,
            },
        )
    }

    const onSubmit = async (
        values: InvoiceFormValues,
    ) => {
        const invoiceInput: InvoiceInput = {
            clientId: values.clientId,
            invoiceNumber: values.invoiceNumber,
            amount: values.amount,
            currency: values.currency,
            issueDate: values.issueDate,
            dueDate: values.dueDate,
            templateId: values.templateId,
            channels: values.channels,
            remindersEnabled:
                values.remindersEnabled,
            notes:
                values.notes || undefined,
            file: values.file,
        }

        console.log(
            'Mock invoice submission:',
            invoiceInput,
        )

        await new Promise((resolve) =>
            setTimeout(resolve, 500),
        )

        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="rounded-lg border border-border bg-background p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                    <CheckCircle2
                        size={30}
                        aria-hidden="true"
                    />
                </div>

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                    Invoice created successfully
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    The invoice has been created as a
                    pending invoice in mock mode.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/invoices"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        View Invoices
                    </Link>

                    <button
                        type="button"
                        onClick={() =>
                            setSubmitted(false)
                        }
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            <div className="rounded-lg border border-border bg-background p-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Invoice Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Enter the basic information for
                        this invoice.
                    </p>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label
                            htmlFor="clientId"
                            className="text-sm font-medium text-foreground"
                        >
                            Client
                        </label>

                        <select
                            id="clientId"
                            {...register('clientId')}
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="">
                                Select a client
                            </option>

                            {mockClients.map(
                                (client) => (
                                    <option
                                        key={client.id}
                                        value={client.id}
                                    >
                                        {client.name}
                                    </option>
                                ),
                            )}
                        </select>

                        {errors.clientId && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .clientId
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="invoiceNumber"
                            className="text-sm font-medium text-foreground"
                        >
                            Invoice Number
                        </label>

                        <input
                            id="invoiceNumber"
                            {...register(
                                'invoiceNumber',
                            )}
                            placeholder="INV-011"
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary dark:placeholder:text-slate-500"
                        />

                        {errors.invoiceNumber && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .invoiceNumber
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="amount"
                            className="text-sm font-medium text-foreground"
                        >
                            Amount
                        </label>

                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(
                                'amount',
                                {
                                    valueAsNumber:
                                        true,
                                },
                            )}
                            placeholder="1250.00"
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary dark:placeholder:text-slate-500"
                        />

                        {errors.amount && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .amount
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="currency"
                            className="text-sm font-medium text-foreground"
                        >
                            Currency
                        </label>

                        <select
                            id="currency"
                            {...register(
                                'currency',
                            )}
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {currencies.map(
                                (currency) => (
                                    <option
                                        key={
                                            currency.value
                                        }
                                        value={
                                            currency.value
                                        }
                                    >
                                        {
                                            currency.label
                                        }
                                    </option>
                                ),
                            )}
                        </select>

                        {errors.currency && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .currency
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="issueDate"
                            className="text-sm font-medium text-foreground"
                        >
                            Issue Date
                        </label>

                        <input
                            id="issueDate"
                            type="date"
                            {...register(
                                'issueDate',
                            )}
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />

                        {errors.issueDate && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .issueDate
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="dueDate"
                            className="text-sm font-medium text-foreground"
                        >
                            Due Date
                        </label>

                        <input
                            id="dueDate"
                            type="date"
                            {...register(
                                'dueDate',
                            )}
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />

                        {errors.dueDate && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .dueDate
                                        .message
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Reminder Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Choose how Payment Chaser should
                        remind your client.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="templateId"
                            className="text-sm font-medium text-foreground"
                        >
                            Reminder Template
                        </label>

                        <select
                            id="templateId"
                            {...register(
                                'templateId',
                            )}
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {mockTemplates.map(
                                (template) => (
                                    <option
                                        key={
                                            template.id
                                        }
                                        value={
                                            template.id
                                        }
                                    >
                                        {
                                            template.name
                                        }{' '}
                                        —{' '}
                                        {
                                            template.tone
                                        }
                                    </option>
                                ),
                            )}
                        </select>

                        {errors.templateId && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .templateId
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Reminder Channels
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {channelOptions.map(
                                (channel) => {
                                    const isSelected =
                                        selectedChannels.includes(
                                            channel.value,
                                        )

                                    const isDisabled =
                                        channel.value ===
                                            'whatsapp' &&
                                        !whatsappAvailable

                                    return (
                                        <label
                                            key={
                                                channel.value
                                            }
                                            className={[
                                                'flex min-h-12 items-center gap-3 rounded-md border px-4 transition-colors duration-150',
                                                isDisabled
                                                    ? 'cursor-not-allowed border-border bg-surface opacity-60'
                                                    : isSelected
                                                      ? 'cursor-pointer border-primary bg-primary-soft'
                                                      : 'cursor-pointer border-border hover:bg-surface',
                                            ].join(
                                                ' ',
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    isSelected
                                                }
                                                disabled={
                                                    isDisabled
                                                }
                                                onChange={() =>
                                                    toggleChannel(
                                                        channel.value,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                            />

                                            <span className="text-sm font-medium text-foreground">
                                                {
                                                    channel.label
                                                }
                                            </span>

                                            {isDisabled && (
                                                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                                                    No
                                                    WhatsApp
                                                    number
                                                </span>
                                            )}
                                        </label>
                                    )
                                },
                            )}
                        </div>

                        {errors.channels && (
                            <p className="mt-2 text-sm text-danger">
                                {
                                    errors
                                        .channels
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            {...register(
                                'remindersEnabled',
                            )}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />

                        <span className="text-sm font-medium text-foreground">
                            Enable automatic reminders
                        </span>
                    </label>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Invoice File & Notes
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Upload the invoice document and add
                        optional notes.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="file"
                            className="text-sm font-medium text-foreground"
                        >
                            Invoice File
                        </label>

                        <div className="rounded-md border border-dashed border-border p-6">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Upload
                                    size={28}
                                    className="text-slate-500 dark:text-slate-400"
                                    aria-hidden="true"
                                />

                                <p className="mt-3 text-sm font-medium text-foreground">
                                    Upload invoice
                                    document
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    PDF, PNG, or JPG ·
                                    Maximum 10MB
                                </p>

                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                                    {...register(
                                        'file',
                                    )}
                                    className="mt-4 block w-full max-w-sm text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary-soft"
                                />
                            </div>
                        </div>

                        {errors.file && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .file
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="notes"
                            className="text-sm font-medium text-foreground"
                        >
                            Notes
                        </label>

                        <textarea
                            id="notes"
                            rows={4}
                            {...register('notes')}
                            placeholder="Add any notes about this invoice..."
                            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary dark:placeholder:text-slate-500"
                        />

                        {errors.notes && (
                            <p className="text-sm text-danger">
                                {
                                    errors
                                        .notes
                                        .message
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/invoices"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <ArrowLeft
                        size={17}
                        aria-hidden="true"
                    />
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting
                        ? 'Creating Invoice...'
                        : 'Create Invoice'}
                </button>
            </div>
        </form>
    )
}