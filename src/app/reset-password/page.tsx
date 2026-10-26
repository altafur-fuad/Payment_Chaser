/**
 * @file src/app/reset-password/page.tsx
 * @description Password update page after recovery link verification.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation/auth'
import { resetPassword } from '@/app/actions/auth'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: ResetPasswordInput) => {
        setServerError(null)
        const result = await resetPassword(values)

        if (!result.ok) {
            setServerError(result.error)
            return
        }

        setIsSuccess(true)
        setTimeout(() => {
            router.push('/login')
        }, 1500)
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
                    Set a new password
                </h1>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Enter your new password below to secure your account.
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

                    {isSuccess ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                                <CheckCircle2 size={19} />
                                <span>Password updated successfully!</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Redirecting you to the sign-in page...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    New password
                                </label>
                                <div className="relative mt-2">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Lock size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="At least 6 characters"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Confirm new password
                                </label>
                                <div className="relative mt-2">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Lock size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('confirmPassword')}
                                        id="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="Re-enter password"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Updating password...' : 'Update password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
