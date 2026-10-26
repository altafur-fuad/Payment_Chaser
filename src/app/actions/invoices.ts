'use server'

/**
 * @file src/app/actions/invoices.ts
 * @description Type-safe Server Actions for invoice CRUD, payment marking, and status logic.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { invoiceSchema } from '@/lib/validation/invoices'
import type {
    Invoice,
    InvoiceFilters,
    InvoiceInput,
    InvoiceListResult,
    ReminderChannel,
    Result,
} from '@/types'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'
import * as mockStorage from '@/lib/mock/storage'

function formatZodErrors(issues: Array<{ path: unknown[]; message: string }>): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of issues) {
        const path = issue.path.map(String).join('.') || 'general'
        if (!fieldErrors[path]) {
            fieldErrors[path] = []
        }
        fieldErrors[path].push(issue.message)
    }
    return fieldErrors
}

interface DbInvoiceRow {
    id: string
    user_id: string
    client_id: string
    template_id: string | null
    invoice_number: string
    amount: number | string
    currency: string
    issue_date: string
    due_date: string
    status: 'pending' | 'paid' | 'overdue'
    channels: ReminderChannel[]
    reminders_enabled: boolean
    file_path: string | null
    notes: string | null
    paid_at: string | null
    created_at: string
    clients?: { name: string } | { name: string }[] | null
}

function calculateDaysOverdue(dueDateString: string, status: string): number {
    if (status === 'paid') return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(`${dueDateString.slice(0, 10)}T00:00:00`)
    const diffTime = today.getTime() - due.getTime()
    return diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0
}

function mapDbToInvoice(row: DbInvoiceRow, remindersSentCount = 0): Invoice {
    const clientRecord = Array.isArray(row.clients) ? row.clients[0] : row.clients
    const clientName = clientRecord?.name || 'Unknown Client'
    const daysOverdue = calculateDaysOverdue(row.due_date, row.status)

    return {
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        clientName,
        templateId: row.template_id,
        invoiceNumber: row.invoice_number,
        amount: Number(row.amount),
        currency: row.currency,
        issueDate: row.issue_date,
        dueDate: row.due_date,
        status: row.status,
        channels: row.channels || ['email'],
        remindersEnabled: row.reminders_enabled,
        filePath: row.file_path,
        notes: row.notes,
        paidAt: row.paid_at,
        createdAt: row.created_at,
        remindersSent: remindersSentCount,
        daysOverdue,
    }
}

export async function getInvoices(
    filters?: InvoiceFilters
): Promise<Result<InvoiceListResult>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            const all = mockStorage.getAllInvoices()
            const statusFilter = filters?.status || 'all'
            const search = filters?.search?.trim().toLowerCase() || ''
            const page = filters?.page || 1
            const pageSize = filters?.pageSize || 10

            let filtered = all
            if (statusFilter !== 'all') {
                filtered = filtered.filter((i) => i.status === statusFilter)
            }
            if (search) {
                filtered = filtered.filter(
                    (i) =>
                        i.clientName.toLowerCase().includes(search) ||
                        i.invoiceNumber.toLowerCase().includes(search)
                )
            }

            const total = filtered.length
            const startIndex = (page - 1) * pageSize
            const items = filtered.slice(startIndex, startIndex + pageSize)

            return {
                ok: true,
                data: {
                    items,
                    total,
                    page,
                    pageSize,
                    hasMore: startIndex + pageSize < total,
                    counts: {
                        all: all.length,
                        pending: all.filter((i) => i.status === 'pending').length,
                        paid: all.filter((i) => i.status === 'paid').length,
                        overdue: all.filter((i) => i.status === 'overdue').length,
                    },
                },
            }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        // Fetch counts for all statuses
        const { data: countRows, error: countErr } = await supabase
            .from('invoices')
            .select('status')

        if (countErr) {
            return { ok: false, error: 'Failed to query invoice counts.' }
        }

        const counts = {
            all: countRows?.length || 0,
            pending: countRows?.filter((r) => r.status === 'pending').length || 0,
            paid: countRows?.filter((r) => r.status === 'paid').length || 0,
            overdue: countRows?.filter((r) => r.status === 'overdue').length || 0,
        }

        // Build filtered query
        let query = supabase
            .from('invoices')
            .select('*, clients!inner(name)', { count: 'exact' })

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        if (filters?.clientId) {
            query = query.eq('client_id', filters.clientId)
        }

        if (filters?.dateFrom) {
            query = query.gte('issue_date', filters.dateFrom)
        }

        if (filters?.dateTo) {
            query = query.lte('issue_date', filters.dateTo)
        }

        if (filters?.search?.trim()) {
            const term = `%${filters.search.trim()}%`
            query = query.or(`invoice_number.ilike.${term},clients.name.ilike.${term}`)
        }

        const page = filters?.page || 1
        const pageSize = filters?.pageSize || 10
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        query = query.order('created_at', { ascending: false }).range(from, to)

        const { data, count, error } = await query

        if (error) {
            return { ok: false, error: 'Failed to fetch invoices.' }
        }

        const items = ((data || []) as DbInvoiceRow[]).map((row) => mapDbToInvoice(row))
        const total = count || 0

        return {
            ok: true,
            data: {
                items,
                total,
                page,
                pageSize,
                hasMore: to + 1 < total,
                counts,
            },
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to query invoices.'
        return { ok: false, error: message }
    }
}

export async function getInvoiceById(id: string): Promise<Result<Invoice | null>> {
    try {
        if (!id) {
            return { ok: false, error: 'Invoice ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const invoice = mockStorage.getInvoiceById(id)
            return { ok: true, data: invoice || null }
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
            .from('invoices')
            .select('*, clients(name)')
            .eq('id', id)
            .maybeSingle()

        if (error) {
            return { ok: false, error: 'Failed to load invoice details.' }
        }

        if (!data) {
            return { ok: true, data: null }
        }

        // Get count of sent reminders
        const { count: remindersSent } = await supabase
            .from('reminders')
            .select('id', { count: 'exact', head: true })
            .eq('invoice_id', id)
            .eq('status', 'sent')

        return {
            ok: true,
            data: mapDbToInvoice(data as DbInvoiceRow, remindersSent || 0),
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve invoice.'
        return { ok: false, error: message }
    }
}

export async function createInvoice(
    input: InvoiceInput
): Promise<Result<Invoice>> {
    try {
        const validated = invoiceSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        const invoiceData = validated.data

        if (USE_MOCK && !isSupabaseConfigured()) {
            if (mockStorage.isInvoiceNumberTaken(invoiceData.invoiceNumber)) {
                return {
                    ok: false,
                    error: 'This invoice number already exists.',
                    fieldErrors: { invoiceNumber: ['This invoice number is already taken.'] },
                }
            }
            const client = mockStorage.getClientById(invoiceData.clientId)
            if (!client) {
                return { ok: false, error: 'Selected client does not exist.' }
            }

            const today = new Date().toISOString().split('T')[0]
            const created = mockStorage.saveInvoice({
                id: mockStorage.generateInvoiceId(),
                userId: 'demo-user-id',
                clientId: invoiceData.clientId,
                clientName: client.name,
                templateId: invoiceData.templateId,
                invoiceNumber: invoiceData.invoiceNumber,
                amount: invoiceData.amount,
                currency: invoiceData.currency,
                issueDate: invoiceData.issueDate,
                dueDate: invoiceData.dueDate,
                status: invoiceData.dueDate < today ? 'overdue' : 'pending',
                channels: invoiceData.channels,
                remindersEnabled: invoiceData.remindersEnabled,
                filePath: null,
                notes: invoiceData.notes || null,
                paidAt: null,
                createdAt: new Date().toISOString(),
                remindersSent: 0,
                daysOverdue: calculateDaysOverdue(invoiceData.dueDate, 'pending'),
            })

            return { ok: true, data: created }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        // 1. Verify client belongs to current user
        const { data: client, error: clientErr } = await supabase
            .from('clients')
            .select('id, name, whatsapp_number')
            .eq('id', invoiceData.clientId)
            .maybeSingle()

        if (clientErr || !client) {
            return {
                ok: false,
                error: 'Invalid client selected. Client does not belong to your account.',
            }
        }

        // 2. Validate WhatsApp channel requirement
        if (invoiceData.channels.includes('whatsapp') && !client.whatsapp_number) {
            return {
                ok: false,
                error: 'Cannot select WhatsApp reminder channel for a client without a WhatsApp number.',
                fieldErrors: { channels: ['Client has no WhatsApp number on record.'] },
            }
        }

        const todayString = new Date().toISOString().split('T')[0]
        const initialStatus = invoiceData.dueDate < todayString ? 'overdue' : 'pending'

        // 3. Insert invoice
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                client_id: invoiceData.clientId,
                template_id: invoiceData.templateId || null,
                invoice_number: invoiceData.invoiceNumber.trim(),
                amount: invoiceData.amount,
                currency: invoiceData.currency,
                issue_date: invoiceData.issueDate,
                due_date: invoiceData.dueDate,
                status: initialStatus,
                channels: invoiceData.channels,
                reminders_enabled: invoiceData.remindersEnabled,
                file_path: null,
                notes: invoiceData.notes?.trim() || null,
            })
            .select('*, clients(name)')
            .single()

        if (error) {
            if (error.code === '23505') {
                return {
                    ok: false,
                    error: 'An invoice with this invoice number already exists.',
                    fieldErrors: { invoiceNumber: ['Invoice number must be unique.'] },
                }
            }
            return { ok: false, error: 'Failed to create invoice in database.' }
        }

        // 4. If reminders are enabled, insert initial reminder schedules
        if (invoiceData.remindersEnabled) {
            const dueDate = new Date(`${invoiceData.dueDate}T09:00:00Z`)
            const offsets = [
                { days: -3, tone: 'friendly' as const, channel: 'email' as const },
                { days: 0, tone: 'friendly' as const, channel: invoiceData.channels[0] || 'email' },
                { days: 3, tone: 'firm' as const, channel: invoiceData.channels[0] || 'email' },
                { days: 7, tone: 'urgent' as const, channel: invoiceData.channels[0] || 'email' },
            ]

            const remindersToInsert = offsets.map((schedule) => {
                const sendAt = new Date(dueDate.getTime() + schedule.days * 24 * 60 * 60 * 1000)
                return {
                    user_id: user.id,
                    invoice_id: data.id,
                    channel: schedule.channel,
                    tone: schedule.tone,
                    send_at: sendAt.toISOString(),
                    status: 'scheduled',
                }
            })

            await supabase.from('reminders').insert(remindersToInsert)
        }

        revalidatePath('/invoices')
        revalidatePath('/')
        revalidatePath('/dashboard')

        return { ok: true, data: mapDbToInvoice(data as DbInvoiceRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create invoice.'
        return { ok: false, error: message }
    }
}

export async function updateInvoice(
    id: string,
    input: Partial<InvoiceInput>
): Promise<Result<Invoice>> {
    try {
        if (!id) {
            return { ok: false, error: 'Invoice ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const existing = mockStorage.getInvoiceById(id)
            if (!existing) return { ok: false, error: 'Invoice not found.' }
            const updated = mockStorage.saveInvoice({
                ...existing,
                ...input,
                amount: input.amount ?? existing.amount,
                invoiceNumber: input.invoiceNumber?.trim() ?? existing.invoiceNumber,
            })
            return { ok: true, data: updated }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const updatePayload: Record<string, unknown> = {}
        if (input.invoiceNumber !== undefined) updatePayload.invoice_number = input.invoiceNumber.trim()
        if (input.amount !== undefined) updatePayload.amount = input.amount
        if (input.currency !== undefined) updatePayload.currency = input.currency
        if (input.issueDate !== undefined) updatePayload.issue_date = input.issueDate
        if (input.dueDate !== undefined) updatePayload.due_date = input.dueDate
        if (input.templateId !== undefined) updatePayload.template_id = input.templateId
        if (input.channels !== undefined) updatePayload.channels = input.channels
        if (input.remindersEnabled !== undefined) updatePayload.reminders_enabled = input.remindersEnabled
        if (input.notes !== undefined) updatePayload.notes = input.notes?.trim() || null

        const { data, error } = await supabase
            .from('invoices')
            .update(updatePayload)
            .eq('id', id)
            .select('*, clients(name)')
            .single()

        if (error) {
            if (error.code === '23505') {
                return {
                    ok: false,
                    error: 'This invoice number already exists.',
                }
            }
            return { ok: false, error: 'Failed to update invoice.' }
        }

        revalidatePath(`/invoices/${id}`)
        revalidatePath('/invoices')
        revalidatePath('/')

        return { ok: true, data: mapDbToInvoice(data as DbInvoiceRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update invoice.'
        return { ok: false, error: message }
    }
}

export async function deleteInvoice(id: string): Promise<Result<boolean>> {
    try {
        if (!id) {
            return { ok: false, error: 'Invoice ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            mockStorage.deleteInvoice(id)
            return { ok: true, data: true }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)

        if (error) {
            return { ok: false, error: 'Failed to delete invoice.' }
        }

        revalidatePath('/invoices')
        revalidatePath('/')
        return { ok: true, data: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete invoice.'
        return { ok: false, error: message }
    }
}

export async function markAsPaid(id: string): Promise<Result<Invoice>> {
    try {
        if (!id) {
            return { ok: false, error: 'Invoice ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const updated = mockStorage.markInvoiceAsPaid(id)
            if (!updated) return { ok: false, error: 'Invoice not found.' }
            return { ok: true, data: updated }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        const now = new Date().toISOString()

        // 1. Update invoice status and set paid timestamp
        const { data, error } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                paid_at: now,
                reminders_enabled: false,
            })
            .eq('id', id)
            .select('*, clients(name)')
            .single()

        if (error || !data) {
            return { ok: false, error: 'Failed to mark invoice as paid.' }
        }

        // 2. Automatically cancel all scheduled future reminders for this invoice
        await supabase
            .from('reminders')
            .update({ status: 'cancelled' })
            .eq('invoice_id', id)
            .eq('status', 'scheduled')

        revalidatePath(`/invoices/${id}`)
        revalidatePath('/invoices')
        revalidatePath('/')
        revalidatePath('/dashboard')

        return { ok: true, data: mapDbToInvoice(data as DbInvoiceRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to mark invoice as paid.'
        return { ok: false, error: message }
    }
}

export async function sendReminderNow(
    id: string,
    channel?: ReminderChannel
): Promise<Result<{ reminderId: string; status: string }>> {
    void channel
    try {
        if (!id) {
            return { ok: false, error: 'Invoice ID is required.' }
        }

        // Real outbound dispatch via Resend & WhatsApp is scheduled for Phase 3
        return {
            ok: false,
            error: 'Live reminder dispatch is scheduled for Phase 3 (Resend email & WhatsApp Business Cloud API integration). Outbound delivery is not active in Phase 2.',
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to dispatch reminder.'
        return { ok: false, error: message }
    }
}
