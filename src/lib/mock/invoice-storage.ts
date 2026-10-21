import type { Invoice } from '@/types'
import { mockInvoices } from '@/lib/mock/invoices'

const STORAGE_KEY = 'payment-chaser-created-invoices'

export function getAllInvoices(): Invoice[] {
    if (typeof window === 'undefined') {
        return mockInvoices
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const saved: Invoice[] = stored ? JSON.parse(stored) : []

        const savedIds = new Set(saved.map((invoice) => invoice.id))

        return [
            ...saved,
            ...mockInvoices.filter((invoice) => !savedIds.has(invoice.id)),
        ]
    } catch (error) {
        console.error('Failed to load invoices:', error)
        return mockInvoices
    }
}

export function saveInvoice(invoice: Invoice): void {
    if (typeof window === 'undefined') {
        throw new Error('Browser storage is unavailable.')
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const saved: Invoice[] = stored ? JSON.parse(stored) : []

        const existingIndex = saved.findIndex(
            (item) => item.id === invoice.id,
        )

        let updated: Invoice[]

        if (existingIndex >= 0) {
            updated = saved.map((item) =>
                item.id === invoice.id ? invoice : item,
            )
        } else {
            updated = [invoice, ...saved]
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
        console.error('Failed to save invoice:', error)
        throw new Error('Invoice could not be saved.')
    }
}