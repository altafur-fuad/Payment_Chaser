'use server'

/**
 * @file src/app/actions/clients.ts
 * @description Type-safe Server Actions for client CRUD and validation.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validation/clients'
import type { Client, ClientInput, Result } from '@/types'
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

interface DbClientRow {
    id: string
    user_id: string
    name: string
    email: string | null
    whatsapp_number: string | null
    preferred_channel: 'email' | 'whatsapp'
    created_at: string
    updated_at: string
}

function mapDbToClient(row: DbClientRow, invoiceCount = 0, outstandingAmount = 0): Client {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        whatsappNumber: row.whatsapp_number,
        preferredChannel: row.preferred_channel,
        createdAt: row.created_at,
        invoiceCount,
        outstandingAmount,
    }
}

export async function getClients(): Promise<Result<Client[]>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            return { ok: true, data: mockStorage.getAllClients() }
        }

        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ok: false, error: 'Unauthorized. Please log in.' }
        }

        // Fetch clients owned by the user
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true })

        if (clientsError) {
            return { ok: false, error: 'Failed to fetch clients from database.' }
        }

        // Fetch invoices for aggregate stats
        const { data: invoicesData } = await supabase
            .from('invoices')
            .select('client_id, amount, status')

        const clientStats = new Map<string, { count: number; outstanding: number }>()

        if (invoicesData) {
            for (const inv of invoicesData) {
                const existing = clientStats.get(inv.client_id) || { count: 0, outstanding: 0 }
                existing.count += 1
                if (inv.status === 'pending' || inv.status === 'overdue') {
                    existing.outstanding += Number(inv.amount)
                }
                clientStats.set(inv.client_id, existing)
            }
        }

        const mappedClients: Client[] = (clientsData as DbClientRow[]).map((row) => {
            const stats = clientStats.get(row.id) || { count: 0, outstanding: 0 }
            return mapDbToClient(row, stats.count, stats.outstanding)
        })

        return { ok: true, data: mappedClients }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve clients.'
        return { ok: false, error: message }
    }
}

export async function getClientById(id: string): Promise<Result<Client | null>> {
    try {
        if (!id) {
            return { ok: false, error: 'Client ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const client = mockStorage.getClientById(id)
            return { ok: true, data: client || null }
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
            .from('clients')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) {
            return { ok: false, error: 'Failed to load client details.' }
        }

        if (!data) {
            return { ok: true, data: null }
        }

        return { ok: true, data: mapDbToClient(data as DbClientRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve client.'
        return { ok: false, error: message }
    }
}

export async function createClient(input: ClientInput): Promise<Result<Client>> {
    try {
        const validated = clientSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const created = mockStorage.createClient(validated.data)
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

        const { data, error } = await supabase
            .from('clients')
            .insert({
                user_id: user.id,
                name: validated.data.name.trim(),
                email: validated.data.email?.trim() || null,
                whatsapp_number: validated.data.whatsappNumber?.trim() || null,
                preferred_channel: validated.data.preferredChannel,
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return {
                    ok: false,
                    error: 'A client with this email address already exists.',
                    fieldErrors: { email: ['A client with this email already exists.'] },
                }
            }
            return { ok: false, error: 'Failed to create client in database.' }
        }

        revalidatePath('/clients')
        revalidatePath('/invoices/new')

        return { ok: true, data: mapDbToClient(data as DbClientRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create client.'
        return { ok: false, error: message }
    }
}

export async function updateClient(
    id: string,
    input: Partial<ClientInput>
): Promise<Result<Client>> {
    try {
        if (!id) {
            return { ok: false, error: 'Client ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const existing = mockStorage.getClientById(id)
            if (!existing) return { ok: false, error: 'Client not found.' }
            const updated = mockStorage.saveClient({
                ...existing,
                ...input,
                name: input.name?.trim() ?? existing.name,
                email: input.email !== undefined ? input.email.trim() || null : existing.email,
                whatsappNumber:
                    input.whatsappNumber !== undefined
                        ? input.whatsappNumber.trim() || null
                        : existing.whatsappNumber,
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
        if (input.name !== undefined) updatePayload.name = input.name.trim()
        if (input.email !== undefined) updatePayload.email = input.email.trim() || null
        if (input.whatsappNumber !== undefined)
            updatePayload.whatsapp_number = input.whatsappNumber.trim() || null
        if (input.preferredChannel !== undefined)
            updatePayload.preferred_channel = input.preferredChannel

        const { data, error } = await supabase
            .from('clients')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return {
                    ok: false,
                    error: 'A client with this email address already exists.',
                }
            }
            return { ok: false, error: 'Failed to update client.' }
        }

        revalidatePath('/clients')
        revalidatePath(`/invoices`)

        return { ok: true, data: mapDbToClient(data as DbClientRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update client.'
        return { ok: false, error: message }
    }
}

export async function deleteClient(id: string): Promise<Result<boolean>> {
    try {
        if (!id) {
            return { ok: false, error: 'Client ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
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

        // Enforce documented rule: Check if client has invoices
        const { count, error: countError } = await supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('client_id', id)

        if (countError) {
            return { ok: false, error: 'Failed to verify client invoices.' }
        }

        if (count && count > 0) {
            return {
                ok: false,
                error: 'Cannot delete a client with existing invoices. Please delete or reassign their invoices first.',
            }
        }

        const { error: deleteError } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return { ok: false, error: 'Failed to delete client.' }
        }

        revalidatePath('/clients')
        return { ok: true, data: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete client.'
        return { ok: false, error: message }
    }
}
