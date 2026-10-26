'use server'

/**
 * @file src/app/actions/dashboard.ts
 * @description Type-safe Server Actions for dashboard metrics and attention lists.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type {
    DashboardStats,
    NeedsAttentionItem,
    Result,
    UpcomingInvoice,
} from '@/types'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import * as mockStorage from '@/lib/mock/storage'

export async function getDashboardStats(): Promise<Result<DashboardStats>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            const invoices = mockStorage.getAllInvoices()
            return { ok: true, data: mockStorage.calculateDashboardStats(invoices) }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        // Fetch user default currency
        const { data: profile } = await supabase
            .from('profiles')
            .select('default_currency')
            .eq('id', user.id)
            .maybeSingle()

        const currency = profile?.default_currency || 'USD'

        // Fetch all invoices for the authenticated user
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('amount, status, due_date, paid_at')

        if (invError) {
            return { ok: false, error: 'Failed to calculate dashboard statistics.' }
        }

        const now = new Date()
        const todayString = now.toISOString().split('T')[0]
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        let totalOutstanding = 0
        let totalOverdue = 0
        let paidThisMonth = 0

        if (invoices) {
            for (const inv of invoices) {
                const amount = Number(inv.amount)
                if (inv.status === 'pending') {
                    totalOutstanding += amount
                    if (inv.due_date < todayString) {
                        totalOverdue += amount
                    }
                } else if (inv.status === 'overdue') {
                    totalOutstanding += amount
                    totalOverdue += amount
                } else if (inv.status === 'paid' && inv.paid_at) {
                    const paidDate = new Date(inv.paid_at)
                    if (
                        paidDate.getMonth() === currentMonth &&
                        paidDate.getFullYear() === currentYear
                    ) {
                        paidThisMonth += amount
                    }
                }
            }
        }

        // Count reminders sent this week
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { count: remindersCount } = await supabase
            .from('reminders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'sent')
            .gte('sent_at', weekAgo)

        return {
            ok: true,
            data: {
                totalOutstanding,
                totalOverdue,
                paidThisMonth,
                remindersSentThisWeek: remindersCount || 0,
                currency,
            },
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve dashboard stats.'
        return { ok: false, error: message }
    }
}

export async function getNeedsAttention(): Promise<Result<NeedsAttentionItem[]>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            const invoices = mockStorage.getAllInvoices()
            return { ok: true, data: mockStorage.getNeedsAttentionItems(invoices) }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const todayString = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount, currency, due_date, status, clients(name)')
            .or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${todayString})`)
            .order('due_date', { ascending: true })

        if (error) {
            return { ok: false, error: 'Failed to fetch overdue invoices.' }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const items: NeedsAttentionItem[] = (data || []).map((inv) => {
            const clientRecord = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
            const clientName = clientRecord?.name || 'Unknown Client'
            const dueDate = new Date(`${inv.due_date}T00:00:00`)
            const daysOverdue = Math.max(
                0,
                Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            )

            return {
                invoiceId: inv.id,
                invoiceNumber: inv.invoice_number,
                clientName,
                amount: Number(inv.amount),
                currency: inv.currency,
                daysOverdue,
            }
        })

        items.sort((a, b) => b.daysOverdue - a.daysOverdue)

        return { ok: true, data: items }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to query attention items.'
        return { ok: false, error: message }
    }
}

export async function getUpcomingInvoices(): Promise<Result<UpcomingInvoice[]>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            const invoices = mockStorage.getAllInvoices()
            return { ok: true, data: mockStorage.getUpcomingInvoicesList(invoices) }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const todayString = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount, currency, due_date, status, clients(name)')
            .eq('status', 'pending')
            .gte('due_date', todayString)
            .order('due_date', { ascending: true })
            .limit(10)

        if (error) {
            return { ok: false, error: 'Failed to fetch upcoming invoices.' }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const items: UpcomingInvoice[] = (data || []).map((inv) => {
            const clientRecord = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
            const clientName = clientRecord?.name || 'Unknown Client'
            const dueDate = new Date(`${inv.due_date}T00:00:00`)
            const daysUntilDue = Math.max(
                0,
                Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            )

            return {
                invoiceId: inv.id,
                invoiceNumber: inv.invoice_number,
                clientName,
                amount: Number(inv.amount),
                currency: inv.currency,
                dueDate: inv.due_date,
                daysUntilDue,
            }
        })

        return { ok: true, data: items }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to query upcoming invoices.'
        return { ok: false, error: message }
    }
}

export async function getRecentActivity(): Promise<Result<mockStorage.ReminderActivityItem[]>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            const invoices = mockStorage.getAllInvoices()
            return { ok: true, data: mockStorage.getRecentRemindersList(invoices) }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const { data, error } = await supabase
            .from('reminders')
            .select('id, invoice_id, channel, status, sent_at, invoices(invoice_number, clients(name))')
            .neq('status', 'scheduled')
            .order('sent_at', { ascending: false })
            .limit(5)

        if (error) {
            return { ok: false, error: 'Failed to retrieve recent activity.' }
        }

        const items: mockStorage.ReminderActivityItem[] = (data || []).map((rem) => {
            const invRecord = Array.isArray(rem.invoices) ? rem.invoices[0] : rem.invoices
            const clientRecord = invRecord && typeof invRecord === 'object' && 'clients' in invRecord
                ? (Array.isArray(invRecord.clients) ? invRecord.clients[0] : invRecord.clients)
                : null
            const clientName = clientRecord && typeof clientRecord === 'object' && 'name' in clientRecord
                ? (clientRecord as { name: string }).name
                : 'Client'

            return {
                id: rem.id,
                invoiceId: rem.invoice_id,
                invoiceNumber: invRecord?.invoice_number || 'INV',
                clientName,
                channel: rem.channel === 'whatsapp' ? 'WhatsApp' : 'Email',
                status: rem.status.charAt(0).toUpperCase() + rem.status.slice(1),
                sentAt: rem.sent_at || 'Recently',
            }
        })

        return { ok: true, data: items }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to query recent activity.'
        return { ok: false, error: message }
    }
}
