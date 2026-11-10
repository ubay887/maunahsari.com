import type { GlobalEvent, PendingVisit } from '@inertiajs/core';

export function createUnsavedChangesGuard(
    onChange: (visit: PendingVisit | null) => void,
    resumeVisit: (visit: PendingVisit) => void,
) {
    let pendingVisit: PendingVisit | null = null;
    let resuming = false;

    function cancel() {
        pendingVisit = null;
        onChange(null);
    }

    return {
        before(this: void, event: GlobalEvent<'before'>) {
            const visit = event.detail.visit;
            if (visit.method !== 'get' || visit.prefetch || resuming) return;

            event.preventDefault();
            pendingVisit = visit;
            onChange(visit);
        },
        cancel,
        confirm(this: void) {
            if (!pendingVisit) return;

            const visit = pendingVisit;
            cancel();
            resuming = true;
            try {
                resumeVisit(visit);
            } finally {
                resuming = false;
            }
        },
    };
}
