/**
 * @file src/lib/mock/storage.ts
 * @description Unified browser mock-data storage and synchronization layer.
 */

import type {
    Client,
    ClientInput,
    DashboardStats,
    Invoice,
    NeedsAttentionItem,
    Profile,
    ProfileInput,
    Template,
    TemplateInput,
    UpcomingInvoice,
} from '@/types'

export interface ReminderActivityItem {
    id: string
    invoiceId?: string
    invoiceNumber?: string
    clientName: string
    channel: string
    status: string
    sentAt: string
}

import { mockInvoices } from './invoices'
import { mockClients } from './clients'
import { mockTemplates } from './templates'

const INVOICES_STORAGE_KEY = 'payment-chaser-invoices'
const LEGACY_INVOICES_KEY = 'payment-chaser-created-invoices'
const CLIENTS_STORAGE_KEY = 'payment-chaser-clients'
const TEMPLATES_STORAGE_KEY = 'payment-chaser-templates'
const PROFILE_STORAGE_KEY = 'payment-chaser-profile'

const STORAGE_EVENT_NAME = 'payment-chaser-storage-update'

export const defaultProfile: Profile = {
    id: 'profile-demo',
    displayName: 'Mahatab Hossan',
    businessName: 'Mahatab Studio',
    email: 'demo@paymentchaser.com',
    timezone: 'Asia/Dhaka',
    defaultCurrency: 'USD',
    createdAt: '2026-09-01T00:00:00Z',
}

// ----------------------------------------------------------------------
// In-Memory Snapshot Caches for React useSyncExternalStore
// ----------------------------------------------------------------------

let cachedInvoices: Invoice[] | null = null
let cachedInvoicesRaw: string | null = null

let cachedClients: Client[] | null = null
let cachedClientsRaw: string | null = null

let cachedTemplates: Template[] | null = null
let cachedTemplatesRaw: string | null = null

let cachedProfile: Profile | null = null
let cachedProfileRaw: string | null = null

// ----------------------------------------------------------------------
// Storage Event Dispatcher & Subscriber
// ----------------------------------------------------------------------

function notifyStorageChange(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(STORAGE_EVENT_NAME))
    }
}

export function subscribeToStorage(callback: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => {}
    }

    const handler = () => callback()

    window.addEventListener(STORAGE_EVENT_NAME, handler)
    window.addEventListener('storage', handler)

    return () => {
        window.removeEventListener(STORAGE_EVENT_NAME, handler)
        window.removeEventListener('storage', handler)
    }
}

// ----------------------------------------------------------------------
// Invoice ID Generator
// ----------------------------------------------------------------------

let counter = 0

export function generateInvoiceId(): string {
    counter += 1
    const timestamp = Date.now()
    return `inv-${timestamp}-${counter}`
}

export function generateClientId(): string {
    counter += 1
    const timestamp = Date.now()
    return `client-${timestamp}-${counter}`
}

export function generateTemplateId(): string {
    counter += 1
    const timestamp = Date.now()
    return `template-${timestamp}-${counter}`
}

// ----------------------------------------------------------------------
// Invoices Management
// ----------------------------------------------------------------------

export function getAllInvoices(): Invoice[] {
    if (typeof window === 'undefined') {
        return mockInvoices
    }

    try {
        const stored = localStorage.getItem(INVOICES_STORAGE_KEY)
        if (stored !== null && stored === cachedInvoicesRaw && cachedInvoices !== null) {
            return cachedInvoices
        }

        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
                cachedInvoicesRaw = stored
                cachedInvoices = parsed as Invoice[]
                return cachedInvoices
            }
        }

        // Backward compatibility with previous key
        const legacyStored = localStorage.getItem(LEGACY_INVOICES_KEY)
        if (legacyStored) {
            const legacyParsed = JSON.parse(legacyStored)
            if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
                const legacyList = legacyParsed as Invoice[]
                const legacyIds = new Set(legacyList.map((inv) => inv.id))
                const combined = [
                    ...legacyList,
                    ...mockInvoices.filter((inv) => !legacyIds.has(inv.id)),
                ]
                const serialized = JSON.stringify(combined)
                localStorage.setItem(
                    INVOICES_STORAGE_KEY,
                    serialized,
                )
                cachedInvoicesRaw = serialized
                cachedInvoices = combined
                return combined
            }
        }

        // Initial seeding
        const initial = JSON.stringify(mockInvoices)
        localStorage.setItem(
            INVOICES_STORAGE_KEY,
            initial,
        )
        cachedInvoicesRaw = initial
        cachedInvoices = mockInvoices
        return mockInvoices
    } catch (error) {
        console.error('Failed to load invoices from localStorage:', error)
        return cachedInvoices ?? mockInvoices
    }
}

export function getInvoiceById(id: string): Invoice | undefined {
    const invoices = getAllInvoices()
    return invoices.find((invoice) => invoice.id === id)
}

export function isInvoiceNumberTaken(
    invoiceNumber: string,
    currentInvoiceId?: string,
): boolean {
    const normalized = invoiceNumber.trim().toLowerCase()
    if (!normalized) return false

    const invoices = getAllInvoices()
    return invoices.some(
        (invoice) =>
            invoice.invoiceNumber.trim().toLowerCase() === normalized &&
            invoice.id !== currentInvoiceId,
    )
}

export function saveInvoice(invoice: Invoice): Invoice {
    if (typeof window === 'undefined') {
        return invoice
    }

    try {
        const currentInvoices = getAllInvoices()
        const existingIndex = currentInvoices.findIndex(
            (item) => item.id === invoice.id,
        )

        let updated: Invoice[]
        if (existingIndex >= 0) {
            updated = currentInvoices.map((item) =>
                item.id === invoice.id ? invoice : item,
            )
        } else {
            updated = [invoice, ...currentInvoices]
        }

        const serialized = JSON.stringify(updated)
        localStorage.setItem(INVOICES_STORAGE_KEY, serialized)
        // Maintain legacy key for any unmigrated component
        localStorage.setItem(LEGACY_INVOICES_KEY, serialized)
        cachedInvoicesRaw = serialized
        cachedInvoices = updated
        notifyStorageChange()
        return invoice
    } catch (error) {
        console.error('Failed to save invoice:', error)
        throw new Error('Invoice could not be saved.')
    }
}

export function markInvoiceAsPaid(id: string): Invoice | undefined {
    const invoice = getInvoiceById(id)
    if (!invoice) return undefined

    const today = new Date().toISOString().split('T')[0]
    const updatedInvoice: Invoice = {
        ...invoice,
        status: 'paid',
        paidAt: today,
        remindersEnabled: false,
        daysOverdue: 0,
    }

    saveInvoice(updatedInvoice)
    return updatedInvoice
}

export function deleteInvoice(id: string): boolean {
    if (typeof window === 'undefined') return false

    try {
        const currentInvoices = getAllInvoices()
        const nextInvoices = currentInvoices.filter((item) => item.id !== id)
        const serialized = JSON.stringify(nextInvoices)
        localStorage.setItem(
            INVOICES_STORAGE_KEY,
            serialized,
        )
        localStorage.setItem(
            LEGACY_INVOICES_KEY,
            serialized,
        )
        cachedInvoicesRaw = serialized
        cachedInvoices = nextInvoices
        notifyStorageChange()
        return true
    } catch (error) {
        console.error('Failed to delete invoice:', error)
        return false
    }
}

// ----------------------------------------------------------------------
// Clients Management
// ----------------------------------------------------------------------

export function getAllClients(): Client[] {
    if (typeof window === 'undefined') {
        return mockClients
    }

    try {
        const stored = localStorage.getItem(CLIENTS_STORAGE_KEY)
        if (stored !== null && stored === cachedClientsRaw && cachedClients !== null) {
            return cachedClients
        }

        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
                cachedClientsRaw = stored
                cachedClients = parsed as Client[]
                return cachedClients
            }
        }

        // Initialize with default mock clients
        const initial = JSON.stringify(mockClients)
        localStorage.setItem(
            CLIENTS_STORAGE_KEY,
            initial,
        )
        cachedClientsRaw = initial
        cachedClients = mockClients
        return mockClients
    } catch (error) {
        console.error('Failed to load clients:', error)
        return cachedClients ?? mockClients
    }
}

export function getClientById(id: string): Client | undefined {
    const clients = getAllClients()
    return clients.find((client) => client.id === id)
}

export function saveClient(client: Client): Client {
    if (typeof window === 'undefined') return client

    try {
        const currentClients = getAllClients()
        const existingIndex = currentClients.findIndex(
            (item) => item.id === client.id,
        )

        let updated: Client[]
        if (existingIndex >= 0) {
            updated = currentClients.map((item) =>
                item.id === client.id ? client : item,
            )
        } else {
            updated = [client, ...currentClients]
        }

        const serialized = JSON.stringify(updated)
        localStorage.setItem(CLIENTS_STORAGE_KEY, serialized)
        cachedClientsRaw = serialized
        cachedClients = updated
        notifyStorageChange()
        return client
    } catch (error) {
        console.error('Failed to save client:', error)
        throw new Error('Client could not be saved.')
    }
}

export function createClient(input: ClientInput): Client {
    const newClient: Client = {
        id: generateClientId(),
        userId: 'demo-user',
        name: input.name.trim(),
        email: input.email?.trim() || null,
        whatsappNumber: input.whatsappNumber?.trim() || null,
        preferredChannel: input.preferredChannel,
        createdAt: new Date().toISOString().split('T')[0],
        invoiceCount: 0,
        outstandingAmount: 0,
    }

    return saveClient(newClient)
}

// ----------------------------------------------------------------------
// Templates Management
// ----------------------------------------------------------------------

export function getAllTemplates(): Template[] {
    if (typeof window === 'undefined') {
        return mockTemplates
    }

    try {
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY)
        if (stored !== null && stored === cachedTemplatesRaw && cachedTemplates !== null) {
            return cachedTemplates
        }

        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
                cachedTemplatesRaw = stored
                cachedTemplates = parsed as Template[]
                return cachedTemplates
            }
        }

        // Initialize with default mock templates
        const initial = JSON.stringify(mockTemplates)
        localStorage.setItem(
            TEMPLATES_STORAGE_KEY,
            initial,
        )
        cachedTemplatesRaw = initial
        cachedTemplates = mockTemplates
        return mockTemplates
    } catch (error) {
        console.error('Failed to load templates:', error)
        return cachedTemplates ?? mockTemplates
    }
}

export function getTemplateById(id: string): Template | undefined {
    const templates = getAllTemplates()
    return templates.find((template) => template.id === id)
}

export function saveTemplate(template: Template): Template {
    if (typeof window === 'undefined') return template

    try {
        const currentTemplates = getAllTemplates()
        const existingIndex = currentTemplates.findIndex(
            (item) => item.id === template.id,
        )

        let updated: Template[]
        if (existingIndex >= 0) {
            updated = currentTemplates.map((item) =>
                item.id === template.id ? template : item,
            )
        } else {
            updated = [...currentTemplates, template]
        }

        const serialized = JSON.stringify(updated)
        localStorage.setItem(
            TEMPLATES_STORAGE_KEY,
            serialized,
        )
        cachedTemplatesRaw = serialized
        cachedTemplates = updated
        notifyStorageChange()
        return template
    } catch (error) {
        console.error('Failed to save template:', error)
        throw new Error('Template could not be saved.')
    }
}

export function createTemplate(input: TemplateInput): Template {
    const newTemplate: Template = {
        id: generateTemplateId(),
        userId: 'demo-user',
        name: input.name.trim(),
        tone: input.tone,
        subject: input.subject.trim(),
        body: input.body.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        isDefault: false,
    }

    return saveTemplate(newTemplate)
}

export function deleteTemplate(id: string): boolean {
    if (typeof window === 'undefined') return false

    try {
        const currentTemplates = getAllTemplates()
        const target = currentTemplates.find((t) => t.id === id)
        if (!target || target.isDefault) {
            return false
        }

        const nextTemplates = currentTemplates.filter((t) => t.id !== id)
        const serialized = JSON.stringify(nextTemplates)
        localStorage.setItem(
            TEMPLATES_STORAGE_KEY,
            serialized,
        )
        cachedTemplatesRaw = serialized
        cachedTemplates = nextTemplates
        notifyStorageChange()
        return true
    } catch (error) {
        console.error('Failed to delete template:', error)
        return false
    }
}

// ----------------------------------------------------------------------
// Profile / Settings Management
// ----------------------------------------------------------------------

export function getProfile(): Profile {
    if (typeof window === 'undefined') {
        return defaultProfile
    }

    try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
        if (stored !== null && stored === cachedProfileRaw && cachedProfile !== null) {
            return cachedProfile
        }

        if (stored) {
            const parsed = JSON.parse(stored) as Profile
            cachedProfileRaw = stored
            cachedProfile = parsed
            return cachedProfile
        }

        const initial = JSON.stringify(defaultProfile)
        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            initial,
        )
        cachedProfileRaw = initial
        cachedProfile = defaultProfile
        return defaultProfile
    } catch (error) {
        console.error('Failed to load profile:', error)
        return cachedProfile ?? defaultProfile
    }
}

export function saveProfile(input: ProfileInput): Profile {
    const current = getProfile()
    const updated: Profile = {
        ...current,
        displayName: input.displayName.trim(),
        businessName: input.businessName?.trim() || null,
        timezone: input.timezone,
        defaultCurrency: input.defaultCurrency,
    }

    if (typeof window !== 'undefined') {
        try {
            const serialized = JSON.stringify(updated)
            localStorage.setItem(
                PROFILE_STORAGE_KEY,
                serialized,
            )
            cachedProfileRaw = serialized
            cachedProfile = updated
            notifyStorageChange()
        } catch (error) {
            console.error('Failed to save profile:', error)
            throw new Error('Profile could not be saved.')
        }
    }

    return updated
}

// ----------------------------------------------------------------------
// Dashboard Calculations & Aggregates
// ----------------------------------------------------------------------

export function calculateDashboardStats(invoices: Invoice[]): DashboardStats {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let totalOutstanding = 0
    let totalOverdue = 0
    let paidThisMonth = 0
    let remindersSentThisWeek = 0

    for (const invoice of invoices) {
        if (invoice.status === 'pending') {
            totalOutstanding += invoice.amount
            if (invoice.dueDate && new Date(invoice.dueDate) < now) {
                totalOverdue += invoice.amount
            }
        } else if (invoice.status === 'overdue') {
            totalOutstanding += invoice.amount
            totalOverdue += invoice.amount
        } else if (invoice.status === 'paid') {
            const dateStr = invoice.paidAt || invoice.createdAt
            const date = new Date(dateStr)
            if (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            ) {
                paidThisMonth += invoice.amount
            }
        }

        if (invoice.remindersSent) {
            remindersSentThisWeek += invoice.remindersSent
        }
    }

    return {
        totalOutstanding,
        totalOverdue,
        paidThisMonth,
        remindersSentThisWeek,
        currency: 'USD',
    }
}

export function getNeedsAttentionItems(
    invoices: Invoice[],
): NeedsAttentionItem[] {
    const now = new Date()

    return invoices
        .filter(
            (inv) =>
                inv.status === 'overdue' ||
                (inv.status === 'pending' &&
                    inv.dueDate &&
                    new Date(inv.dueDate) < now),
        )
        .sort((a, b) => (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0))
        .map((inv) => ({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName,
            amount: inv.amount,
            currency: inv.currency,
            daysOverdue: inv.daysOverdue ?? 0,
        }))
}

export function getUpcomingInvoicesList(
    invoices: Invoice[],
): UpcomingInvoice[] {
    const now = new Date()
    const todayTimestamp = now.getTime()

    return invoices
        .filter((inv) => inv.status === 'pending')
        .map((inv) => {
            const dueTimestamp = new Date(
                `${inv.dueDate}T00:00:00`,
            ).getTime()
            const diffDays = Math.max(
                0,
                Math.ceil(
                    (dueTimestamp - todayTimestamp) / (1000 * 60 * 60 * 24),
                ),
            )
            return {
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                clientName: inv.clientName,
                amount: inv.amount,
                currency: inv.currency,
                dueDate: inv.dueDate,
                daysUntilDue: diffDays,
            }
        })
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

export function getRecentRemindersList(
    invoices: Invoice[],
): ReminderActivityItem[] {
    return invoices
        .filter((inv) => (inv.remindersSent ?? 0) > 0)
        .slice(0, 5)
        .map((inv) => ({
            id: `rem-${inv.id}`,
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName,
            channel: inv.channels.includes('whatsapp')
                ? 'WhatsApp'
                : 'Email',
            status: 'Delivered',
            sentAt: 'Recent',
        }))
}
