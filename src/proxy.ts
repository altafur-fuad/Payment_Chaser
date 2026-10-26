/**
 * @file src/proxy.ts
 * @description Next.js 16 proxy convention for session refreshing and route protection.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { USE_MOCK, isSupabaseConfigured } from '@/lib/config'

const PROTECTED_PREFIXES = [
    '/dashboard',
    '/invoices',
    '/clients',
    '/templates',
    '/settings',
]

const AUTH_PAGES = [
    '/login',
    '/signup',
    '/forgot-password',
]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Static assets, Next internals, and API routes are bypassed by matcher
    // In mock mode without Supabase credentials, allow local access
    if (USE_MOCK && !isSupabaseConfigured()) {
        return NextResponse.next()
    }

    const { supabaseResponse, user } = await updateSession(request)

    const isRoot = pathname === '/'
    const isProtected = isRoot || PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
    const isAuthPage = AUTH_PAGES.some(
        (page) => pathname === page || pathname.startsWith(`${page}/`)
    )

    // Unauthenticated user attempting to access protected route
    if (!user && isProtected) {
        const loginUrl = new URL('/login', request.url)
        if (!isRoot) {
            loginUrl.searchParams.set('redirectTo', pathname)
        }
        return NextResponse.redirect(loginUrl)
    }

    // Authenticated user attempting to access login or signup
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public SVG and static files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
