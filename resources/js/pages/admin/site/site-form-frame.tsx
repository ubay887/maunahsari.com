import { Link } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { FormActions } from '@/components/admin/form-actions';
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/admin/site';

/**
 * Kerangka form halaman situs: dialog perubahan belum disimpan, ringkasan
 * galat, kolom yang terkunci saat menyimpan, dan bilah simpan di bawah.
 */
export function SiteFormFrame({
    isDirty,
    processing,
    hasErrors,
    onSubmit,
    children,
}: {
    isDirty: boolean;
    processing: boolean;
    hasErrors: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    children: ReactNode;
}) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <UnsavedChangesDialog isDirty={isDirty} processing={processing} />
            {hasErrors && (
                <p role="alert" className="text-sm text-destructive">
                    Periksa isian yang ditandai di bawah.
                </p>
            )}
            <fieldset
                disabled={processing}
                className="flex min-w-0 flex-col gap-4"
            >
                {children}
            </fieldset>
            <FormActions dirty={isDirty}>
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    asChild
                >
                    <Link href={index()}>Batal</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan…' : 'Simpan perubahan'}
                </Button>
            </FormActions>
        </form>
    );
}

/** Ambil pesan galat Inertia untuk path bersarang seperti `founder.name`. */
export function errorAt(
    errors: Record<string, string | undefined>,
    path: string,
): string | undefined {
    return errors[path];
}
