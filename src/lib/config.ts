/**
 * @file src/lib/config.ts
 * @description Application configuration and mock-data feature flag.
 * @phase 4
 * @author Payment Chaser Team
 * @created 2026-10-03
 */

export const USE_MOCK =
    process.env.NEXT_PUBLIC_USE_MOCK !== 'false'