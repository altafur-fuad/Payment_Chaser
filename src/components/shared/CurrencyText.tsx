/**
 * @file src/components/shared/CurrencyText.tsx
 * @description Reusable currency formatting component.
 * @phase 4
 * @author Payment Chaser Team
 * @created 2026-10-04
 */

interface CurrencyTextProps {
    amount: number
    currency: string
    className?: string
}

export function CurrencyText({
    amount,
    currency,
    className,
}: CurrencyTextProps) {
    const formattedAmount = new Intl.NumberFormat(
        'en-US',
        {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    ).format(amount)

    return (
        <span
            className={[
                'font-medium tabular-nums',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {formattedAmount}
        </span>
    )
}