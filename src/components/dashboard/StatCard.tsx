/**
 * @file src/components/dashboard/StatCard.tsx
 * @description Reusable statistics card for the Payment Chaser dashboard.
 * @phase 2
 * @author Payment Chaser Team
 * @created 2026-10-01
 */

import { Card } from '@/components/ui/card'

interface StatCardProps {
    label: string
    value: string
    description?: string
}

export function StatCard({
    label,
    value,
    description,
}: StatCardProps) {
    return (
        <Card className="border-border bg-background p-6">
            <p className="text-sm font-medium text-foreground">
                {label}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {value}
            </p>

            {description ? (
                <p className="mt-1 text-xs text-foreground">
                    {description}
                </p>
            ) : null}
        </Card>
    )
}