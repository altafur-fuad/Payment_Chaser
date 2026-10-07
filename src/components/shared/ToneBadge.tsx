/**
 * @file src/components/shared/ToneBadge.tsx
 * @description Reusable badge for reminder tones.
 * @phase 4
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import { Badge } from '@/components/ui/badge'
import { REMINDER_TONE_LABELS } from '@/lib/constants'
import type { ReminderTone } from '@/types'

interface ToneBadgeProps {
    tone: ReminderTone
}

const toneStyles = {
    friendly: 'border-success/30 bg-success/10 text-success',
    firm: 'border-warning/30 bg-warning/10 text-warning',
    urgent: 'border-danger/30 bg-danger/10 text-danger',
} as const

export function ToneBadge({ tone }: ToneBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={toneStyles[tone]}
        >
            {REMINDER_TONE_LABELS[tone]}
        </Badge>
    )
}