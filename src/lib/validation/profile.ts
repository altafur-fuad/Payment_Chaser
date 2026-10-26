/**
 * @file src/lib/validation/profile.ts
 * @description Zod validation schemas for freelancer profile and regional settings.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { z } from 'zod'

export const profileSchema = z.object({
    displayName: z
        .string()
        .trim()
        .min(1, 'Display name is required.')
        .max(100, 'Display name is too long.'),
    businessName: z
        .string()
        .trim()
        .max(100, 'Business name is too long.')
        .optional()
        .or(z.literal('')),
    timezone: z
        .string()
        .min(1, 'Timezone is required.'),
    defaultCurrency: z
        .string()
        .trim()
        .min(1, 'Default currency is required.')
        .max(10, 'Currency code is invalid.'),
})

export type ProfileInputValidated = z.infer<typeof profileSchema>
