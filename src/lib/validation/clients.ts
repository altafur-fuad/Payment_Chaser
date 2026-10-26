/**
 * @file src/lib/validation/clients.ts
 * @description Zod validation schemas for client management.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { z } from 'zod'

export const clientSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Client name is required.')
            .max(100, 'Name is too long.'),
        email: z
            .string()
            .trim()
            .email('Please enter a valid email address.')
            .optional()
            .or(z.literal('')),
        whatsappNumber: z
            .string()
            .trim()
            .max(30, 'Phone number is too long.')
            .optional()
            .or(z.literal('')),
        preferredChannel: z.enum(['email', 'whatsapp', 'both']),
    })
    .refine(
        (data) => Boolean(data.email?.trim() || data.whatsappNumber?.trim()),
        {
            message: 'Provide at least an email or a WhatsApp number.',
            path: ['email'],
        }
    )
    .refine(
        (data) => {
            if (data.preferredChannel === 'whatsapp') {
                return Boolean(data.whatsappNumber?.trim())
            }
            return true
        },
        {
            message: 'WhatsApp number is required when WhatsApp is the preferred channel.',
            path: ['whatsappNumber'],
        }
    )
    .refine(
        (data) => {
            if (data.preferredChannel === 'email') {
                return Boolean(data.email?.trim())
            }
            return true
        },
        {
            message: 'Email address is required when Email is the preferred channel.',
            path: ['email'],
        }
    )
    .refine(
        (data) => {
            if (data.preferredChannel === 'both') {
                return Boolean(data.email?.trim() && data.whatsappNumber?.trim())
            }
            return true
        },
        {
            message: 'Both Email and WhatsApp number are required when Preferred Channel is Both.',
            path: ['preferredChannel'],
        }
    )

export type ClientInputValidated = z.infer<typeof clientSchema>
