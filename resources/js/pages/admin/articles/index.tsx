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
    Archive,
    ExternalLink,
    Eye,
    FileText,
    Pencil,
    Plus,
    Send,
    Settings2,
    Trash2,
    Undo2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
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
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { articleDate, articleStatusLabels } from '@/lib/articles';
import { formatDateTime, formatNumber } from '@/lib/format';
import { show as publicShow } from '@/routes/articles';
import { index, create, edit, show, destroy } from '@/routes/admin/articles';
import { update as updateStatus } from '@/routes/admin/articles/status';
import { index as taxonomies } from '@/routes/admin/taxonomies';
import type {
    Article,
    ArticleStatus,
    Paginated,
    Taxonomy,
} from '@/types/article';

type ArticleRow = Pick<
    Article,
    | 'id'
    | 'title'
    | 'slug'
    | 'status'
    | 'excerpt'
    | 'cover_url'
    | 'author'
    | 'categories'
    | 'tags'
    | 'views_count'
    | 'published_at'
    | 'created_at'
    | 'updated_at'
>;
type IndexFilters = {
    search: string;
    status: string;
    category: string;
    sort: string;
    direction: string;
};
const variants = {
    draft: 'secondary',
    published: 'success-light',
    scheduled: 'warning-light',
    archived: 'outline',
} as const;
const hiddenByDefault = {
    tags: false,
    slug: false,
    views_count: false,
    created_at: false,
    updated_at: false,
};
export default function Index({
    articles,
    categories,
    filters,
    canPublish,
    canManageTaxonomies,
}: {
    articles: Paginated<ArticleRow>;
    categories: Taxonomy[];
    filters: IndexFilters;
    canPublish: boolean;
    canManageTaxonomies: boolean;
}) {
    const page = useArticlePageState();
    const [search, setSearch] = useState(filters.search);
    const [deleting, setDeleting] = useState<ArticleRow | null>(null);
    const [pending, setPending] = useState(false);
    const query = useMemo<FilterQuery>(
        () =>
            createFilterQuery([
                ...(filters.status
                    ? [
                          {
                              id: 'status',
                              type: 'rule' as const,
                              path: ['status'],
                              operator: 'is',
                              value: filters.status,
                          },
                      ]
                    : []),
                ...(filters.category
                    ? [
                          {
                              id: 'category',
                              type: 'rule' as const,
                              path: ['category'],
                              operator: 'is',
                              value: filters.category,
                          },
                      ]
                    : []),
            ]),
        [filters.status, filters.category],
    );
    const [draftQuery, setDraftQuery] = useState<FilterQuery | null>(null);
    const fields: FilterField[] = [
        {
            id: 'status',
            label: 'Status',
            type: 'select',
            operators: [{ value: 'is', label: 'adalah' }],
            options: Object.entries(articleStatusLabels).map(
                ([value, label]) => ({ value, label }),
            ),
        },
        {
            id: 'category',
            label: 'Kategori',
            type: 'select',
            operators: [{ value: 'is', label: 'adalah' }],
            options: categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        },
    ];
    function visit(changes: Record<string, string | number>) {
        router.get(
            index.url(),
            {
                ...filters,
                search,
                page: 1,
                per_page: articles.per_page,
                ...changes,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onSuccess: () => setDraftQuery(null),
                onError: () => toast.error('Daftar artikel gagal dimuat.'),
            },
        );
    }
    function changeStatus(article: ArticleRow, status: ArticleStatus) {
        router.patch(
            updateStatus.url(article.id),
            { status },
            {
                preserveScroll: true,
                onError: () => toast.error('Status gagal diperbarui.'),
            },
        );
    }
    const columns: ColumnDef<DataGridFeatures, ArticleRow>[] = [
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Judul" />
            ),
            cell: ({ row }) => (
                <div className="flex min-w-0 items-center gap-3">
                    {row.original.cover_url ? (
                        <img
                            src={row.original.cover_url}
                            alt=""
                            className="size-10 shrink-0 object-cover"
                        />
                    ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
                            <FileText
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
            size: 340,
            minSize: 240,
            enableHiding: false,
            meta: { headerTitle: 'Judul', autoSize: true },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <Badge variant={variants[row.original.status]}>
                    {articleStatusLabels[row.original.status]}
                </Badge>
            ),
            size: 120,
            meta: { headerTitle: 'Status' },
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
            id: 'author',
            header: 'Penulis',
            enableSorting: false,
            size: 150,
            cell: ({ row }) => row.original.author.name,
        },
        {
            accessorKey: 'published_at',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Terbit" />
            ),
            cell: ({ row }) => articleDate(row.original.published_at),
            size: 140,
            meta: { headerTitle: 'Terbit' },
        },
        {
            accessorKey: 'views_count',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Tayangan" />
            ),
            cell: ({ row }) => formatNumber(row.original.views_count),
            size: 110,
            meta: {
                headerTitle: 'Tayangan',
                headerClassName: 'text-end [&>div]:justify-end',
                cellClassName: 'text-end tabular-nums',
            },
        },
        {
            id: 'tags',
            header: 'Tag',
            enableSorting: false,
            size: 180,
            cell: ({ row }) =>
                row.original.tags.map((tag) => tag.name).join(', ') || '—',
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
                    {canPublish && (
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
                    )}
                    <DropdownMenuItem
                        disabled={row.original.status === 'archived'}
                        onSelect={() => changeStatus(row.original, 'archived')}
                    >
                        <Archive aria-hidden />
                        Arsipkan
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
        pageIndex: articles.current_page - 1,
        pageSize: articles.per_page,
    };
    const sorting: SortingState = [
        { id: filters.sort, desc: filters.direction === 'desc' },
    ];
    const table = useTable({
        features: dataGridFeatures,
        data: articles.data,
        columns: withGridColumnDefaults(columns),
        rowCount: articles.total,
        getRowId: (article) => String(article.id),
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
                title="Artikel"
                description="Kelola tulisan dan publikasi pesantren."
                actions={
                    <>
                        {canManageTaxonomies && (
                            <Button type="button" variant="outline" asChild>
                                <Link href={taxonomies()}>
                                    <Settings2 aria-hidden />
                                    Kategori & tag
                                </Link>
                            </Button>
                        )}
                        <Button type="button" asChild>
                            <Link href={create()}>
                                <Plus aria-hidden />
                                Tulis artikel
                            </Link>
                        </Button>
                    </>
                }
            >
                <AdminDataGrid
                    table={table}
                    recordCount={articles.total}
                    isLoading={page.loading}
                    noun="artikel"
                    title="Daftar artikel"
                    minWidthClass="min-w-[960px]"
                    empty={
                        <EmptyState
                            title="Belum ada artikel yang cocok"
                            action={
                                <Button type="button" asChild>
                                    <Link href={create()}>
                                        Tulis artikel pertama
                                    </Link>
                                </Button>
                            }
                        />
                    }
                    toolbar={
                        <>
                            <DataGridSearch
                                label="Cari artikel"
                                placeholder="Cari judul atau ringkasan…"
                                value={search}
                                disabled={page.loading}
                                onChange={setSearch}
                                onSubmit={() => visit({ search })}
                                onClear={() => {
                                    setSearch('');
                                    visit({ search: '' });
                                }}
                            />
                            <DataGridFilters
                                noun="artikel"
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
                                    let category = '';
                                    for (const rule of next.rules) {
                                        if (
                                            rule.type !== 'rule' ||
                                            rule.operator !== 'is' ||
                                            typeof rule.value !== 'string'
                                        )
                                            continue;
                                        if (rule.path[0] === 'status')
                                            status = rule.value;
                                        if (rule.path[0] === 'category')
                                            category = rule.value;
                                    }
                                    visit({ status, category });
                                }}
                            />
                            <DataGridResetButton
                                active={
                                    search !== '' ||
                                    Boolean(
                                        filters.search ||
                                        filters.status ||
                                        filters.category,
                                    ) ||
                                    Boolean(draftQuery?.rules.length)
                                }
                                disabled={page.loading}
                                onReset={() => {
                                    setSearch('');
                                    setDraftQuery(null);
                                    visit({
                                        search: '',
                                        status: '',
                                        category: '',
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
                title="artikel ini"
                processing={pending}
                onConfirm={() => {
                    if (!deleting) return;
                    router.delete(destroy.url(deleting.id), {
                        preserveScroll: true,
                        onStart: () => setPending(true),
                        onFinish: () => setPending(false),
                        onSuccess: () => setDeleting(null),
                        onError: () => toast.error('Artikel gagal dihapus.'),
                    });
                }}
            />
        </>
    );
}
