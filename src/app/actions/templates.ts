'use server'

/**
 * @file src/app/actions/templates.ts
 * @description Type-safe Server Actions for reminder templates with safe variable substitution.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { templateSchema } from '@/lib/validation/templates'
import type { Result, Template, TemplateInput } from '@/types'
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

interface DbTemplateRow {
    id: string
    user_id: string
    name: string
    tone: 'friendly' | 'firm' | 'urgent'
    subject: string
    body: string
    is_default: boolean
    created_at: string
    updated_at: string
}

function mapDbToTemplate(row: DbTemplateRow): Template {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        tone: row.tone,
        subject: row.subject,
        body: row.body,
        isDefault: row.is_default,
        createdAt: row.created_at,
    }
}

export async function getTemplates(): Promise<Result<Template[]>> {
    try {
        if (USE_MOCK && !isSupabaseConfigured()) {
            return { ok: true, data: mockStorage.getAllTemplates() }
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
            .from('templates')
            .select('*')
            .order('is_default', { ascending: false })
            .order('name', { ascending: true })

        if (error) {
            return { ok: false, error: 'Failed to fetch templates from database.' }
        }

        const templates = (data as DbTemplateRow[]).map(mapDbToTemplate)
        return { ok: true, data: templates }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve templates.'
        return { ok: false, error: message }
    }
}

export async function getTemplateById(id: string): Promise<Result<Template | null>> {
    try {
        if (!id) {
            return { ok: false, error: 'Template ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const template = mockStorage.getTemplateById(id)
            return { ok: true, data: template || null }
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
            .from('templates')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) {
            return { ok: false, error: 'Failed to load template.' }
        }

        if (!data) {
            return { ok: true, data: null }
        }

        return { ok: true, data: mapDbToTemplate(data as DbTemplateRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve template.'
        return { ok: false, error: message }
    }
}

export async function createTemplate(input: TemplateInput): Promise<Result<Template>> {
    try {
        const validated = templateSchema.safeParse(input)
        if (!validated.success) {
            return {
                ok: false,
                error: 'Please fix the errors in the form.',
                fieldErrors: formatZodErrors(validated.error.issues),
            }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const created = mockStorage.createTemplate(validated.data)
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
            .from('templates')
            .insert({
                user_id: user.id,
                name: validated.data.name.trim(),
                tone: validated.data.tone,
                subject: validated.data.subject.trim(),
                body: validated.data.body.trim(),
                is_default: false,
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return {
                    ok: false,
                    error: 'A template with this name already exists.',
                    fieldErrors: { name: ['A template with this name already exists.'] },
                }
            }
            return { ok: false, error: 'Failed to create template.' }
        }

        revalidatePath('/templates')
        return { ok: true, data: mapDbToTemplate(data as DbTemplateRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create template.'
        return { ok: false, error: message }
    }
}

export async function updateTemplate(
    id: string,
    input: Partial<TemplateInput>
): Promise<Result<Template>> {
    try {
        if (!id) {
            return { ok: false, error: 'Template ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const existing = mockStorage.getTemplateById(id)
            if (!existing) return { ok: false, error: 'Template not found.' }
            const updated = mockStorage.saveTemplate({
                ...existing,
                ...input,
                name: input.name?.trim() ?? existing.name,
                subject: input.subject?.trim() ?? existing.subject,
                body: input.body?.trim() ?? existing.body,
                tone: input.tone ?? existing.tone,
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
        if (input.tone !== undefined) updatePayload.tone = input.tone
        if (input.subject !== undefined) updatePayload.subject = input.subject.trim()
        if (input.body !== undefined) updatePayload.body = input.body.trim()

        const { data, error } = await supabase
            .from('templates')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return {
                    ok: false,
                    error: 'A template with this name already exists.',
                }
            }
            return { ok: false, error: 'Failed to update template.' }
        }

        revalidatePath('/templates')
        return { ok: true, data: mapDbToTemplate(data as DbTemplateRow) }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update template.'
        return { ok: false, error: message }
    }
}

export async function deleteTemplate(id: string): Promise<Result<boolean>> {
    try {
        if (!id) {
            return { ok: false, error: 'Template ID is required.' }
        }

        if (USE_MOCK && !isSupabaseConfigured()) {
            const success = mockStorage.deleteTemplate(id)
            if (!success) {
                return { ok: false, error: 'Default templates cannot be deleted.' }
            }
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

        // Verify not default template
        const { data: targetTemplate, error: targetError } = await supabase
            .from('templates')
            .select('is_default')
            .eq('id', id)
            .maybeSingle()

        if (targetError || !targetTemplate) {
            return { ok: false, error: 'Template not found.' }
        }

        if (targetTemplate.is_default) {
            return { ok: false, error: 'Default system templates cannot be deleted.' }
        }

        const { error: deleteError } = await supabase
            .from('templates')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return { ok: false, error: 'Failed to delete template.' }
        }

        revalidatePath('/templates')
        return { ok: true, data: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete template.'
        return { ok: false, error: message }
    }
}

export async function previewTemplate(
    templateId: string,
    invoiceId?: string
): Promise<Result<{ subject: string; body: string }>> {
    try {
        const templateRes = await getTemplateById(templateId)
        if (!templateRes.ok || !templateRes.data) {
            return { ok: false, error: 'Template not found.' }
        }

        const template = templateRes.data
        let clientName = 'Acme Corp'
        let invoiceNumber = 'INV-2026-001'
        let amount = '$1,500.00'
        let dueDate = '2026-11-15'
        const yourName = 'Freelancer'

        if (invoiceId) {
            if (USE_MOCK && !isSupabaseConfigured()) {
                const inv = mockStorage.getInvoiceById(invoiceId)
                if (inv) {
                    clientName = inv.clientName
                    invoiceNumber = inv.invoiceNumber
                    amount = `${inv.currency} ${inv.amount.toFixed(2)}`
                    dueDate = inv.dueDate
                }
            } else {
                const supabase = await createSupabaseClient()
                const { data: invoice } = await supabase
                    .from('invoices')
                    .select('invoice_number, amount, currency, due_date, clients(name)')
                    .eq('id', invoiceId)
                    .maybeSingle()

                if (invoice) {
                    invoiceNumber = invoice.invoice_number
                    amount = `${invoice.currency} ${Number(invoice.amount).toFixed(2)}`
                    dueDate = invoice.due_date
                    const clientRecord = Array.isArray(invoice.clients)
                        ? invoice.clients[0]
                        : invoice.clients
                    if (clientRecord && typeof clientRecord === 'object' && 'name' in clientRecord) {
                        clientName = (clientRecord as { name: string }).name
                    }
                }
            }
        }

        const tokens: Record<string, string> = {
            '{{client_name}}': clientName,
            '{{invoice_number}}': invoiceNumber,
            '{{amount}}': amount,
            '{{due_date}}': dueDate,
            '{{your_name}}': yourName,
        }

        let renderedSubject = template.subject
        let renderedBody = template.body

        for (const [token, value] of Object.entries(tokens)) {
            renderedSubject = renderedSubject.replaceAll(token, value)
            renderedBody = renderedBody.replaceAll(token, value)
        }

        return {
            ok: true,
            data: {
                subject: renderedSubject,
                body: renderedBody,
            },
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate preview.'
        return { ok: false, error: message }
    }
}
