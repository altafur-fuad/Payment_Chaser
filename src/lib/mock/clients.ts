/**
 * @file src/lib/mock/clients.ts
 * @description Mock client data for the frontend invoice flow.
 * @phase 5
 * @author Payment Chaser Team
 * @created 2026-10-05
 */

import type { Client } from '@/types'

export const mockClients: Client[] = [
    {
        id: 'client-001',
        userId: 'demo-user',
        name: 'Demo Client',
        email: 'client@example.com',
        whatsappNumber: '+8801712345678',
        preferredChannel: 'email',
        createdAt: '2026-09-01',
        invoiceCount: 3,
        outstandingAmount: 1250,
    },
    {
        id: 'client-002',
        userId: 'demo-user',
        name: 'Sample Client',
        email: 'sample@example.com',
        whatsappNumber: null,
        preferredChannel: 'email',
        createdAt: '2026-09-05',
        invoiceCount: 2,
        outstandingAmount: 500,
    },
    {
        id: 'client-003',
        userId: 'demo-user',
        name: 'Demo Company',
        email: 'company@example.com',
        whatsappNumber: '+8801812345678',
        preferredChannel: 'whatsapp',
        createdAt: '2026-09-10',
        invoiceCount: 1,
        outstandingAmount: 750,
    },
    {
        id: 'client-004',
        userId: 'demo-user',
        name: 'Creative Studio',
        email: 'studio@example.com',
        whatsappNumber: '+8801912345678',
        preferredChannel: 'email',
        createdAt: '2026-09-15',
        invoiceCount: 2,
        outstandingAmount: 1800,
    },
]