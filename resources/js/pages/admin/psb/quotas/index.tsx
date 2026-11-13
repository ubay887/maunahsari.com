import { Link, router, useForm } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { SelectField } from '@/components/select-field';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
    FrameDescription,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { index, store } from '@/routes/admin/psb/quotas';
import { index as programsIndex } from '@/routes/admin/psb/programs';
import { index as periodsIndex } from '@/routes/admin/psb/periods';
import type {
    FormOptions,
    Pondok,
    Program,
    Quota,
    QuotaUnavailableReason,
} from '@/types/psb';

type QuotaStatus = {
    variant: 'success-light' | 'warning-light' | 'destructive-light';
    label: string;
    reason: string | null;
};

const unavailableStatus: Record<QuotaUnavailableReason, QuotaStatus> = {
    closed: {
        variant: 'destructive-light',
        label: 'Ditutup',
        reason: 'Pendaftaran dimatikan. Nyalakan lalu simpan untuk membuka.',
    },
    period_closed: {
        variant: 'warning-light',
        label: 'Periode tutup',
        reason: 'Periode pendaftaran sedang tidak dibuka. Atur di menu Periode.',
    },
    program_inactive: {
        variant: 'warning-light',
        label: 'Program nonaktif',
        reason: 'Program ini nonaktif. Aktifkan di menu Program.',
    },
    no_capacity: {
        variant: 'warning-light',
        label: 'Kapasitas 0',
        reason: 'Isi kapasitas lebih dari 0 agar pendaftar bisa masuk.',
    },
    full: {
        variant: 'warning-light',
        label: 'Penuh',
        reason: 'Kapasitas sudah terpakai semua. Tambah kapasitas untuk membuka.',
    },
};

function quotaStatus(quota?: Quota): QuotaStatus {
    if (!quota) return unavailableStatus.closed;
    if (quota.unavailable_reason === null) {
        return { variant: 'success-light', label: 'Tersedia', reason: null };
    }
    return unavailableStatus[quota.unavailable_reason];
}
function QuotaCell({
    quota,
    program,
    pondok,
    periodId,
}: {
    quota?: Quota;
    program: Program;
    pondok: Pondok;
    periodId: number;
}) {
    const form = useForm({
        registration_period_id: periodId,
        program_id: program.id,
        pondok,
        capacity: quota?.capacity ?? 0,
        is_open: quota?.is_open ?? false,
    });
    const status = quotaStatus(quota);
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                form.submit(store(), {
                    preserveScroll: true,
                    onError: () => toast.error('Kuota belum tersimpan.'),
                });
            }}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium capitalize">{pondok}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-sm tabular-nums">
                    Terpakai {quota?.used ?? 0} · Sisa {quota?.remaining ?? 0}
                </p>
                {status.reason && (
                    <p className="text-xs text-muted-foreground">
                        {status.reason}
                    </p>
                )}
            </div>
            <Field>
                <FieldLabel htmlFor={`capacity-${program.id}-${pondok}`}>
                    Kapasitas
                </FieldLabel>
                <Input
                    id={`capacity-${program.id}-${pondok}`}
                    type="number"
                    min={quota?.used ?? 0}
                    max={100000}
                    value={form.data.capacity}
                    onChange={(event) =>
                        form.setData('capacity', Number(event.target.value))
                    }
                />
                <InputError message={form.errors.capacity} />
            </Field>
            <div className="flex items-center gap-2">
                <Switch
                    id={`open-${program.id}-${pondok}`}
                    checked={form.data.is_open}
                    onCheckedChange={(value) => form.setData('is_open', value)}
                />
                <FieldLabel htmlFor={`open-${program.id}-${pondok}`}>
                    Buka pendaftaran
                </FieldLabel>
            </div>
            <InputError message={form.errors.is_open} />
            <Button type="submit" disabled={form.processing}>
                Simpan {pondok}
            </Button>
        </form>
    );
}
export default function Quotas({
    quotas,
    periods,
    programs,
    periodId,
}: FormOptions & { quotas: Quota[]; periodId: number | null }) {
    return (
        <PsbAdminPage
            title="Kuota PSB"
            description="Atur kapasitas dan ketersediaan setiap program per pondok."
        >
            <div className="max-w-sm">
                <SelectField
                    id="period"
                    label="Periode"
                    value={String(periodId ?? '')}
                    options={periods.map((period) => ({
                        value: String(period.id),
                        label: period.name,
                    }))}
                    onChange={(value) =>
                        router.get(index.url(), {
                            registration_period_id: value,
                        })
                    }
                />
            </div>
            {!periodId && (
                <EmptyState
                    bordered
                    title="Pilih atau buat periode untuk mengatur kuota"
                    action={
                        <Button type="button" asChild>
                            <Link href={periodsIndex()}>Atur periode</Link>
                        </Button>
                    }
                />
            )}
            {periodId && programs.length === 0 && (
                <EmptyState
                    bordered
                    title="Belum ada program untuk diatur kuotanya"
                    action={
                        <Button type="button" variant="outline" asChild>
                            <Link href={programsIndex()}>Tambah program</Link>
                        </Button>
                    }
                />
            )}
            {periodId &&
                programs.map((program) => (
                    <Frame key={program.id} spacing="default">
                        <FrameHeader>
                            <FrameTitle>{program.name}</FrameTitle>
                            <FrameDescription>
                                Kapasitas pendaftaran untuk pondok putra dan
                                putri.
                            </FrameDescription>
                        </FrameHeader>
                        <FramePanel className="grid gap-4 md:grid-cols-2">
                            {(['putra', 'putri'] as const).map((pondok) => (
                                <QuotaCell
                                    key={`${periodId}-${program.id}-${pondok}-${quotas.find((quota) => quota.program_id === program.id && quota.pondok === pondok)?.capacity}`}
                                    program={program}
                                    pondok={pondok}
                                    periodId={periodId}
                                    quota={quotas.find(
                                        (quota) =>
                                            quota.program_id === program.id &&
                                            quota.pondok === pondok,
                                    )}
                                />
                            ))}
                        </FramePanel>
                    </Frame>
                ))}
        </PsbAdminPage>
    );
}
