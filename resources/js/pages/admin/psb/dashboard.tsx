import { Link, router } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import { ArrowRight, Plus } from 'lucide-react';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { SelectField } from '@/components/select-field';
import { StatusBadge } from '@/components/psb/status-badge';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
    FrameDescription,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { statusLabels } from '@/lib/psb';
import { dashboard } from '@/routes/admin/psb';
import { index as quotaIndex } from '@/routes/admin/psb/quotas';
import { index as periodIndex } from '@/routes/admin/psb/periods';
import { index as applicants, create } from '@/routes/admin/psb/applicants';
import type { ApplicantStatus, Period, Quota } from '@/types/psb';
export default function Dashboard({
    counts,
    quotas,
    periods,
    periodId,
}: {
    counts: Record<ApplicantStatus, number>;
    quotas: Quota[];
    periods: Period[];
    periodId: number | null;
}) {
    return (
        <PsbAdminPage
            title="Ringkasan PSB"
            description="Pantau pendaftaran dan ketersediaan kuota per periode."
            actions={
                <Button type="button" asChild>
                    <Link href={create()}>
                        <Plus aria-hidden="true" />
                        Tambah pendaftar
                    </Link>
                </Button>
            }
        >
            <div className="w-full sm:max-w-sm">
                <SelectField
                    id="period"
                    label="Periode"
                    value={String(periodId ?? '')}
                    options={periods.map((period) => ({
                        value: String(period.id),
                        label: period.name,
                    }))}
                    onChange={(value) =>
                        router.get(dashboard.url(), {
                            registration_period_id: value,
                        })
                    }
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {Object.entries(statusLabels).map(([key, label]) => (
                    <Frame key={key} spacing="default">
                        <FramePanel className="flex flex-col items-start gap-3">
                            <StatusBadge status={key as ApplicantStatus} />
                            <span className="text-2xl font-semibold tracking-tight tabular-nums">
                                {counts[key as ApplicantStatus].toLocaleString(
                                    'id-ID',
                                )}
                            </span>
                            <Link
                                href={applicants({
                                    query: {
                                        registration_period_id: periodId,
                                        status: key,
                                    },
                                })}
                                aria-label={`Lihat pendaftar: ${label}`}
                                className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
                            >
                                Lihat pendaftar
                                <ArrowRight aria-hidden="true" />
                            </Link>
                        </FramePanel>
                    </Frame>
                ))}
            </div>
            <Frame spacing="default">
                <FrameHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                        <FrameTitle>Ketersediaan kuota</FrameTitle>
                        <FrameDescription>
                            Jumlah tempat tersisa per program dan pondok.
                        </FrameDescription>
                    </div>
                    <Button type="button" variant="outline" asChild>
                        <Link
                            href={quotaIndex({
                                query: { registration_period_id: periodId },
                            })}
                        >
                            Kelola kuota
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                </FrameHeader>
                <FramePanel>
                    <div className="grid gap-x-4 md:grid-cols-2">
                        {quotas.map((quota) => (
                            <div
                                key={quota.id}
                                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
                            >
                                <div className="flex min-w-0 flex-col gap-1">
                                    <span className="font-medium break-words">
                                        {quota.program.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        Pondok {quota.pondok}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge
                                        variant={
                                            !quota.is_open
                                                ? 'destructive-light'
                                                : quota.remaining > 0
                                                  ? 'success-light'
                                                  : 'warning-light'
                                        }
                                    >
                                        {!quota.is_open
                                            ? 'Ditutup'
                                            : quota.remaining > 0
                                              ? 'Tersedia'
                                              : 'Penuh'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {quota.remaining} dari {quota.capacity}{' '}
                                        tempat tersisa
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {quotas.length === 0 && (
                        <EmptyState
                            title="Belum ada kuota untuk periode ini"
                            action={
                                <Button type="button" variant="outline" asChild>
                                    <Link href={periodIndex()}>
                                        Atur periode
                                    </Link>
                                </Button>
                            }
                        />
                    )}
                </FramePanel>
            </Frame>
        </PsbAdminPage>
    );
}
