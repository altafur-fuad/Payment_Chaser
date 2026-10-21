/**
 * @file src/lib/constants.ts
 * @description Shared application constants for routes, statuses, and options.
 * @phase 4
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import type {
    InvoiceStatus,
    ReminderChannel,
    ReminderTone,
} from '@/types'

export const ROUTES = {
    home: '/',
    dashboard: '/dashboard',
    invoices: '/invoices',
    newInvoice: '/invoices/new',
    clients: '/clients',
    templates: '/templates',
    settings: '/settings',
    billing: '/settings/billing',
    pricing: '/pricing',
    login: '/login',
    signup: '/signup',
} as const

export const INVOICE_STATUS_LABELS: Record<
    InvoiceStatus,
    string
> = {
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
}

export const REMINDER_TONE_LABELS: Record<
    ReminderTone,
    string
> = {
    friendly: 'Friendly',
    firm: 'Firm',
    urgent: 'Urgent',
}

export const REMINDER_CHANNEL_LABELS: Record<
    ReminderChannel,
    string
> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
}

export const INVOICE_STATUS_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
] as const

export const REMINDER_TONE_OPTIONS = [
    { label: 'Friendly', value: 'friendly' },
    { label: 'Firm', value: 'firm' },
    { label: 'Urgent', value: 'urgent' },
] as const

export const REMINDER_CHANNEL_OPTIONS = [
    { label: 'Email', value: 'email' },
    { label: 'WhatsApp', value: 'whatsapp' },
] as const