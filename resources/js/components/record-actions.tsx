import { Link } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * The one row-action menu for every table: a single "more" button that opens
 * a dropdown. Put the primary action first (usually "Lihat detail"), edit
 * next, status changes after, and the destructive action last.
 */
export function RecordActions({
    title,
    disabled = false,
    children,
}: {
    title: string;
    disabled?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        aria-label={`Aksi untuk ${title}`}
                    >
                        <MoreHorizontal aria-hidden />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {children}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

/** A menu item that navigates: an Inertia link, or a new tab when `external`. */
export function RecordActionLink({
    href,
    icon: Icon,
    external = false,
    children,
}: {
    href: NonNullable<ComponentProps<typeof Link>['href']> | string;
    icon?: LucideIcon;
    external?: boolean;
    children: ReactNode;
}) {
    return (
        <DropdownMenuItem asChild>
            {external ? (
                <a
                    href={typeof href === 'string' ? href : href.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {Icon && <Icon aria-hidden />}
                    {children}
                </a>
            ) : (
                <Link href={href}>
                    {Icon && <Icon aria-hidden />}
                    {children}
                </Link>
            )}
        </DropdownMenuItem>
    );
}
