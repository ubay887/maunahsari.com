import type { ReactNode } from 'react';

/**
 * Save bar pinned to the bottom of the admin scroll region, so the primary
 * action stays reachable in long forms. Spans the page padding edge to edge.
 */
export function FormActions({
    dirty = false,
    children,
}: {
    dirty?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background px-4 py-3 md:-mx-6 md:px-6">
            {dirty && (
                <p
                    role="status"
                    className="mr-auto text-xs text-muted-foreground"
                >
                    Ada perubahan yang belum disimpan.
                </p>
            )}
            {children}
        </div>
    );
}
