/**
 * @file src/lib/validation/templates.ts
 * @description Zod validation schemas for reminder template management.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { z } from 'zod'

export const templateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Template name is required.')
        .max(100, 'Template name is too long.'),
    tone: z.enum(['friendly', 'firm', 'urgent']),
    subject: z
        .string()
        .trim()
        .min(1, 'Subject line is required.')
        .max(200, 'Subject line is too long.'),
    body: z
        .string()
        .trim()
        .min(1, 'Template body is required.')
        .max(3000, 'Template body is too long.'),
})

export type TemplateInputValidated = z.infer<typeof templateSchema>
