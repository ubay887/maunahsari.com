'use no memo';
import { Link, router } from '@inertiajs/react';
import {
    AdminDataGrid,
    withGridColumnDefaults,
} from '@/components/admin/admin-data-grid';
import { EmptyState } from '@/components/empty-state';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    useTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { AlumniAdminPage } from '@/components/alumni/admin-page';
import { AlumniFilterBar } from '@/components/alumni/filter-bar';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { RecordActionLink, RecordActions } from '@/components/record-actions';
import {
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatDateTime } from '@/lib/format';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import {
    index,
    edit,
    show,
    destroy,
    exportMethod,
} from '@/routes/admin/alumni';
import { alumniLabels } from '@/lib/alumni';
import type { AlumniAdminRow, AlumniOptions } from '@/types/alumni';
import type { Paginated } from '@/types/article';
const hiddenByDefault = {
    gender: false,
    entry_year: false,
    leave_year: false,
    program: false,
    alumni_status: false,
    profession: false,
    organization: false,
    field: false,
    map_mode: false,
    directory_visible: false,
    source: false,
    verified_at: false,
    created_at: false,
};
function label(value: string | null | undefined, empty = '—') {
    return value ? (alumniLabels[value] ?? value) : empty;
}
export default function AdminAlumniIndex({
    profiles,
    filters,
    ...options
}: AlumniOptions & {
    profiles: Paginated<AlumniAdminRow>;
    filters: Record<string, string>;
}) {
    const page = useArticlePageState();
    const [deleting, setDeleting] = useState<AlumniAdminRow | null>(null);
    const [pending, setPending] = useState(false);
    function visit(next: Record<string, string | number>) {
        router.get(
            index.url(),
            { ...filters, page: 1, ...next },
            { preserveState: true, preserveScroll: true },
        );
    }
    const columns: ColumnDef<DataGridFeatures, AlumniAdminRow>[] = [
        {
            accessorKey: 'full_name',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Nama" />
            ),
            cell: ({ row }) => (
                <Link
                    href={show(row.original.id)}
                    className="font-medium hover:underline"
                >
                    {row.original.full_name}
                </Link>
            ),
            size: 240,
            enableHiding: false,
            meta: { headerTitle: 'Nama' },
        },
        {
            accessorKey: 'angkatan',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Angkatan" />
            ),
            cell: ({ row }) => row.original.angkatan ?? '—',
            size: 110,
            meta: { headerTitle: 'Angkatan' },
        },
        {
            id: 'domicile',
            header: 'Domisili',
            enableSorting: false,
            size: 220,
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span>{row.original.regency ?? '—'}</span>
                    {row.original.province && (
                        <span className="text-xs text-muted-foreground">
                            {row.original.province}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'pondok',
            header: 'Pondok',
            enableSorting: false,
            size: 110,
            cell: ({ row }) => label(row.original.pondok),
        },
        {
            accessorKey: 'verification_status',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Verifikasi" />
            ),
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.verification_status === 'approved'
                            ? 'success-light'
                            : row.original.verification_status === 'rejected'
                              ? 'destructive-light'
                              : 'warning-light'
                    }
                >
                    {label(row.original.verification_status)}
                </Badge>
            ),
            size: 170,
            meta: { headerTitle: 'Verifikasi' },
        },
        {
            accessorKey: 'gender',
            header: 'Jenis kelamin',
            enableSorting: false,
            size: 130,
            cell: ({ row }) => label(row.original.gender),
        },
        {
            accessorKey: 'entry_year',
            header: 'Tahun masuk',
            enableSorting: false,
            size: 120,
            cell: ({ row }) => row.original.entry_year ?? '—',
        },
        {
            accessorKey: 'leave_year',
            header: 'Tahun keluar',
            enableSorting: false,
            size: 120,
            cell: ({ row }) => row.original.leave_year ?? '—',
        },
        {
            accessorKey: 'program',
            header: 'Program',
            enableSorting: false,
            size: 180,
            cell: ({ row }) => row.original.program ?? '—',
        },
        {
            accessorKey: 'alumni_status',
            header: 'Status kesantrian',
            enableSorting: false,
            size: 150,
            cell: ({ row }) => label(row.original.alumni_status),
        },
        {
            accessorKey: 'profession',
            header: 'Profesi',
            enableSorting: false,
            size: 180,
            cell: ({ row }) => row.original.profession || '—',
        },
        {
            accessorKey: 'organization',
            header: 'Organisasi',
            enableSorting: false,
            size: 180,
            cell: ({ row }) => row.original.organization || '—',
        },
        {
            accessorKey: 'field',
            header: 'Bidang',
            enableSorting: false,
            size: 160,
            cell: ({ row }) => row.original.field || '—',
        },
        {
            accessorKey: 'map_mode',
            header: 'Izin peta',
            enableSorting: false,
            size: 120,
            cell: ({ row }) => label(row.original.map_mode, 'Belum memilih'),
        },
        {
            accessorKey: 'directory_visible',
            header: 'Izin direktori',
            enableSorting: false,
            size: 140,
            cell: ({ row }) =>
                row.original.directory_visible === null
                    ? 'Belum memilih'
                    : row.original.directory_visible
                      ? 'Izinkan'
                      : 'Tidak',
        },
        {
            accessorKey: 'source',
            header: 'Sumber',
            enableSorting: false,
            size: 110,
            cell: ({ row }) => label(row.original.source),
        },
        {
            accessorKey: 'verified_at',
            header: 'Diverifikasi',
            enableSorting: false,
            size: 170,
            cell: ({ row }) => formatDate(row.original.verified_at),
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Dibuat" />
            ),
            cell: ({ row }) => formatDateTime(row.original.created_at),
            size: 170,
            meta: { headerTitle: 'Dibuat' },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <RecordActions
                    title={row.original.full_name ?? 'alumni'}
                    disabled={page.loading || pending}
                >
                    <RecordActionLink href={show(row.original.id)} icon={Eye}>
                        Lihat detail
                    </RecordActionLink>
                    <RecordActionLink
                        href={edit(row.original.id)}
                        icon={Pencil}
                    >
                        Edit
                    </RecordActionLink>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleting(row.original)}
                    >
                        <Trash2 aria-hidden />
                        Hapus
                    </DropdownMenuItem>
                </RecordActions>
            ),
        },
    ];
    const pagination: PaginationState = {
        pageIndex: profiles.current_page - 1,
        pageSize: profiles.per_page,
    };
    const sorting: SortingState = [
        { id: filters.sort ?? 'created_at', desc: filters.direction !== 'asc' },
    ];
    const table = useTable({
        features: dataGridFeatures,
        data: profiles.data,
        columns: withGridColumnDefaults(columns),
        rowCount: profiles.total,
        getRowId: (row) => String(row.id),
        manualPagination: true,
        manualSorting: true,
        initialState: { columnVisibility: hiddenByDefault },
        autoResetPageIndex: false,
        state: { pagination, sorting },
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function' ? updater(pagination) : updater;
            visit({ page: next.pageIndex + 1, per_page: next.pageSize });
        },
        onSortingChange: (updater) => {
            const next =
                typeof updater === 'function' ? updater(sorting) : updater;
            visit({
                sort: next[0]?.id ?? 'created_at',
                direction: next[0]?.desc === false ? 'asc' : 'desc',
            });
        },
    });
    return (
        <AlumniAdminPage
            title="Alumni"
            description="Kelola profil alumni dan verifikasi."
            actions={
                <>
                    <Button type="button" variant="outline" asChild>
                        <a href={exportMethod.url({ query: filters })}>
                            Ekspor CSV
                        </a>
                    </Button>
                </>
            }
        >
            <AdminDataGrid
                table={table}
                recordCount={profiles.total}
                isLoading={page.loading}
                noun="alumni"
                title="Daftar alumni"
                minWidthClass="min-w-[900px]"
                empty={
                    <EmptyState
                        title="Tidak ada alumni sesuai filter"
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get(index.url())}
                            >
                                Reset filter
                            </Button>
                        }
                    />
                }
                toolbar={
                    <AlumniFilterBar
                        admin
                        filters={filters}
                        options={options}
                        onApply={(next) =>
                            router.get(index.url(), next, {
                                preserveState: true,
                                preserveScroll: true,
                            })
                        }
                    />
                }
            />
            <ConfirmDeleteDialog
                open={!!deleting}
                onOpenChange={(value) => {
                    if (!value) setDeleting(null);
                }}
                title="profil alumni secara permanen"
                description="Profil alumni dihapus permanen dan tidak dapat dikembalikan."
                processing={pending}
                onConfirm={() => {
                    if (!deleting) return;
                    setPending(true);
                    router.delete(destroy.url(deleting.id), {
                        onFinish: () => setPending(false),
                        onSuccess: () => setDeleting(null),
                        onError: () => toast.error('Profil belum dihapus'),
                    });
                }}
            />
        </AlumniAdminPage>
    );
}
