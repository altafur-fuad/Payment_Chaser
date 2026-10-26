/**
 * @file src/lib/mock/invoice-storage.ts
 * @description Backward-compatible wrapper delegating to unified storage.
 */

export {
    getAllInvoices,
    getInvoiceById,
    saveInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
    isInvoiceNumberTaken,
} from './storage'