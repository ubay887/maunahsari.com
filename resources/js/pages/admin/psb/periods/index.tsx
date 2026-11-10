import { Link, router } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { dateTime } from '@/lib/psb';
import { create, edit, destroy } from '@/routes/admin/psb/periods';
import type { Period } from '@/types/psb';
export default function Periods({ periods }: { periods: Period[] }) {
    const [deleting, setDeleting] = useState<Period | null>(null);
    const [pending, setPending] = useState(false);
    return (
        <PsbAdminPage
            title="Periode PSB"
            description="Atur jadwal pendaftaran, kontak, dan informasi setiap periode."
            actions={
                <Button type="button" asChild>
                    <Link href={create()}>Tambah periode</Link>
                </Button>
            }
        >
            <Frame spacing="default">
                <FrameHeader className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <FrameTitle>Periode pendaftaran</FrameTitle>
                        <Badge variant="outline">
                            {periods.length} periode
                        </Badge>
                    </div>
                    <FrameDescription>
                        Kelola waktu pembukaan dan penutupan pendaftaran.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    {periods.length === 0 && (
                        <EmptyState
                            bordered
                            title="Belum ada periode PSB"
                            action={
                                <Button type="button" variant="outline" asChild>
                                    <Link href={create()}>Tambah periode</Link>
                                </Button>
                            }
                        />
                    )}
                    {periods.map((period) => (
                        <div
                            key={period.id}
                            className="flex flex-wrap items-start justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
                        >
                            <div className="flex min-w-0 flex-1 basis-64 flex-col items-start gap-2">
                                <span className="font-medium">
                                    {period.name}{' '}
                                    <span className="text-muted-foreground">
                                        / {period.academic_year}
                                    </span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {dateTime(period.opens_at)} sampai{' '}
                                    {period.closes_at
                                        ? dateTime(period.closes_at)
                                        : 'tanpa batas akhir'}
                                </span>
                                <Badge
                                    variant={
                                        period.is_open
                                            ? 'success-light'
                                            : 'warning-light'
                                    }
                                >
                                    {period.is_open
                                        ? 'Dibuka sesuai jadwal'
                                        : 'Ditutup'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" asChild>
                                    <Link href={edit(period.id)}>
                                        Edit periode
                                    </Link>
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDeleting(period)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    ))}
                </FramePanel>
            </Frame>
            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(value) => {
                    if (!value) setDeleting(null);
                }}
                title={deleting?.name ?? 'periode'}
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
                                        'Periode gagal dihapus.',
                                ),
                        });
                }}
            />
        </PsbAdminPage>
    );
}
