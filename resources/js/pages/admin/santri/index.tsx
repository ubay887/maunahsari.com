'use no memo';
import { Link, router } from '@inertiajs/react';
import {
    AdminDataGrid,
    withGridColumnDefaults,
} from '@/components/admin/admin-data-grid';
import { EmptyState } from '@/components/empty-state';
import { ArrowRight, ClipboardList, Eye } from 'lucide-react';
import {
    useTable,
    type ColumnDef,
    type PaginationState,
} from '@tanstack/react-table';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { Badge } from '@/components/reui/badge';
import {
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { Button } from '@/components/ui/button';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { formatDate } from '@/lib/format';
import { index, show } from '@/routes/admin/santri';
import { RecordActionLink, RecordActions } from '@/components/record-actions';
import {
    index as applicants,
    show as applicant,
} from '@/routes/admin/psb/applicants';
import type { Paginated } from '@/types/article';
import type { Santri } from '@/types/psb';
const hiddenByDefault = {
    gender: false,
    birth: false,
    city: false,
    guardian: false,
    registration: false,
};
export default function Index({ santris }: { santris: Paginated<Santri> }) {
    const page = useArticlePageState();
    const pagination: PaginationState = {
        pageIndex: santris.current_page - 1,
        pageSize: santris.per_page,
    };
    const columns: ColumnDef<DataGridFeatures, Santri>[] = [
        {
            accessorKey: 'full_name',
            header: 'Nama',
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <Link
                        href={show(row.original.id)}
                        className="font-medium hover:underline"
                    >
                        {row.original.full_name}
                    </Link>
                    {row.original.nickname && (
                        <span className="text-xs text-muted-foreground">
                            {row.original.nickname}
                        </span>
                    )}
                </div>
            ),
            size: 230,
            enableHiding: false,
        },
        {
            accessorKey: 'pondok',
            header: 'Pondok',
            size: 110,
            cell: ({ row }) => (
                <span className="capitalize">{row.original.pondok}</span>
            ),
        },
        {
            id: 'program',
            header: 'Program',
            size: 200,
            cell: ({ row }) => row.original.program.name,
        },
        {
            accessorKey: 'residence_type',
            header: 'Jenis santri',
            size: 130,
            cell: ({ row }) => (
                <span className="capitalize">
                    {row.original.residence_type}
                </span>
            ),
        },
        {
            accessorKey: 'entry_year',
            header: 'Tahun masuk',
            size: 120,
            meta: {
                headerClassName: 'text-end [&>div]:justify-end',
                cellClassName: 'text-end tabular-nums',
            },
        },
        {
            id: 'active',
            header: 'Status',
            size: 120,
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.is_active
                            ? 'success-light'
                            : 'warning-light'
                    }
                >
                    {row.original.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            accessorKey: 'gender',
            header: 'Jenis kelamin',
            size: 130,
            cell: ({ row }) =>
                row.original.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        },
        {
            id: 'birth',
            header: 'Tempat, tanggal lahir',
            size: 220,
            cell: ({ row }) =>
                `${row.original.birth_place}, ${formatDate(row.original.birth_date)}`,
        },
        {
            id: 'city',
            header: 'Kota/kabupaten',
            size: 170,
            cell: ({ row }) => row.original.city?.name ?? '—',
        },
        {
            id: 'guardian',
            header: 'Wali',
            size: 200,
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span>{row.original.guardian_name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {row.original.guardian_phone}
                    </span>
                </div>
            ),
        },
        {
            id: 'registration',
            header: 'Nomor registrasi',
            size: 190,
            cell: ({ row }) =>
                row.original.applicant?.registration_number ?? '—',
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <RecordActions title={row.original.full_name}>
                    <RecordActionLink href={show(row.original.id)} icon={Eye}>
                        Lihat detail
                    </RecordActionLink>
                    <RecordActionLink
                        href={applicant(row.original.applicant_id)}
                        icon={ClipboardList}
                    >
                        Lihat pendaftaran PSB
                    </RecordActionLink>
                </RecordActions>
            ),
        },
    ];
    const table = useTable({
        features: dataGridFeatures,
        columns: withGridColumnDefaults(columns),
        data: santris.data,
        rowCount: santris.total,
        getRowId: (row) => String(row.id),
        manualPagination: true,
        manualSorting: true,
        initialState: { columnVisibility: hiddenByDefault },
        state: { pagination },
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function' ? updater(pagination) : updater;
            router.get(
                index.url(),
                { page: next.pageIndex + 1, per_page: next.pageSize },
                { preserveState: true, preserveScroll: true },
            );
        },
    });
    return (
        <PsbAdminPage
            module="santri"
            title="Data santri"
            description="Data santri dari pendaftaran PSB yang telah diterima."
            actions={
                <Button type="button" variant="outline" asChild>
                    <Link href={applicants()}>
                        <ClipboardList aria-hidden="true" />
                        Pendaftar PSB
                    </Link>
                </Button>
            }
        >
            <AdminDataGrid
                table={table}
                recordCount={santris.total}
                isLoading={page.loading}
                noun="santri"
                title="Daftar santri"
                columnVisibility={false}
                empty={
                    <EmptyState
                        title="Belum ada data santri"
                        description="Santri muncul setelah pendaftaran PSB diterima."
                        action={
                            <Button type="button" variant="outline" asChild>
                                <Link href={applicants()}>
                                    Verifikasi pendaftar
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        }
                    />
                }
            />
        </PsbAdminPage>
    );
}
