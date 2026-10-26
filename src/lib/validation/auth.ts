/**
 * @file src/lib/validation/auth.ts
 * @description Zod validation schemas for authentication forms and Server Actions.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { z } from 'zod'

export const signUpSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required.')
        .email('Please enter a valid email address.'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters.'),
    fullName: z
        .string()
        .trim()
        .min(1, 'Full name is required.')
        .max(100, 'Name is too long.'),
    businessName: z
        .string()
        .trim()
        .max(100, 'Business name is too long.')
        .optional()
        .or(z.literal('')),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const logInSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required.')
        .email('Please enter a valid email address.'),
    password: z
        .string()
        .min(1, 'Password is required.'),
})

export type LogInInput = z.infer<typeof logInSchema>

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required.')
        .email('Please enter a valid email address.'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters.'),
        confirmPassword: z
            .string()
            .min(1, 'Please confirm your password.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
