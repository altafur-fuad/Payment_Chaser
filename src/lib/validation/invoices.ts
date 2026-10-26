/**
 * @file src/lib/validation/invoices.ts
 * @description Zod validation schemas for invoice mutations and queries.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { z } from 'zod'

export const invoiceSchema = z
    .object({
        clientId: z.string().min(1, 'Please select a client.'),
        invoiceNumber: z
            .string()
            .trim()
            .min(1, 'Invoice number is required.')
            .max(50, 'Invoice number is too long.'),
        amount: z.coerce
            .number({ message: 'Amount is required.' })
            .positive('Amount must be greater than 0.')
            .finite('Enter a valid amount.'),
        currency: z.string().min(1, 'Currency is required.'),
        issueDate: z.string().min(1, 'Issue date is required.'),
        dueDate: z.string().min(1, 'Due date is required.'),
        templateId: z.string().min(1, 'Please select a reminder template.'),
        channels: z
            .array(z.enum(['email', 'whatsapp']))
            .min(1, 'Select at least one reminder channel.'),
        remindersEnabled: z.boolean().default(true),
        notes: z
            .string()
            .max(1000, 'Notes cannot exceed 1000 characters.')
            .optional()
            .or(z.literal('')),
    })
    .refine((data) => data.dueDate >= data.issueDate, {
        message: 'Due date cannot be before the issue date.',
        path: ['dueDate'],
    })

export type InvoiceInputValidated = z.infer<typeof invoiceSchema>

export const invoiceFiltersSchema = z.object({
    status: z.enum(['all', 'pending', 'paid', 'overdue', 'cancelled']).optional().default('all'),
    search: z.string().optional(),
    clientId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(10),
})
