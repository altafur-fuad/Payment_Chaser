/**
 * @file src/app/forgot-password/page.tsx
 * @description Password recovery request page.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation/auth'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    })

    const onSubmit = async (values: ForgotPasswordInput) => {
        setServerError(null)
        const result = await forgotPassword(values)

        if (!result.ok) {
            setServerError(result.error)
            return
        }

        setIsSubmitted(true)
    }

    return (
        <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-[#0B1220]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 text-xl font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-md shadow-blue-500/20">
                            P
                        </span>
                        <span>Payment Chaser</span>
                    </Link>
                </div>

                <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                    Reset your password
                </h1>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Enter your email address and we will send you a password reset link.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 dark:border-slate-800 dark:bg-[#0F172A]">
                    {serverError && (
                        <div
                            role="alert"
                            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                        >
                            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    {isSubmitted ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                                <CheckCircle2 size={19} />
                                <span>Reset link sent</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                If an account exists with this email address, you will receive password reset instructions shortly.
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/login"
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    Return to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Email address
                                </label>
                                <div className="relative mt-2">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Mail size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Sending instructions...' : 'Send reset instructions'}
                            </button>

                            <div className="pt-2 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    <ArrowLeft size={14} />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
