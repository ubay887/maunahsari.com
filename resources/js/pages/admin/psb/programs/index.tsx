import { router, useForm } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FrameDescription,
    FramePanel,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { store, update, destroy } from '@/routes/admin/psb/programs';
import type { Program } from '@/types/psb';
function ProgramForm({
    program,
    onSaved,
}: {
    program: Program | null;
    onSaved: () => void;
}) {
    const form = useForm({
        name: program?.name ?? '',
        slug: program?.slug ?? '',
        description: program?.description ?? '',
        requires_hafalan: program?.requires_hafalan ?? false,
        sort_order: program?.sort_order ?? 0,
        is_active: program?.is_active ?? true,
    });
    return (
        <form
            className="flex min-h-0 flex-col gap-4 overflow-y-auto"
            onSubmit={(event) => {
                event.preventDefault();
                form.submit(program ? update(program.id) : store(), {
                    onSuccess: onSaved,
                    onError: () => toast.error('Program belum tersimpan.'),
                });
            }}
        >
            {(['name', 'slug', 'sort_order'] as const).map((key) => (
                <Field key={key}>
                    <FieldLabel htmlFor={key}>
                        {key === 'name'
                            ? 'Nama'
                            : key === 'slug'
                              ? 'Slug'
                              : 'Urutan'}
                    </FieldLabel>
                    <Input
                        id={key}
                        type={key === 'sort_order' ? 'number' : 'text'}
                        value={form.data[key]}
                        onChange={(event) =>
                            key === 'sort_order'
                                ? form.setData(key, Number(event.target.value))
                                : form.setData(key, event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors[key]} />
                </Field>
            ))}
            <Field>
                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                <Textarea
                    id="description"
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    required
                />
                <InputError message={form.errors.description} />
            </Field>
            {(['requires_hafalan', 'is_active'] as const).map((key) => (
                <Field key={key}>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={key}
                            checked={form.data[key]}
                            onCheckedChange={(value) =>
                                form.setData(key, value === true)
                            }
                        />
                        <FieldLabel htmlFor={key}>
                            {key === 'requires_hafalan'
                                ? 'Memerlukan hafalan'
                                : 'Aktif'}
                        </FieldLabel>
                    </div>
                    <InputError message={form.errors[key]} />
                </Field>
            ))}
            <Button type="submit" disabled={form.processing}>
                Simpan program
            </Button>
        </form>
    );
}
export default function Programs({ programs }: { programs: Program[] }) {
    const [editing, setEditing] = useState<Program | null>(null);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState<Program | null>(null);
    const [pending, setPending] = useState(false);
    return (
        <PsbAdminPage
            title="Program PSB"
            description="Kelola program pembelajaran dan persyaratan calon santri."
            actions={
                <Button
                    type="button"
                    onClick={() => {
                        setEditing(null);
                        setOpen(true);
                    }}
                >
                    Tambah program
                </Button>
            }
        >
            <Frame spacing="default">
                <FrameHeader className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <FrameTitle>Program pembelajaran</FrameTitle>
                        <Badge variant="outline">
                            {programs.length} program
                        </Badge>
                    </div>
                    <FrameDescription>
                        Program aktif dapat dipilih pada pendaftaran.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    {programs.length === 0 && (
                        <EmptyState
                            bordered
                            title="Belum ada program"
                            action={
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(true)}
                                >
                                    Tambah program
                                </Button>
                            }
                        />
                    )}
                    {programs.map((program) => (
                        <div
                            key={program.id}
                            className="flex flex-wrap items-start justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
                        >
                            <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
                                <span className="font-medium">
                                    {program.name}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    {program.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant={
                                            program.is_active
                                                ? 'success-light'
                                                : 'warning-light'
                                        }
                                    >
                                        {program.is_active
                                            ? 'Aktif'
                                            : 'Nonaktif'}
                                    </Badge>
                                    {program.requires_hafalan && (
                                        <Badge variant="outline">
                                            Memerlukan hafalan
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditing(program);
                                        setOpen(true);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDeleting(program)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    ))}
                </FramePanel>
            </Frame>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex h-[85dvh] min-h-0 flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit' : 'Tambah'} program
                        </DialogTitle>
                        <DialogDescription>
                            Atur program pembelajaran yang ditawarkan.
                        </DialogDescription>
                    </DialogHeader>
                    <ProgramForm
                        key={editing?.id ?? 'new'}
                        program={editing}
                        onSaved={() => setOpen(false)}
                    />
                </DialogContent>
            </Dialog>
            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(value) => {
                    if (!value) setDeleting(null);
                }}
                title={deleting?.name ?? 'program'}
                processing={pending}
                onConfirm={() => {
                    if (deleting)
                        router.delete(destroy.url(deleting.id), {
                            onStart: () => setPending(true),
                            onFinish: () => setPending(false),
                            onSuccess: () => setDeleting(null),
                            onError: (errors) =>
                                toast.error(
                                    Object.values(errors)[0] ??
                                        'Program gagal dihapus.',
                                ),
                        });
                }}
            />
        </PsbAdminPage>
    );
}
