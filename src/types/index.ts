/**
 * @file src/types/index.ts
 * @description All shared TypeScript interfaces and types for Payment Chaser
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

// ============================================================
// Core Enums (as string unions)
// ============================================================

export type InvoiceStatus = 'pending' | 'paid' | 'overdue'

export type ReminderChannel = 'email' | 'whatsapp'

export type ReminderTone = 'friendly' | 'firm' | 'urgent'

export type ReminderStatus =
    | 'scheduled'
    | 'sent'
    | 'delivered'
    | 'failed'
    | 'cancelled'

export type PlanTier = 'free' | 'pro' | 'studio'

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled'

// ============================================================
// Core Entities
// ============================================================

export interface Profile {
    id: string
    displayName: string
    businessName: string | null
    email: string
    timezone: string
    defaultCurrency: string
    createdAt: string
}

export interface Client {
    id: string
    userId: string
    name: string
    email: string | null
    whatsappNumber: string | null
    preferredChannel: ReminderChannel
    createdAt: string
    // Computed / joined fields (optional, present when listed with stats)
    invoiceCount?: number
    outstandingAmount?: number
}

export interface Template {
    id: string
    userId: string
    name: string
    tone: ReminderTone
    subject: string
    body: string
    createdAt: string
    isDefault?: boolean
}

export interface Invoice {
    id: string
    userId: string
    clientId: string
    clientName: string
    templateId: string | null
    invoiceNumber: string
    amount: number
    currency: string
    issueDate: string // ISO date string
    dueDate: string // ISO date string
    status: InvoiceStatus
    channels: ReminderChannel[]
    remindersEnabled: boolean
    filePath: string | null
    fileUrl?: string // signed URL when available
    notes: string | null
    paidAt: string | null
    createdAt: string
    // Computed fields
    remindersSent?: number
    daysOverdue?: number
}

export interface Reminder {
    id: string
    userId: string
    invoiceId: string
    channel: ReminderChannel
    tone: ReminderTone
    sendAt: string
    status: ReminderStatus
    attempts: number
    providerMessageId: string | null
    error: string | null
    sentAt: string | null
    createdAt: string
}

export interface Subscription {
    id: string
    userId: string
    paddleSubscriptionId: string | null
    plan: PlanTier
    status: SubscriptionStatus
    currentPeriodEnd: string | null
    updatedAt: string
}

// ============================================================
// Dashboard Aggregates
// ============================================================

export interface DashboardStats {
    totalOutstanding: number
    totalOverdue: number
    paidThisMonth: number
    remindersSentThisWeek: number
    currency: string
}

export interface NeedsAttentionItem {
    invoiceId: string
    clientName: string
    amount: number
    currency: string
    daysOverdue: number
    invoiceNumber: string
}

export interface UpcomingInvoice {
    invoiceId: string
    clientName: string
    amount: number
    currency: string
    dueDate: string
    daysUntilDue: number
    invoiceNumber: string
}

// ============================================================
// Input Types (for forms and Server Actions)
// ============================================================

export interface InvoiceInput {
    clientId: string
    invoiceNumber: string
    amount: number
    currency: string
    issueDate: string
    dueDate: string
    templateId: string
    channels: ReminderChannel[]
    remindersEnabled: boolean
    notes?: string
    file?: File
}

export interface ClientInput {
    name: string
    email?: string
    whatsappNumber?: string
    preferredChannel: ReminderChannel
}

export interface TemplateInput {
    name: string
    tone: ReminderTone
    subject: string
    body: string
}

export interface ProfileInput {
    displayName: string
    businessName?: string
    timezone: string
    defaultCurrency: string
}

export interface InvoiceFilters {
    status?: InvoiceStatus | 'all'
    search?: string
    clientId?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    pageSize?: number
}

// ============================================================
// Result Type for Server Actions
// ============================================================

export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedResult<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

export interface InvoiceListResult extends PaginatedResult<Invoice> {
    counts: {
        all: number
        pending: number
        paid: number
        overdue: number
    }
}

// ============================================================
// UI Helper Types
// ============================================================

export interface SelectOption<T = string> {
    label: string
    value: T
}

export interface NavItem {
    label: string
    href: string
    icon: string
    badge?: number
}