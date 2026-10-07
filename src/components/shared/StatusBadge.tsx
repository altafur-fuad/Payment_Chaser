/**
 * @file src/components/shared/StatusBadge.tsx
 * @description Reusable badge for invoice statuses.
 * @phase 4
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import { Badge } from '@/components/ui/badge'
import { INVOICE_STATUS_LABELS } from '@/lib/constants'
import type { InvoiceStatus } from '@/types'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
} from 'lucide-react'

interface StatusBadgeProps {
    status: InvoiceStatus
}

const statusStyles = {
    pending: {
        className:
            'border-warning/30 bg-warning/10 text-warning',
        icon: Clock,
    },
    paid: {
        className:
            'border-success/30 bg-success/10 text-success',
        icon: CheckCircle2,
    },
    overdue: {
        className:
            'border-danger/30 bg-danger/10 text-danger',
        icon: AlertTriangle,
    },
} as const

export function StatusBadge({ status }: StatusBadgeProps) {
    const { className, icon: Icon } = statusStyles[status]

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 ${className}`}
        >
            <Icon size={14} aria-hidden="true" />
            <span>{INVOICE_STATUS_LABELS[status]}</span>
        </Badge>
    )
}