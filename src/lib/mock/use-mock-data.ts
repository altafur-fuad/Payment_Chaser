/**
 * @file src/lib/mock/use-mock-data.ts
 * @description React hooks for subscribing to unified mock storage without cascading renders.
 */

'use client'

import { useSyncExternalStore } from 'react'
import type { Client, Invoice, Profile, Template } from '@/types'
import {
    getAllInvoices,
    getAllClients,
    getAllTemplates,
    getProfile,
    subscribeToStorage,
    defaultProfile,
} from './storage'
import { mockInvoices } from './invoices'
import { mockClients } from './clients'
import { mockTemplates } from './templates'

export function useInvoices(): Invoice[] {
    return useSyncExternalStore(
        subscribeToStorage,
        getAllInvoices,
        () => mockInvoices,
    )
}

export function useClients(): Client[] {
    return useSyncExternalStore(
        subscribeToStorage,
        getAllClients,
        () => mockClients,
    )
}

export function useTemplates(): Template[] {
    return useSyncExternalStore(
        subscribeToStorage,
        getAllTemplates,
        () => mockTemplates,
    )
}

export function useProfile(): Profile {
    return useSyncExternalStore(
        subscribeToStorage,
        getProfile,
        () => defaultProfile,
    )
}
