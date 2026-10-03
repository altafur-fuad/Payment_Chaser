/**
 * @file src/components/providers/ThemeProvider.tsx
 * @description Theme provider for light and dark mode support.
 * @phase 3
 * @author Payment Chaser Team
 * @created 2026-10-03
 */

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface ThemeProviderProps {
    children: React.ReactNode
}

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    )
}