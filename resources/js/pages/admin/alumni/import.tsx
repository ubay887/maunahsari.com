'use no memo';
import { useForm, usePoll } from '@inertiajs/react';
import {
    AdminDataGrid,
    withGridColumnDefaults,
} from '@/components/admin/admin-data-grid';
import { EmptyState } from '@/components/empty-state';
import { useEffect } from 'react';
import { useTable, type ColumnDef } from '@tanstack/react-table';
import { AlumniAdminPage } from '@/components/alumni/admin-page';
import {
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
} from '@/components/reui/frame';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import InputError from '@/components/input-error';
import {
    preview as previewRoute,
    store,
    template,
} from '@/routes/admin/alumni/import';
type ImportRow = {
    row: number;
    data: Record<string, string | number | null>;
    errors: string[];
};
type BatchStatus = 'queued' | 'processing' | 'completed' | 'failed';
type Batch = {
    id: number;
    file_name: string;
    status: BatchStatus;
    total: number;
    created_count: number;
    failed_count: number;
    errors: { row: number; errors: string[] }[];
};
const batchStatuses: Record<
    BatchStatus,
    {
        label: string;
        variant: 'info-light' | 'success-light' | 'destructive-light';
    }
> = {
    queued: { label: 'Dalam antrean', variant: 'info-light' },
    processing: { label: 'Diproses', variant: 'info-light' },
    completed: { label: 'Selesai', variant: 'success-light' },
    failed: { label: 'Gagal', variant: 'destructive-light' },
};
export default function ImportPage({
    preview,
    batches,
}: {
    preview: { token: string; file_name: string; rows: ImportRow[] } | null;
    batches: Batch[];
}) {
    const form = useForm<{ file: File | null }>({ file: null });
    const confirm = useForm({ token: preview?.token ?? '' });
    const hasActiveBatch = batches.some(
        (batch) => batch.status === 'queued' || batch.status === 'processing',
    );
    const { start, stop } = usePoll(
        3000,
        { only: ['batches'] },
        { autoStart: false },
    );
    useEffect(() => {
        if (hasActiveBatch) {
            start();
        } else {
            stop();
        }
    }, [hasActiveBatch, start, stop]);
    const columns: ColumnDef<DataGridFeatures, ImportRow>[] = [
        { accessorKey: 'row', header: 'Baris' },
        {
            id: 'name',
            header: 'Nama',
            cell: ({ row }) => row.original.data.full_name ?? '—',
        },
        {
            id: 'result',
            header: 'Validasi',
            cell: ({ row }) =>
                row.original.errors.length
                    ? row.original.errors.join(' ')
                    : 'Siap diimpor',
            size: 440,
        },
    ];
    const table = useTable({
        features: dataGridFeatures,
        data: preview?.rows ?? [],
        columns: withGridColumnDefaults(columns),
        initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
    });
    return (
        <AlumniAdminPage
            title="Impor alumni"
            actions={
                <Button type="button" variant="outline" asChild>
                    <a href={template.url()}>Unduh template CSV</a>
                </Button>
            }
        >
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Unggah CSV / Excel</FrameTitle>
                </FrameHeader>
                <FramePanel>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.submit(previewRoute(), {
                                forceFormData: true,
                            });
                        }}
                    >
                        <p>
                            Gunakan header template dan kode wilayah resmi.
                            Excel didukung dalam format .xlsx (lembar pertama,
                            tanpa formula). Maksimal 1.000 baris, 5 MB. Baris
                            salah dan duplikat akan dilewati.
                        </p>
                        <Field>
                            <FieldLabel htmlFor="import-file">
                                Berkas alumni
                            </FieldLabel>
                            <Input
                                id="import-file"
                                type="file"
                                required
                                accept=".csv,.xlsx"
                                onChange={(event) =>
                                    form.setData(
                                        'file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={form.errors.file} />
                        </Field>
                        <Button type="submit" disabled={form.processing}>
                            Pratinjau
                        </Button>
                    </form>
                </FramePanel>
            </Frame>
            {preview && (
                <>
                    <AdminDataGrid
                        table={table}
                        recordCount={preview.rows.length}
                        isLoading={false}
                        noun="baris"
                        title={`Pratinjau ${preview.file_name}`}
                        columnVisibility={false}
                        minWidthClass="min-w-[640px]"
                        empty={<EmptyState title="Tidak ada baris" />}
                    />
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            confirm.setData('token', preview.token);
                            confirm.transform(() => ({ token: preview.token }));
                            confirm.submit(store());
                        }}
                    >
                        <p>
                            {
                                preview.rows.filter((row) => !row.errors.length)
                                    .length
                            }{' '}
                            baris valid;{' '}
                            {
                                preview.rows.filter((row) => row.errors.length)
                                    .length
                            }{' '}
                            baris gagal.
                        </p>
                        <InputError message={confirm.errors.token} />
                        <Button
                            type="submit"
                            disabled={
                                confirm.processing ||
                                !preview.rows.some((row) => !row.errors.length)
                            }
                        >
                            Konfirmasi impor baris valid
                        </Button>
                    </form>
                </>
            )}
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Riwayat impor</FrameTitle>
                </FrameHeader>
                {batches.length ? (
                    batches.map((batch) => (
                        <FramePanel
                            key={batch.id}
                            className="flex flex-col gap-2"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={
                                        batchStatuses[batch.status].variant
                                    }
                                >
                                    {batchStatuses[batch.status].label}
                                </Badge>
                                <span className="font-medium">
                                    {batch.file_name}
                                </span>
                            </div>
                            {batch.status === 'completed' ? (
                                <p>
                                    {batch.created_count} berhasil,{' '}
                                    {batch.failed_count} gagal dari{' '}
                                    {batch.total} baris.
                                </p>
                            ) : batch.status === 'failed' ? (
                                <>
                                    <p>
                                        Impor {batch.total} baris tidak dapat
                                        diproses dan tidak ada profil yang
                                        dibuat. Unggah ulang berkas.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-fit"
                                        onClick={() =>
                                            document
                                                .getElementById('import-file')
                                                ?.focus()
                                        }
                                    >
                                        Pilih berkas
                                    </Button>
                                </>
                            ) : (
                                <p role="status">
                                    {batch.total} baris sedang diproses. Halaman
                                    ini diperbarui otomatis.
                                </p>
                            )}
                            {batch.status === 'completed' &&
                                batch.errors?.map((error) => (
                                    <p key={error.row}>
                                        Baris {error.row}:{' '}
                                        {error.errors.join(' ')}
                                    </p>
                                ))}
                        </FramePanel>
                    ))
                ) : (
                    <FramePanel>
                        <EmptyState
                            title="Belum ada riwayat impor"
                            action={
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        document
                                            .getElementById('import-file')
                                            ?.focus()
                                    }
                                >
                                    Pilih berkas
                                </Button>
                            }
                        />
                    </FramePanel>
                )}
            </Frame>
        </AlumniAdminPage>
    );
}
