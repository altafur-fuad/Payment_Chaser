/**
 * @file src/lib/mock/templates.ts
 * @description Mock reminder templates for the frontend invoice flow.
 * @phase 5
 * @author Payment Chaser Team
 * @created 2026-10-05
 */

import type { Template } from '@/types'

export const mockTemplates: Template[] = [
    {
        id: 'template-friendly',
        userId: 'demo-user',
        name: 'Friendly Reminder',
        tone: 'friendly',
        subject: 'Friendly payment reminder',
        body: 'Hi {{clientName}}, this is a friendly reminder about invoice {{invoiceNumber}}.',
        createdAt: '2026-09-01',
        isDefault: true,
    },
    {
        id: 'template-firm',
        userId: 'demo-user',
        name: 'Firm Reminder',
        tone: 'firm',
        subject: 'Payment reminder for invoice {{invoiceNumber}}',
        body: 'Hi {{clientName}}, your invoice {{invoiceNumber}} is due for payment.',
        createdAt: '2026-09-01',
    },
    {
        id: 'template-urgent',
        userId: 'demo-user',
        name: 'Urgent Reminder',
        tone: 'urgent',
        subject: 'Urgent payment reminder',
        body: 'Hi {{clientName}}, your invoice {{invoiceNumber}} requires immediate payment.',
        createdAt: '2026-09-01',
    },
]