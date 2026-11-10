'use no memo';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AdminDataGrid,
    withGridColumnDefaults,
} from '@/components/admin/admin-data-grid';
import { EmptyState } from '@/components/empty-state';
import { RecordActionLink, RecordActions } from '@/components/record-actions';
import { formatNumber } from '@/lib/format';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Newspaper, Pencil, Trash2 } from 'lucide-react';
import { useTable, type ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import InputError from '@/components/input-error';
import {
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { slugify } from '@/lib/articles';
import { index as articlesIndex } from '@/routes/admin/articles';
import { store, update, destroy } from '@/routes/admin/taxonomies';
import type { Taxonomy } from '@/types/article';
type Kind = 'categories' | 'tags';
function TaxonomyForm({
    kind,
    item,
    categories,
    done,
}: {
    kind: Kind;
    item?: Taxonomy;
    categories: Taxonomy[];
    done: () => void;
}) {
    const form = useForm({
        name: item?.name ?? '',
        slug: item?.slug ?? '',
        parent_id: item?.parent_id ? String(item.parent_id) : '',
    });
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                const options = {
                    preserveScroll: true,
                    onSuccess: done,
                    onError: () => toast.error('Periksa isian taksonomi.'),
                };
                if (item)
                    form.put(
                        update.url({ taxonomy: kind, id: item.id }),
                        options,
                    );
                else form.post(store.url(kind), options);
            }}
        >
            <Field className="w-auto">
                <FieldLabel htmlFor="taxonomy-name">Nama</FieldLabel>
                <Input
                    id="taxonomy-name"
                    required
                    value={form.data.name}
                    onChange={(event) => {
                        const name = event.target.value;
                        form.setData((data) => ({
                            ...data,
                            name,
                            slug: item ? data.slug : slugify(name),
                        }));
                    }}
                />
                <InputError message={form.errors.name} />
            </Field>
            <Field className="w-auto">
                <FieldLabel htmlFor="taxonomy-slug">Slug</FieldLabel>
                <Input
                    id="taxonomy-slug"
                    required
                    value={form.data.slug}
                    onChange={(event) =>
                        form.setData('slug', event.target.value)
                    }
                />
                <InputError message={form.errors.slug} />
            </Field>
            {kind === 'categories' && (
                <Field className="w-auto">
                    <FieldLabel htmlFor="taxonomy-parent">
                        Kategori induk
                    </FieldLabel>
                    <Select
                        value={form.data.parent_id || 'none'}
                        onValueChange={(value) =>
                            form.setData(
                                'parent_id',
                                value === 'none' ? '' : value,
                            )
                        }
                    >
                        <SelectTrigger id="taxonomy-parent">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Tanpa induk</SelectItem>
                            {categories
                                .filter(
                                    (category) =>
                                        !category.parent_id &&
                                        category.id !== item?.id,
                                )
                                .map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.parent_id} />
                </Field>
            )}
            <Button type="submit" disabled={form.processing}>
                {form.processing ? 'Menyimpan…' : 'Simpan'}
            </Button>
        </form>
    );
}
export default function Taxonomies({
    categories,
    tags,
}: {
    categories: Taxonomy[];
    tags: Taxonomy[];
}) {
    const page = useArticlePageState();
    const [dialog, setDialog] = useState<{
        kind: Kind;
        item?: Taxonomy;
    } | null>(null);
    const [deleting, setDeleting] = useState<{
        kind: Kind;
        item: Taxonomy;
    } | null>(null);
    const [pending, setPending] = useState(false);
    const columns = (kind: Kind): ColumnDef<DataGridFeatures, Taxonomy>[] => [
        {
            accessorKey: 'name',
            header: 'Nama',
            enableHiding: false,
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        ...(kind === 'categories'
            ? [
                  {
                      id: 'parent',
                      header: 'Induk',
                      cell: ({ row }: { row: { original: Taxonomy } }) =>
                          row.original.parent?.name ?? '—',
                  },
              ]
            : []),
        {
            id: 'articles_count',
            header: 'Artikel',
            meta: {
                headerClassName: 'text-end [&>div]:justify-end',
                cellClassName: 'text-end tabular-nums',
            },
            cell: ({ row }) => formatNumber(row.original.articles_count ?? 0),
        },
        ...(kind === 'categories'
            ? [
                  {
                      id: 'events_count',
                      header: 'Event',
                      meta: {
                          headerClassName: 'text-end [&>div]:justify-end',
                          cellClassName: 'text-end tabular-nums',
                      },
                      cell: ({ row }: { row: { original: Taxonomy } }) =>
                          formatNumber(row.original.events_count ?? 0),
                  },
              ]
            : []),
        {
            accessorKey: 'slug',
            header: 'Slug',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.slug}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <RecordActions
                    title={row.original.name}
                    disabled={page.loading}
                >
                    {kind === 'categories' && (
                        <RecordActionLink
                            href={articlesIndex({
                                query: { category: row.original.id },
                            })}
                            icon={Newspaper}
                        >
                            Lihat artikel
                        </RecordActionLink>
                    )}
                    <DropdownMenuItem
                        onSelect={() => setDialog({ kind, item: row.original })}
                    >
                        <Pencil aria-hidden />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() =>
                            setDeleting({ kind, item: row.original })
                        }
                    >
                        <Trash2 aria-hidden />
                        Hapus
                    </DropdownMenuItem>
                </RecordActions>
            ),
        },
    ];
    const categoryTable = useTable({
        features: dataGridFeatures,
        data: categories,
        columns: withGridColumnDefaults(columns('categories')),
    });
    const tagTable = useTable({
        features: dataGridFeatures,
        data: tags,
        columns: withGridColumnDefaults(columns('tags')),
    });
    return (
        <>
            <AdminPage
                title="Kategori & tag"
                description="Kelompokkan artikel agar mudah ditemukan pembaca."
                actions={
                    <Button type="button" variant="outline" asChild>
                        <Link href={articlesIndex()}>Kembali ke artikel</Link>
                    </Button>
                }
            >
                {[
                    {
                        kind: 'categories' as const,
                        label: 'Kategori',
                        table: categoryTable,
                        total: categories.length,
                    },
                    {
                        kind: 'tags' as const,
                        label: 'Tag',
                        table: tagTable,
                        total: tags.length,
                    },
                ].map((section) => (
                    <AdminDataGrid
                        key={section.kind}
                        table={section.table}
                        recordCount={section.total}
                        isLoading={page.loading}
                        noun={section.label.toLowerCase()}
                        title={section.label}
                        columnVisibility={false}
                        minWidthClass="min-w-[480px]"
                        empty={
                            <EmptyState
                                title={`Belum ada ${section.label.toLowerCase()}`}
                                action={
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setDialog({ kind: section.kind })
                                        }
                                    >
                                        Tambah {section.label.toLowerCase()}
                                    </Button>
                                }
                            />
                        }
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setDialog({ kind: section.kind })
                                }
                            >
                                Tambah
                            </Button>
                        }
                    />
                ))}
            </AdminPage>
            <Dialog
                open={dialog !== null}
                onOpenChange={(open) => {
                    if (!open) setDialog(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialog?.item ? 'Edit' : 'Tambah'}{' '}
                            {dialog?.kind === 'categories' ? 'kategori' : 'tag'}
                        </DialogTitle>
                        <DialogDescription>
                            Kategori mendukung satu tingkat subkategori.
                        </DialogDescription>
                    </DialogHeader>
                    {dialog && (
                        <TaxonomyForm
                            key={dialog.kind + String(dialog.item?.id ?? 'new')}
                            kind={dialog.kind}
                            item={dialog.item}
                            categories={categories}
                            done={() => setDialog(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                title={deleting?.item.name ?? 'data ini'}
                processing={pending}
                onConfirm={() => {
                    if (!deleting) return;
                    router.delete(
                        destroy.url({
                            taxonomy: deleting.kind,
                            id: deleting.item.id,
                        }),
                        {
                            preserveScroll: true,
                            onStart: () => setPending(true),
                            onFinish: () => setPending(false),
                            onSuccess: () => setDeleting(null),
                            onError: () =>
                                toast.error('Taksonomi gagal dihapus.'),
                        },
                    );
                }}
            />
        </>
    );
}
