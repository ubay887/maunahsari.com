import type { PendingVisit } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createUnsavedChangesGuard } from '@/lib/unsaved-changes';

export function UnsavedChangesDialog({
    isDirty,
    processing,
}: {
    isDirty: boolean;
    processing: boolean;
}) {
    const [pendingVisit, setPendingVisit] = useState<PendingVisit | null>(null);
    const previousFocus = useRef<HTMLElement | null>(null);
    const [guard] = useState(() =>
        createUnsavedChangesGuard(
            (visit) => {
                if (visit) {
                    previousFocus.current =
                        document.activeElement instanceof HTMLElement
                            ? document.activeElement
                            : null;
                }
                setPendingVisit(visit);
            },
            (visit) => router.visit(visit.url, visit),
        ),
    );
    const shouldProtect = isDirty && !processing;

    useEffect(() => {
        if (!shouldProtect) return;

        const unload = (event: BeforeUnloadEvent) => {
            // Browsers require their own prompt when refreshing or closing a tab.
            event.preventDefault();
        };
        window.addEventListener('beforeunload', unload);
        const remove = router.on('before', guard.before);

        return () => {
            window.removeEventListener('beforeunload', unload);
            remove();
        };
    }, [shouldProtect, guard]);

    return (
        <AlertDialog
            open={shouldProtect && pendingVisit !== null}
            onOpenChange={(open) => {
                if (!open) guard.cancel();
            }}
        >
            <AlertDialogContent
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    previousFocus.current?.focus();
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>Tinggalkan halaman?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ada perubahan yang belum disimpan. Jika Anda
                        meninggalkan halaman ini, perubahan tersebut akan
                        hilang.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button">
                        Lanjut mengedit
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        variant="destructive"
                        onClick={guard.confirm}
                    >
                        Tinggalkan halaman
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
