import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DetailItem = {
    label: string;
    value: ReactNode;
    /** Spans the whole row, for long text such as an address or summary. */
    wide?: boolean;
};

/**
 * A read-only definition list for detail pages. Empty values render as an
 * em dash so every row keeps the same rhythm.
 */
export function DetailList({
    items,
    columns = 2,
}: {
    items: DetailItem[];
    columns?: 1 | 2 | 3;
}) {
    return (
        <dl
            className={cn(
                'grid w-full gap-4',
                columns === 2 && 'sm:grid-cols-2',
                columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
            )}
        >
            {items.map(({ label, value, wide }) => (
                <div
                    key={label}
                    className={cn(
                        'flex min-w-0 flex-col gap-0.5',
                        wide && columns > 1 && 'sm:col-span-full',
                    )}
                >
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="break-words whitespace-pre-line">
                        {value === null || value === undefined || value === ''
                            ? '—'
                            : value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
