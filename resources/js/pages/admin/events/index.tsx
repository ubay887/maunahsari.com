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
import {
    CalendarDays,
    Copy,
    ExternalLink,
    Eye,
    FileText,
    Pencil,
    Plus,
    Send,
    Trash2,
    Undo2,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { EventBadges } from '@/components/event-badges';
import { RecordActionLink, RecordActions } from '@/components/record-actions';
import { Badge } from '@/components/reui/badge';
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
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import {
    eventSchedule,
    eventStatusLabels,
    eventTypeLabels,
} from '@/lib/events';
import { formatDateTime } from '@/lib/format';
import { show as publicShow } from '@/routes/events';
import {
    index,
    create,
    edit,
    show,
    destroy,
    duplicate,
} from '@/routes/admin/events';
import { update as updateStatus } from '@/routes/admin/events/status';
import type { Paginated } from '@/types/article';
import type { AdminEventFilters, EventRow, EventStatus } from '@/types/event';
import { EventDateFilter } from './event-date-filter';

const hiddenByDefault = {
    categories: false,
    organizer: false,
    contact_whatsapp: false,
    slug: false,
    created_at: false,
    updated_at: false,
};
export default function Index({
    events,
    filters,
}: {
    events: Paginated<EventRow>;
    filters: AdminEventFilters;
}) {
    const page = useArticlePageState();
    const [searchDraft, setSearchDraft] = useState({
        applied: filters.search,
        value: filters.search,
    });
    const search =
        searchDraft.applied === filters.search
            ? searchDraft.value
            : filters.search;
    function setSearch(value: string) {
        setSearchDraft({ applied: filters.search, value });
    }
    const [deleting, setDeleting] = useState<EventRow | null>(null);
    const [cancelling, setCancelling] = useState<EventRow | null>(null);
    const [pending, setPending] = useState(false);
    const [draftQuery, setDraftQuery] = useState<FilterQuery | null>(null);
    const hasAppliedFilters = Boolean(
        filters.search ||
        filters.date_from ||
        filters.date_to ||
        filters.status ||
        filters.type,
    );
    const canResetFilters =
        hasAppliedFilters || search !== '' || Boolean(draftQuery?.rules.length);
    const query = useMemo(
        () =>
            createFilterQuery(
                (['status', 'type'] as const)
                    .filter((key) => filters[key])
                    .map((key) => ({
                        id: key,
                        type: 'rule' as const,
                        path: [key],
                        operator: 'is',
                        value: filters[key],
                    })),
            ),
        [filters.status, filters.type],
    );
    const fields: FilterField[] = [
        {
            id: 'status',
            label: 'Status',
            type: 'select',
            operators: [{ value: 'is', label: 'adalah' }],
            options: Object.entries(eventStatusLabels).map(
                ([value, label]) => ({ value, label }),
            ),
        },
        {
            id: 'type',
            label: 'Tipe',
            type: 'select',
            operators: [{ value: 'is', label: 'adalah' }],
            options: Object.entries(eventTypeLabels).map(([value, label]) => ({
                value,
                label,
            })),
        },
    ];
    function visit(changes: Record<string, string | number>) {
        router.get(
            index.url(),
            {
                ...filters,
                per_page: events.per_page,
                page: 1,
                ...changes,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onSuccess: () => setDraftQuery(null),
                onError: () =>
                    toast.error(
                        'Daftar event gagal dimuat. Periksa filter tanggal.',
                    ),
            },
        );
    }
    function changeStatus(event: EventRow, status: EventStatus) {
        router.patch(
            updateStatus.url(event.id),
            { status },
            {
                preserveScroll: true,
                onStart: () => setPending(true),
                onFinish: () => setPending(false),
                onSuccess: () => setCancelling(null),
                onError: () => toast.error('Status event gagal diperbarui.'),
            },
        );
    }
    const columns: ColumnDef<DataGridFeatures, EventRow>[] = [
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Event" />
            ),
            cell: ({ row }) => (
                <div className="flex min-w-0 items-center gap-3">
                    {row.original.banner_url ? (
                        <img
                            src={row.original.banner_url}
                            alt=""
                            loading="lazy"
                            className="size-10 shrink-0 object-cover"
                        />
                    ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
                            <CalendarDays
                                className="size-4 text-muted-foreground"
                                aria-hidden
                            />
                        </div>
                    )}
                    <Link
                        href={show(row.original.id)}
                        className="line-clamp-2 min-w-0 font-medium break-words whitespace-normal hover:underline"
                        title={row.original.title}
                    >
                        {row.original.title}
                    </Link>
                </div>
            ),
            size: 320,
            minSize: 240,
            enableHiding: false,
            meta: {
                headerTitle: 'Event',
                autoSize: true,
            },
        },
        {
            accessorKey: 'start_at',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Jadwal" />
            ),
            cell: ({ row }) => {
                const schedule = eventSchedule(
                    row.original.start_at,
                    row.original.end_at,
                );
                return (
                    <div className="flex flex-col gap-1 tabular-nums">
                        <span className="text-sm whitespace-normal">
                            {schedule.date}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {schedule.time}
                        </span>
                    </div>
                );
            },
            size: 220,
            minSize: 190,
            meta: {
                headerTitle: 'Jadwal',
            },
        },
        {
            accessorKey: 'type',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Tipe" />
            ),
            cell: ({ row }) => (
                <Badge variant="outline">
                    {eventTypeLabels[row.original.type]}
                </Badge>
            ),
            size: 110,
            minSize: 100,
            meta: { headerTitle: 'Tipe' },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <EventBadges
                    status={row.original.status}
                    phase={row.original.phase}
                />
            ),
            size: 170,
            minSize: 150,
            meta: { headerTitle: 'Status' },
        },
        {
            id: 'location',
            header: 'Lokasi',
            enableSorting: false,
            size: 200,
            cell: ({ row }) => row.original.location_name || '—',
        },
        {
            id: 'categories',
            header: 'Kategori',
            enableSorting: false,
            size: 180,
            cell: ({ row }) =>
                row.original.categories
                    .map((category) => category.name)
                    .join(', ') || '—',
        },
        {
            id: 'organizer',
            header: 'Penyelenggara',
            enableSorting: false,
            size: 160,
            cell: ({ row }) => row.original.organizer?.name ?? '—',
        },
        {
            accessorKey: 'contact_whatsapp',
            header: 'WhatsApp panitia',
            enableSorting: false,
            size: 160,
            cell: ({ row }) => row.original.contact_whatsapp || '—',
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            enableSorting: false,
            size: 220,
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.slug}
                </span>
            ),
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
            accessorKey: 'updated_at',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Diperbarui" />
            ),
            cell: ({ row }) => formatDateTime(row.original.updated_at),
            size: 170,
            meta: { headerTitle: 'Diperbarui' },
        },
        {
            id: 'actions',
            header: 'Aksi',
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
            size: 112,
            meta: {
                headerTitle: 'Aksi',
                headerClassName: 'text-right',
                cellClassName: 'whitespace-nowrap',
            },
            cell: ({ row }) => (
                <RecordActions
                    title={row.original.title}
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
                    {row.original.status === 'published' && (
                        <RecordActionLink
                            external
                            href={publicShow.url(row.original.slug)}
                            icon={ExternalLink}
                        >
                            Lihat di situs
                        </RecordActionLink>
                    )}
                    <DropdownMenuItem
                        onSelect={() =>
                            changeStatus(
                                row.original,
                                row.original.status === 'published'
                                    ? 'draft'
                                    : 'published',
                            )
                        }
                    >
                        {row.original.status === 'published' ? (
                            <Undo2 aria-hidden />
                        ) : (
                            <Send aria-hidden />
                        )}
                        {row.original.status === 'published'
                            ? 'Tarik terbit'
                            : 'Terbitkan'}
                    </DropdownMenuItem>
                    {row.original.status !== 'cancelled' && (
                        <DropdownMenuItem
                            onSelect={() => setCancelling(row.original)}
                        >
                            <XCircle aria-hidden />
                            Batalkan
                        </DropdownMenuItem>
                    )}
                    {row.original.status === 'cancelled' && (
                        <DropdownMenuItem
                            onSelect={() => changeStatus(row.original, 'draft')}
                        >
                            <FileText aria-hidden />
                            Jadikan draf
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onSelect={() =>
                            router.post(
                                duplicate.url(row.original.id),
                                {},
                                {
                                    onError: () =>
                                        toast.error('Event gagal diduplikasi.'),
                                },
                            )
                        }
                    >
                        <Copy aria-hidden />
                        Duplikat
                    </DropdownMenuItem>
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
        pageIndex: events.current_page - 1,
        pageSize: events.per_page,
    };
    const sorting: SortingState = [
        { id: filters.sort, desc: filters.direction === 'desc' },
    ];
    const table = useTable({
        features: dataGridFeatures,
        data: events.data,
        columns: withGridColumnDefaults(columns),
        rowCount: events.total,
        getRowId: (event) => String(event.id),
        manualPagination: true,
        manualSorting: true,
        autoResetPageIndex: false,
        initialState: { columnVisibility: hiddenByDefault },
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
        <>
            <AdminPage
                title="Event"
                description="Kelola jadwal dan kegiatan pesantren."
                actions={
                    <Button type="button" asChild>
                        <Link href={create()}>
                            <Plus aria-hidden />
                            Buat event
                        </Link>
                    </Button>
                }
            >
                <AdminDataGrid
                    table={table}
                    recordCount={events.total}
                    isLoading={page.loading}
                    noun="event"
                    title="Daftar event"
                    empty={
                        <EmptyState
                            title="Belum ada event yang sesuai"
                            action={
                                <Button type="button" asChild>
                                    <Link href={create()}>Buat event</Link>
                                </Button>
                            }
                        />
                    }
                    toolbar={
                        <>
                            <DataGridSearch
                                label="Cari event"
                                placeholder="Judul atau ringkasan…"
                                value={search}
                                disabled={page.loading}
                                onChange={setSearch}
                                onSubmit={() => {
                                    if (search.trim() !== filters.search) {
                                        visit({ search: search.trim() });
                                    }
                                }}
                                onClear={() => {
                                    setSearch('');
                                    if (filters.search) visit({ search: '' });
                                }}
                            />
                            <EventDateFilter
                                key={`${filters.date_from}:${filters.date_to}`}
                                from={filters.date_from}
                                to={filters.date_to}
                                disabled={page.loading}
                                onApply={(dateFrom, dateTo) =>
                                    visit({
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                    })
                                }
                            />
                            <DataGridFilters
                                noun="event"
                                disabled={page.loading}
                                fields={fields}
                                query={draftQuery ?? query}
                                onBeforeQueryChange={(next) => {
                                    const paths = next.rules.map((rule) =>
                                        rule.type === 'rule'
                                            ? rule.path.join('.')
                                            : '',
                                    );
                                    return (
                                        next.combinator === 'and' &&
                                        new Set(paths).size === paths.length &&
                                        next.rules.every(
                                            (rule) =>
                                                rule.type === 'rule' &&
                                                !rule.negated &&
                                                (!rule.operator ||
                                                    rule.operator === 'is'),
                                        )
                                    );
                                }}
                                onQueryChange={(next) => {
                                    setDraftQuery(next);
                                    if (
                                        next.rules.some(
                                            (rule) =>
                                                rule.type !== 'rule' ||
                                                !rule.operator ||
                                                typeof rule.value !== 'string',
                                        )
                                    )
                                        return;
                                    let status = '';
                                    let type = '';
                                    for (const rule of next.rules) {
                                        if (
                                            rule.type !== 'rule' ||
                                            typeof rule.value !== 'string'
                                        )
                                            continue;
                                        if (rule.path[0] === 'status')
                                            status = rule.value;
                                        if (rule.path[0] === 'type')
                                            type = rule.value;
                                    }
                                    visit({ status, type });
                                }}
                            />
                            <DataGridResetButton
                                active={canResetFilters}
                                disabled={page.loading}
                                onReset={() => {
                                    setSearch('');
                                    setDraftQuery(null);
                                    if (hasAppliedFilters)
                                        visit({
                                            search: '',
                                            date_from: '',
                                            date_to: '',
                                            status: '',
                                            type: '',
                                        });
                                }}
                            />
                        </>
                    }
                />
            </AdminPage>
            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                title="event ini"
                processing={pending}
                onConfirm={() => {
                    if (!deleting) return;
                    router.delete(destroy.url(deleting.id), {
                        preserveScroll: true,
                        onStart: () => setPending(true),
                        onFinish: () => setPending(false),
                        onSuccess: () => setDeleting(null),
                        onError: () => toast.error('Event gagal dihapus.'),
                    });
                }}
            />
            <AlertDialog
                open={cancelling !== null}
                onOpenChange={(open) => {
                    if (!pending && !open) setCancelling(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Batalkan event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Event tetap terlihat di situs publik dengan label
                            Dibatalkan. Periksa kembali sebelum melanjutkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pending}>
                            Kembali
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={pending}
                            onClick={() => {
                                if (cancelling)
                                    changeStatus(cancelling, 'cancelled');
                            }}
                        >
                            {pending ? 'Memproses…' : 'Batalkan event'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
