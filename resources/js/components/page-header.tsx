import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Page title block shared by every surface: title and one-clause description
 * on the left, actions on the right. `size="lg"` is for public pages only.
 */
export function PageHeader({
    title,
    description,
    actions,
    size = 'default',
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    size?: 'default' | 'lg';
}) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-0.5">
                <h1
                    className={cn(
                        'font-semibold tracking-tight break-words',
                        size === 'lg'
                            ? 'font-display text-3xl font-bold text-primary'
                            : 'text-xl',
                    )}
                >
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
}
