import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';

/**
 * The one empty state: a short title, one line and at most one action.
 */
export function EmptyState({
    title,
    description,
    action,
    icon: Icon,
    bordered = false,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: LucideIcon;
    bordered?: boolean;
}) {
    return (
        <Empty className={bordered ? 'border' : undefined}>
            <EmptyHeader>
                {Icon && (
                    <EmptyMedia variant="icon">
                        <Icon aria-hidden />
                    </EmptyMedia>
                )}
                <EmptyTitle>{title}</EmptyTitle>
                {description && (
                    <EmptyDescription>{description}</EmptyDescription>
                )}
            </EmptyHeader>
            {action && <EmptyContent>{action}</EmptyContent>}
        </Empty>
    );
}
