/**
 * @file src/app/signup/page.tsx
 * @description Authentication signup page with registration, auto-profile trigger, and email verification.
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
import { AlertCircle, ArrowRight, Building, CheckCircle2, Lock, Mail, User } from 'lucide-react'
import { signUpSchema, type SignUpInput } from '@/lib/validation/auth'
import { signUp } from '@/app/actions/auth'

export default function SignupPage() {
    const router = useRouter()
    const [serverError, setServerError] = useState<string | null>(null)
    const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)
    const [signupSuccess, setSignupSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            businessName: '',
            email: '',
            password: '',
        },
    })

    const onSubmit = async (values: SignUpInput) => {
        setServerError(null)
        const result = await signUp(values)

        if (!result.ok) {
            setServerError(result.error)
            return
        }

        if (result.data.needsEmailConfirmation) {
            setConfirmationEmail(values.email)
        } else {
            setSignupSuccess(true)
            setTimeout(() => {
                router.push('/')
                router.refresh()
            }, 1000)
        }
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
                    Create your free account
                </h1>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 transition hover:text-blue-500 dark:text-blue-400"
                    >
                        Sign in here
                    </Link>
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

                    {confirmationEmail ? (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
                            <div className="flex items-center gap-2 text-base font-semibold text-blue-950 dark:text-blue-100">
                                <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
                                <span>Check your email</span>
                            </div>
                            <p className="mt-2 leading-relaxed">
                                We sent a confirmation link to{' '}
                                <strong className="font-semibold">{confirmationEmail}</strong>. Please check your inbox and click the verification link to activate your account.
                            </p>
                            <div className="mt-4 pt-3 border-t border-blue-200/80 dark:border-blue-900/40">
                                <Link
                                    href="/login"
                                    className="font-semibold text-blue-700 underline hover:text-blue-800 dark:text-blue-300"
                                >
                                    Proceed to sign in &rarr;
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            {signupSuccess && (
                                <div
                                    role="status"
                                    className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                >
                                    <CheckCircle2 size={17} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>Account created successfully! Redirecting...</span>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Full name
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <User size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('fullName')}
                                        id="fullName"
                                        type="text"
                                        autoComplete="name"
                                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="Mahatab Hossain"
                                    />
                                </div>
                                {errors.fullName && (
                                    <p id="fullName-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="businessName"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Business or studio name <span className="text-slate-400 text-xs font-normal">(optional)</span>
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Building size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('businessName')}
                                        id="businessName"
                                        type="text"
                                        autoComplete="organization"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="Freelance Design Studio"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Email address
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Mail size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Lock size={17} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                                        placeholder="At least 6 characters"
                                    />
                                </div>
                                {errors.password && (
                                    <p id="password-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || signupSuccess}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <span>Creating account...</span>
                                    ) : (
                                        <>
                                            <span>Create account</span>
                                            <ArrowRight size={17} aria-hidden="true" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
