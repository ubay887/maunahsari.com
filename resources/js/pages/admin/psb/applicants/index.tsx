'use no memo';
import { Link, router } from '@inertiajs/react';
import {
    AdminDataGrid,
    withGridColumnDefaults,
} from '@/components/admin/admin-data-grid';
import {
    DataGridFilters,
    DataGridResetButton,
} from '@/components/admin/data-grid-filters';
import { DataGridSearch } from '@/components/admin/data-grid-search';
import { EmptyState } from '@/components/empty-state';
import {
    useTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { RecordActionLink, RecordActions } from '@/components/record-actions';
import { Badge } from '@/components/reui/badge';
import { formatDate, formatDateTime } from '@/lib/format';
import { StatusBadge } from '@/components/psb/status-badge';
import {
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header';
import { createFilterQuery } from '@/components/reui/filters/filters-query';
import type {
    FilterField,
    FilterQuery,
} from '@/components/reui/filters/filters-types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { statusLabels } from '@/lib/psb';
import {
    index,
    create,
    show,
    edit,
    destroy,
    exportMethod,
} from '@/routes/admin/psb/applicants';
import type { Paginated } from '@/types/article';
import type { Applicant, FormOptions } from '@/types/psb';
const hiddenByDefault = {
    period: false,
    source: false,
    gender: false,
    birth: false,
    last_education: false,
    hafalan_juz: false,
    guardian: false,
    visit_scheduled_at: false,
};
export default function Applicants({
    applicants,
    filters,
    periods,
    programs,
}: FormOptions & {
    applicants: Paginated<Applicant>;
    filters: Record<string, string>;
}) {
    const page = useArticlePageState();
    const [searchDraft, setSearchDraft] = useState({
        applied: filters.search ?? '',
        value: filters.search ?? '',
    });
    const search =
        searchDraft.applied === (filters.search ?? '')
            ? searchDraft.value
            : (filters.search ?? '');
    function setSearch(value: string) {
        setSearchDraft({ applied: filters.search ?? '', value });
    }
    const [draft, setDraft] = useState<FilterQuery | null>(null);
    const [deleting, setDeleting] = useState<Applicant | null>(null);
    const [pending, setPending] = useState(false);
    function visit(changes: Record<string, string | number>) {
        router.get(
            index.url(),
            { ...filters, per_page: applicants.per_page, page: 1, ...changes },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onSuccess: () => setDraft(null),
                onError: () => toast.error('Daftar pendaftar gagal dimuat.'),
            },
        );
    }
    const config = [
        {
            id: 'registration_period_id',
            label: 'Periode',
            options: periods.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        },
        {
            id: 'pondok',
            label: 'Pondok',
            options: [
                { value: 'putra', label: 'Putra' },
                { value: 'putri', label: 'Putri' },
            ],
        },
        {
            id: 'program_id',
            label: 'Program',
            options: programs.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        },
        {
            id: 'status',
            label: 'Status',
            options: Object.entries(statusLabels).map(([value, label]) => ({
                value,
                label,
            })),
        },
        {
            id: 'residence_type',
            label: 'Jenis santri',
            options: [
                { value: 'mukim', label: 'Mukim' },
                { value: 'nduduk', label: 'Nduduk' },
            ],
        },
        {
            id: 'source',
            label: 'Sumber',
            options: [
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Luring' },
            ],
        },
    ];
    const fields: FilterField[] = config.map((field) => ({
        ...field,
        type: 'select',
        operators: [{ value: 'is', label: 'adalah' }],
    }));
    const query = createFilterQuery(
        config
            .filter((field) => filters[field.id])
            .map((field) => ({
                id: field.id,
                type: 'rule' as const,
                path: [field.id],
                operator: 'is',
                value: filters[field.id],
            })),
    );
    const columns: ColumnDef<DataGridFeatures, Applicant>[] = [
        {
            accessorKey: 'registration_number',
            header: ({ column }) => (
                <DataGridColumnHeader
                    column={column}
                    title="Nomor registrasi"
                />
            ),
            cell: ({ row }) => (
                <Link
                    href={show(row.original.id)}
                    className="font-medium hover:underline"
                >
                    {row.original.registration_number}
                </Link>
            ),
            size: 190,
            enableHiding: false,
            meta: { headerTitle: 'Nomor registrasi' },
        },
        {
            accessorKey: 'full_name',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Nama" />
            ),
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                        {row.original.full_name}
                    </span>
                    {row.original.nickname && (
                        <span className="text-xs text-muted-foreground">
                            {row.original.nickname}
                        </span>
                    )}
                </div>
            ),
            size: 220,
            enableHiding: false,
            meta: { headerTitle: 'Nama' },
        },
        {
            id: 'program',
            header: 'Program / Pondok',
            enableSorting: false,
            size: 210,
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span>{row.original.program.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                        {row.original.pondok} / {row.original.residence_type}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
            size: 180,
            meta: { headerTitle: 'Status' },
        },
        {
            accessorKey: 'guardian_phone',
            header: 'WhatsApp wali',
            enableSorting: false,
            size: 150,
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {row.original.guardian_phone}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Tanggal daftar" />
            ),
            cell: ({ row }) => formatDate(row.original.created_at),
            size: 150,
            meta: { headerTitle: 'Tanggal daftar' },
        },
        {
            id: 'period',
            header: 'Periode',
            enableSorting: false,
            size: 170,
            cell: ({ row }) => row.original.registration_period?.name ?? '—',
        },
        {
            accessorKey: 'source',
            header: 'Sumber',
            enableSorting: false,
            size: 110,
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.original.source === 'online' ? 'Daring' : 'Luring'}
                </Badge>
            ),
        },
        {
            accessorKey: 'gender',
            header: 'Jenis kelamin',
            enableSorting: false,
            size: 130,
            cell: ({ row }) =>
                row.original.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        },
        {
            id: 'birth',
            header: 'Tempat, tanggal lahir',
            enableSorting: false,
            size: 220,
            cell: ({ row }) =>
                `${row.original.birth_place}, ${formatDate(row.original.birth_date)}`,
        },
        {
            accessorKey: 'last_education',
            header: 'Pendidikan terakhir',
            enableSorting: false,
            size: 170,
            cell: ({ row }) => row.original.last_education || '—',
        },
        {
            accessorKey: 'hafalan_juz',
            header: 'Hafalan (juz)',
            enableSorting: false,
            size: 120,
            meta: {
                headerClassName: 'text-end [&>div]:justify-end',
                cellClassName: 'text-end tabular-nums',
            },
            cell: ({ row }) => row.original.hafalan_juz ?? '—',
        },
        {
            id: 'guardian',
            header: 'Wali',
            enableSorting: false,
            size: 200,
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span>{row.original.guardian_name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                        {row.original.guardian_relation}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'visit_scheduled_at',
            header: 'Jadwal kunjungan',
            enableSorting: false,
            size: 190,
            cell: ({ row }) => formatDateTime(row.original.visit_scheduled_at),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <RecordActions
                    title={row.original.full_name}
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
        pageIndex: applicants.current_page - 1,
        pageSize: applicants.per_page,
    };
    const sorting: SortingState = [
        { id: filters.sort ?? 'created_at', desc: filters.direction !== 'asc' },
    ];
    const table = useTable({
        features: dataGridFeatures,
        data: applicants.data,
        columns: withGridColumnDefaults(columns),
        rowCount: applicants.total,
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
        <PsbAdminPage
            title="Pendaftar PSB"
            description="Kelola biodata, berkas, dan penerimaan calon santri."
            actions={
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" asChild>
                        <a href={exportMethod.url({ query: filters })}>
                            <Download aria-hidden="true" />
                            Ekspor CSV
                        </a>
                    </Button>
                    <Button type="button" asChild>
                        <Link href={create()}>
                            <Plus aria-hidden="true" />
                            Tambah pendaftar
                        </Link>
                    </Button>
                </div>
            }
        >
            <AdminDataGrid
                table={table}
                recordCount={applicants.total}
                isLoading={page.loading}
                noun="pendaftar"
                title="Daftar pendaftar"
                minWidthClass="min-w-[900px]"
                empty={
                    <EmptyState
                        title={
                            filters.search || query.rules.length
                                ? 'Tidak ada pendaftar yang sesuai'
                                : 'Belum ada pendaftar'
                        }
                        description={
                            filters.search || query.rules.length
                                ? 'Ubah pencarian atau reset filter.'
                                : 'Mulai dengan mencatat pendaftaran luring.'
                        }
                        action={
                            <Button type="button" variant="outline" asChild>
                                <Link href={create()}>
                                    <Plus aria-hidden="true" />
                                    Tambah pendaftar
                                </Link>
                            </Button>
                        }
                    />
                }
                toolbar={
                    <>
                        <DataGridSearch
                            label="Cari nama, nomor registrasi, atau WhatsApp wali"
                            placeholder="Nama, registrasi, WhatsApp wali…"
                            value={search}
                            disabled={page.loading}
                            onChange={setSearch}
                            onSubmit={() => visit({ search })}
                            onClear={() => {
                                setSearch('');
                                if (filters.search) visit({ search: '' });
                            }}
                        />
                        <DataGridFilters
                            noun="pendaftar"
                            disabled={page.loading}
                            fields={fields}
                            query={draft ?? query}
                            onBeforeQueryChange={(next) =>
                                next.combinator === 'and' &&
                                new Set(
                                    next.rules.map((rule) =>
                                        rule.type === 'rule'
                                            ? rule.path[0]
                                            : '',
                                    ),
                                ).size === next.rules.length &&
                                next.rules.every(
                                    (rule) =>
                                        rule.type === 'rule' &&
                                        !rule.negated &&
                                        (!rule.operator ||
                                            rule.operator === 'is'),
                                )
                            }
                            onQueryChange={(next) => {
                                setDraft(next);
                                if (
                                    next.rules.some(
                                        (rule) =>
                                            rule.type !== 'rule' ||
                                            !rule.operator ||
                                            typeof rule.value !== 'string',
                                    )
                                )
                                    return;
                                const values: Record<string, string> = {};
                                for (const field of config)
                                    values[field.id] = '';
                                for (const rule of next.rules) {
                                    if (
                                        rule.type === 'rule' &&
                                        typeof rule.value === 'string'
                                    )
                                        values[rule.path[0] ?? ''] = rule.value;
                                }
                                visit(values);
                            }}
                        />
                        <DataGridResetButton
                            active={
                                search !== '' ||
                                Object.values(filters).some(Boolean) ||
                                Boolean(draft?.rules.length)
                            }
                            disabled={page.loading}
                            onReset={() => {
                                setSearch('');
                                setDraft(null);
                                router.get(index());
                            }}
                        />
                    </>
                }
            />
            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(value) => {
                    if (!value) setDeleting(null);
                }}
                title={deleting?.full_name ?? 'pendaftar'}
                processing={pending}
                onConfirm={() => {
                    if (deleting)
                        router.delete(destroy.url(deleting.id), {
                            onStart: () => setPending(true),
                            onFinish: () => setPending(false),
                            onSuccess: () => setDeleting(null),
                            onError: () =>
                                toast.error('Pendaftar gagal dihapus.'),
                        });
                }}
            />
        </PsbAdminPage>
    );
}
