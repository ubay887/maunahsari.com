'use no memo';
import { router, useForm } from '@inertiajs/react';
import {
    useTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import { Copy, KeyRound, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPage } from '@/components/admin/admin-page';
import {
    AdminDataGrid,
    withGridColumnDefaults,
} from '@/components/admin/admin-data-grid';
import { DataGridResetButton } from '@/components/admin/data-grid-filters';
import { DataGridSearch } from '@/components/admin/data-grid-search';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { EmptyState } from '@/components/empty-state';
import InputError from '@/components/input-error';
import { RecordActions } from '@/components/record-actions';
import { Badge } from '@/components/reui/badge';
import {
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header';
import { SelectField } from '@/components/select-field';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
import { formatDate } from '@/lib/format';
import { index, store, update, destroy } from '@/routes/admin/users';
import { reset } from '@/routes/admin/users/password';
import type { Paginated } from '@/types/article';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_staff: boolean;
    two_factor_enabled: boolean;
    created_at: string | null;
    is_self: boolean;
};
type Filters = {
    search?: string;
    role?: string;
    sort?: string;
    direction?: string;
    per_page?: number;
};
type TemporaryPassword = { name: string; email: string; password: string };

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    editor: 'Editor',
    author: 'Penulis',
    alumni: 'Alumni',
    applicant: 'Calon santri',
};
const staffRoles = ['admin', 'editor', 'author'] as const;
const staffRoleOptions = staffRoles.map((value) => ({
    value,
    label: roleLabels[value],
}));
const roleBadge: Record<string, 'primary-light' | 'info-light' | 'outline'> = {
    admin: 'primary-light',
    editor: 'info-light',
    author: 'info-light',
    alumni: 'outline',
    applicant: 'outline',
};

function CreateStaffDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm({ name: '', email: '', role: 'editor' });

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!form.processing) {
                    if (!value) form.reset();
                    onOpenChange(value);
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah akun staf</DialogTitle>
                    <DialogDescription>
                        Kata sandi sementara dibuat otomatis dan hanya tampil
                        sekali setelah akun dibuat.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.submit(store(), {
                            preserveScroll: true,
                            onSuccess: () => {
                                form.reset();
                                onOpenChange(false);
                            },
                            onError: () => toast.error('Akun belum dibuat.'),
                        });
                    }}
                >
                    <Field>
                        <FieldLabel htmlFor="staff-name">Nama</FieldLabel>
                        <Input
                            id="staff-name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            autoComplete="off"
                            required
                        />
                        <InputError message={form.errors.name} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="staff-email">Email</FieldLabel>
                        <Input
                            id="staff-email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            autoComplete="off"
                            required
                        />
                        <InputError message={form.errors.email} />
                    </Field>
                    <SelectField
                        id="staff-role"
                        label="Peran"
                        value={form.data.role}
                        onChange={(value) => form.setData('role', value)}
                        options={staffRoleOptions}
                        error={form.errors.role}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan…' : 'Buat akun'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ChangeRoleDialog({
    user,
    onClose,
}: {
    user: UserRow | null;
    onClose: () => void;
}) {
    const [role, setRole] = useState('editor');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setError(undefined);
        }
    }, [user]);

    return (
        <Dialog
            open={user !== null}
            onOpenChange={(value) => {
                if (!processing && !value) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ubah peran</DialogTitle>
                    <DialogDescription>
                        {user ? `${user.name} (${user.email})` : ''}
                    </DialogDescription>
                </DialogHeader>
                <SelectField
                    id="change-role"
                    label="Peran"
                    value={role}
                    onChange={setRole}
                    options={staffRoleOptions}
                    error={error}
                />
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        onClick={onClose}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        disabled={processing || user?.role === role}
                        onClick={() => {
                            if (!user) return;
                            router.patch(
                                update.url(user.id),
                                { role },
                                {
                                    preserveScroll: true,
                                    onStart: () => setProcessing(true),
                                    onFinish: () => setProcessing(false),
                                    onSuccess: onClose,
                                    onError: (errors) => setError(errors.role),
                                },
                            );
                        }}
                    >
                        {processing ? 'Menyimpan…' : 'Simpan peran'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TemporaryPasswordDialog({
    credential,
    onClose,
}: {
    credential: TemporaryPassword | null;
    onClose: () => void;
}) {
    async function copy() {
        if (!credential) return;
        try {
            await navigator.clipboard.writeText(credential.password);
            toast.success('Kata sandi disalin.');
        } catch {
            toast.error('Gagal menyalin. Salin secara manual.');
        }
    }

    return (
        <Dialog
            open={credential !== null}
            onOpenChange={(value) => {
                if (!value) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kata sandi sementara</DialogTitle>
                    <DialogDescription>
                        Berikan kepada {credential?.name} secara langsung. Kata
                        sandi ini tidak dapat ditampilkan lagi setelah dialog
                        ditutup.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    <p className="text-sm break-all text-muted-foreground">
                        {credential?.email}
                    </p>
                    <div className="flex items-center gap-2">
                        <code
                            className="min-w-0 flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all select-all"
                            data-test="temporary-password"
                        >
                            {credential?.password}
                        </code>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Salin kata sandi"
                            onClick={() => void copy()}
                        >
                            <Copy aria-hidden />
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={onClose}>
                        Sudah dicatat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Users({
    users,
    filters,
}: {
    users: Paginated<UserRow>;
    filters: Filters;
}) {
    const page = useArticlePageState();
    const [search, setSearch] = useState(filters.search ?? '');
    const [creating, setCreating] = useState(false);
    const [changingRole, setChangingRole] = useState<UserRow | null>(null);
    const [resetting, setResetting] = useState<UserRow | null>(null);
    const [deleting, setDeleting] = useState<UserRow | null>(null);
    const [credential, setCredential] = useState<TemporaryPassword | null>(
        null,
    );
    const [pending, setPending] = useState(false);

    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.temporaryPassword as
                | TemporaryPassword
                | undefined;
            if (data) setCredential(data);
        });
    }, []);

    function visit(changes: Record<string, string | number>) {
        router.get(
            index.url(),
            { ...filters, search, page: 1, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const filtersActive = Boolean(filters.search || filters.role);

    const columns: ColumnDef<DataGridFeatures, UserRow>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Nama" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.is_self && (
                        <Badge variant="outline">Anda</Badge>
                    )}
                </div>
            ),
            size: 240,
            enableHiding: false,
            meta: { headerTitle: 'Nama' },
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Email" />
            ),
            size: 260,
            meta: { headerTitle: 'Email' },
        },
        {
            accessorKey: 'role',
            header: 'Peran',
            enableSorting: false,
            size: 140,
            cell: ({ row }) => (
                <Badge variant={roleBadge[row.original.role] ?? 'outline'}>
                    {roleLabels[row.original.role] ?? row.original.role}
                </Badge>
            ),
        },
        {
            accessorKey: 'two_factor_enabled',
            header: 'Autentikasi 2 langkah',
            enableSorting: false,
            size: 170,
            cell: ({ row }) =>
                row.original.two_factor_enabled ? (
                    <Badge variant="success-light">Aktif</Badge>
                ) : (
                    <span className="text-muted-foreground">Tidak aktif</span>
                ),
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataGridColumnHeader column={column} title="Dibuat" />
            ),
            size: 140,
            cell: ({ row }) => formatDate(row.original.created_at),
            meta: { headerTitle: 'Dibuat' },
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Aksi</span>,
            enableSorting: false,
            enableHiding: false,
            size: 64,
            cell: ({ row }) =>
                row.original.is_self ? null : (
                    <RecordActions
                        title={row.original.name}
                        disabled={page.loading || pending}
                    >
                        {row.original.is_staff && (
                            <DropdownMenuItem
                                onSelect={() => setChangingRole(row.original)}
                            >
                                <ShieldCheck aria-hidden />
                                Ubah peran
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onSelect={() => setResetting(row.original)}
                        >
                            <KeyRound aria-hidden />
                            Reset kata sandi
                        </DropdownMenuItem>
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
        pageIndex: users.current_page - 1,
        pageSize: users.per_page,
    };
    const sorting: SortingState = [
        { id: filters.sort ?? 'created_at', desc: filters.direction !== 'asc' },
    ];
    const table = useTable({
        features: dataGridFeatures,
        data: users.data,
        columns: withGridColumnDefaults(columns),
        rowCount: users.total,
        getRowId: (row) => String(row.id),
        manualPagination: true,
        manualSorting: true,
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
        <AdminPage
            title="Pengguna"
            description="Kelola akun staf, peran, dan kata sandi pengguna."
            actions={
                <Button type="button" onClick={() => setCreating(true)}>
                    <Plus aria-hidden />
                    Tambah staf
                </Button>
            }
        >
            <AdminDataGrid
                table={table}
                recordCount={users.total}
                isLoading={page.loading}
                noun="pengguna"
                title="Daftar pengguna"
                minWidthClass="min-w-[820px]"
                empty={
                    <EmptyState
                        title="Tidak ada pengguna sesuai filter"
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    router.get(index.url());
                                }}
                            >
                                Reset filter
                            </Button>
                        }
                    />
                }
                toolbar={
                    <>
                        <DataGridSearch
                            label="Cari pengguna"
                            placeholder="Cari nama atau email…"
                            value={search}
                            disabled={page.loading}
                            onChange={setSearch}
                            onSubmit={() => visit({ search })}
                            onClear={() => {
                                setSearch('');
                                visit({ search: '' });
                            }}
                        />
                        <Select
                            value={filters.role ?? 'all'}
                            disabled={page.loading}
                            onValueChange={(value) =>
                                visit({ role: value === 'all' ? '' : value })
                            }
                        >
                            <SelectTrigger aria-label="Filter peran">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua peran</SelectItem>
                                {Object.entries(roleLabels).map(
                                    ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                        <DataGridResetButton
                            active={filtersActive}
                            disabled={page.loading}
                            onReset={() => {
                                setSearch('');
                                router.get(index.url());
                            }}
                        />
                    </>
                }
            />
            <CreateStaffDialog open={creating} onOpenChange={setCreating} />
            <ChangeRoleDialog
                user={changingRole}
                onClose={() => setChangingRole(null)}
            />
            <TemporaryPasswordDialog
                credential={credential}
                onClose={() => setCredential(null)}
            />
            <AlertDialog
                open={resetting !== null}
                onOpenChange={(value) => {
                    if (!pending && !value) setResetting(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Reset kata sandi {resetting?.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Kata sandi lama tidak berlaku lagi dan semua sesi
                            login akun ini dikeluarkan. Kata sandi sementara
                            yang baru tampil sekali.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pending}>
                            Batal
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                                if (!resetting) return;
                                setPending(true);
                                router.post(
                                    reset.url(resetting.id),
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: () => setPending(false),
                                        onSuccess: () => setResetting(null),
                                        onError: () =>
                                            toast.error(
                                                'Kata sandi belum direset.',
                                            ),
                                    },
                                );
                            }}
                        >
                            {pending ? 'Mereset…' : 'Reset kata sandi'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(value) => {
                    if (!value) setDeleting(null);
                }}
                title={`akun ${deleting?.name ?? ''}`}
                description={
                    deleting?.role === 'alumni'
                        ? 'Akun beserta profil alumni dihapus permanen dan tidak dapat dikembalikan.'
                        : deleting?.role === 'applicant'
                          ? 'Akun dihapus permanen. Data pendaftaran tetap ada tetapi tidak lagi tertaut ke akun.'
                          : 'Akun staf dihapus permanen dan tidak dapat dikembalikan.'
                }
                processing={pending}
                onConfirm={() => {
                    if (!deleting) return;
                    setPending(true);
                    router.delete(destroy.url(deleting.id), {
                        preserveScroll: true,
                        onFinish: () => setPending(false),
                        onSuccess: () => setDeleting(null),
                        onError: (errors) => {
                            setDeleting(null);
                            toast.error(errors.user ?? 'Akun belum dihapus.');
                        },
                    });
                }}
            />
        </AdminPage>
    );
}
