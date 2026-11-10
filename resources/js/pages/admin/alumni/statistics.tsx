import { router } from '@inertiajs/react';
import { AlumniAdminPage } from '@/components/alumni/admin-page';
import { EmptyState } from '@/components/empty-state';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';

type Statistics = {
    total: number;
    approved: number;
    pending: number;
    verified_percentage: number;
    dimensions: Record<string, { name: string; count: number }[]>;
    completeness: {
        angkatan: string;
        total: number;
        complete: number;
        percentage: number;
    }[];
};

type MeterRow = {
    key: string;
    name: string;
    value: string;
    percent: number;
};

type MeterCardData = {
    key: string;
    title: string;
    description?: string;
    emptyTitle: string;
    rows: MeterRow[];
};

const titles: Record<string, string> = {
    angkatan: 'Per angkatan',
    province_id: 'Per provinsi',
    program_id: 'Per program',
    activity_status: 'Per aktivitas',
    profession: 'Per profesi',
    map_mode: 'Pilihan peta',
    directory_visible: 'Izin direktori',
};

function MeterCard({ card }: { card: MeterCardData }) {
    const { title, description, emptyTitle, rows } = card;

    return (
        <Frame spacing="default" className="min-w-0">
            <FrameHeader>
                <FrameTitle>{title}</FrameTitle>
                {description && (
                    <FrameDescription>{description}</FrameDescription>
                )}
            </FrameHeader>
            <FramePanel className="p-0">
                {rows.length ? (
                    <div
                        role="region"
                        tabIndex={0}
                        aria-label={title}
                        className="admin-page-scroll max-h-80 overflow-y-auto overscroll-contain px-4 py-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                    >
                        <ul className="flex flex-col gap-3">
                            {rows.map((row) => (
                                <li key={row.key} className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="min-w-0 break-words">
                                            {row.name}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                            {row.value}
                                        </span>
                                    </div>
                                    <div
                                        role="meter"
                                        aria-label={row.name}
                                        aria-valuenow={Math.round(row.percent)}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuetext={row.value}
                                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                                    >
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${row.percent}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="flex min-h-48 items-center justify-center px-4">
                        <EmptyState
                            title={emptyTitle}
                            action={
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.reload()}
                                >
                                    Muat ulang
                                </Button>
                            }
                        />
                    </div>
                )}
            </FramePanel>
        </Frame>
    );
}

export default function StatisticsPage({
    statistics,
}: {
    statistics: Statistics;
}) {
    const number = (value: number) => value.toLocaleString('id-ID');
    // Longest lists first, so cards that share a row are close in height and
    // the short ones are not stretched next to a long one.
    const cards: MeterCardData[] = [
        ...Object.entries(statistics.dimensions).map(([key, rows]) => ({
            key,
            title: titles[key] ?? key,
            emptyTitle: 'Belum ada data alumni',
            rows: rows.map((row) => ({
                key: row.name,
                name: row.name,
                value: number(row.count),
                percent: statistics.total
                    ? (row.count / statistics.total) * 100
                    : 0,
            })),
        })),
        {
            key: 'completeness',
            title: 'Kelengkapan per angkatan',
            description:
                'Lengkap: data wajib, WhatsApp, profesi, bio, dan minimal satu keahlian terisi.',
            emptyTitle: 'Belum ada angkatan',
            rows: statistics.completeness.map((row) => ({
                key: row.angkatan,
                name: `Angkatan ${row.angkatan}`,
                value: `${number(row.complete)} / ${number(row.total)} profil (${row.percentage}%)`,
                percent: row.percentage,
            })),
        },
    ].sort((a, b) => b.rows.length - a.rows.length);

    return (
        <AlumniAdminPage title="Radar statistik">
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Ringkasan alumni</FrameTitle>
                </FrameHeader>
                <FramePanel className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Total alumni',
                            value: number(statistics.total),
                        },
                        {
                            label: 'Terverifikasi',
                            value: number(statistics.approved),
                        },
                        {
                            label: 'Menunggu',
                            value: number(statistics.pending),
                        },
                        {
                            label: 'Persentase terverifikasi',
                            value: `${statistics.verified_percentage}%`,
                        },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1">
                            <p className="text-2xl font-semibold tracking-tight tabular-nums">
                                {item.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </FramePanel>
            </Frame>
            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                {cards.map((card) => (
                    <MeterCard key={card.key} card={card} />
                ))}
            </div>
        </AlumniAdminPage>
    );
}
