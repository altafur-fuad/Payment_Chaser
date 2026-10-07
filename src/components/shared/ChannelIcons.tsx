/**
 * @file src/components/shared/ChannelIcons.tsx
 * @description Reusable channel icons for email and WhatsApp reminders.
 * @phase 4
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

import { Mail, MessageCircle } from 'lucide-react'
import type { ReminderChannel } from '@/types'

interface ChannelIconsProps {
    channels: ReminderChannel[]
}

const channelLabels: Record<ReminderChannel, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
}

export function ChannelIcons({
    channels,
}: ChannelIconsProps) {
    return (
        <div
            className="flex items-center gap-1.5"
            aria-label={`Reminder channels: ${channels
                .map((channel) => channelLabels[channel])
                .join(', ')}`}
        >
            {channels.map((channel) => {
                if (channel === 'email') {
                    return (
                        <Mail
                            key={channel}
                            size={18}
                            strokeWidth={1.75}
                            aria-label="Email"
                        />
                    )
                }

                return (
                    <MessageCircle
                        key={channel}
                        size={18}
                        strokeWidth={1.75}
                        aria-label="WhatsApp"
                    />
                )
            })}
        </div>
    )
}