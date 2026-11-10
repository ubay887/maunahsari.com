import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { DataGridResetButton } from '@/components/admin/data-grid-filters';
import { AlumniCards } from '@/components/alumni/cards';
import { AggregatePanel } from '@/components/alumni/map-panels';
import { PortalPage } from '@/components/alumni/portal-page';
import { Pager } from '@/components/portal/kit';
import { RegionMap, type TileConfig } from '@/components/alumni/region-map';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { SelectField } from '@/components/select-field';
import { Button } from '@/components/ui/button';
import { alumniLabels } from '@/lib/alumni';
import { sameRegion, summarizeGroups } from '@/lib/alumni-map';
import { login } from '@/routes';
import { map, publicMap } from '@/routes/alumni';
import type {
    AlumniCard,
    AlumniOptions,
    MapData,
    MapGroup,
} from '@/types/alumni';
import type { Paginated } from '@/types/article';

export type MapProps = AlumniOptions & {
    aggregate: MapData;
    members: Paginated<AlumniCard> | null;
    angkatanOptions: string[];
    filters: Record<string, string>;
    member: boolean;
    tiles: TileConfig;
};

const REGION_RESET = { region_id: '', region_level: '', page: '' };
const ACTIVITIES = ['bekerja', 'wirausaha', 'studi', 'mengabdi', 'lainnya'];

export function AlumniMapView({
    aggregate,
    members,
    angkatanOptions,
    filters,
    member,
    tiles,
}: MapProps) {
    const route = member ? map : publicMap;
    const isGuest = !usePage().props.auth?.user;
    const [loading, setLoading] = useState(false);

    const visit = useCallback(
        (next: Record<string, string>) =>
            router.get(
                route.url(),
                Object.fromEntries(
                    Object.entries(next).filter(([, value]) => value !== ''),
                ),
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['aggregate', 'members', 'filters'],
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                },
            ),
        [route],
    );
    const change = useCallback(
        (patch: Record<string, string>) =>
            visit({ ...filters, ...REGION_RESET, ...patch }),
        [filters, visit],
    );
    const reset = useCallback(() => visit({}), [visit]);
    const select = useCallback(
        (group: MapGroup) =>
            visit({
                ...filters,
                region_id: String(group.id),
                region_level: group.level,
                page: '',
            }),
        [filters, visit],
    );

    const selected =
        aggregate.groups.find((group) =>
            sameRegion(group, filters.region_id, filters.region_level),
        ) ?? null;
    const summary = summarizeGroups(aggregate.groups, aggregate.total);
    const hasFilter = Object.keys(filters).some(
        (key) => key !== 'page' && filters[key] !== '',
    );

    return (
        <PortalPage
            title="Peta"
            description="Jumlah alumni per kota atau kabupaten, tanpa identitas."
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="grid min-w-0 grow gap-3 sm:grid-cols-3">
                    <SelectField
                        label="Angkatan"
                        value={filters.angkatan || 'all'}
                        onChange={(value) =>
                            change({ angkatan: value === 'all' ? '' : value })
                        }
                        options={[
                            { value: 'all', label: 'Semua angkatan' },
                            ...angkatanOptions.map((value) => ({
                                value,
                                label: value,
                            })),
                        ]}
                    />
                    <SelectField
                        label="Pondok"
                        value={filters.pondok || 'all'}
                        onChange={(value) =>
                            change({ pondok: value === 'all' ? '' : value })
                        }
                        options={[
                            { value: 'all', label: 'Semua pondok' },
                            { value: 'putra', label: 'Putra' },
                            { value: 'putri', label: 'Putri' },
                        ]}
                    />
                    <SelectField
                        label="Aktivitas"
                        value={filters.activity_status || 'all'}
                        onChange={(value) =>
                            change({
                                activity_status: value === 'all' ? '' : value,
                            })
                        }
                        options={[
                            { value: 'all', label: 'Semua aktivitas' },
                            ...ACTIVITIES.map((value) => ({
                                value,
                                label: alumniLabels[value] ?? value,
                            })),
                        ]}
                    />
                </div>
                <DataGridResetButton active={hasFilter} onReset={reset} />
            </div>

            <div
                aria-busy={loading}
                className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
            >
                <Frame spacing="sm">
                    <FrameHeader>
                        <FrameTitle>Peta wilayah</FrameTitle>
                        <FrameDescription>
                            {summary.total} alumni di {summary.regions}{' '}
                            kota/kabupaten, {summary.provinces} provinsi
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel>
                        <RegionMap
                            groups={aggregate.groups}
                            tiles={tiles}
                            selected={selected}
                            onSelect={select}
                        />
                    </FramePanel>
                </Frame>
                <Frame spacing="sm">
                    <FrameHeader>
                        <FrameTitle>Ringkasan agregat</FrameTitle>
                        <FrameDescription>
                            Pilih wilayah untuk menandainya di peta.
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel>
                        <AggregatePanel
                            aggregate={aggregate}
                            filters={filters}
                            loading={loading}
                            onSelect={select}
                            onReset={reset}
                        />
                    </FramePanel>
                </Frame>
            </div>

            {selected && (
                <Frame spacing="sm">
                    <FrameHeader>
                        <FrameTitle>{selected.name}</FrameTitle>
                        <FrameDescription>
                            {selected.label} alumni tercatat
                            {selected.province ? ` · ${selected.province}` : ''}
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel className="flex flex-wrap items-center justify-between gap-3">
                        <p className="min-w-0 text-sm text-muted-foreground">
                            {member
                                ? 'Jumlah mencakup semua alumni terverifikasi di wilayah ini. Di bawah hanya alumni yang mengizinkan profilnya tampil.'
                                : 'Peta publik hanya menampilkan jumlah per wilayah. Profil alumni hanya untuk alumni terverifikasi.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {isGuest && !member && (
                                <Button asChild>
                                    <Link href={login()}>
                                        Masuk sebagai alumni
                                    </Link>
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => change({})}
                            >
                                Hapus pilihan wilayah
                            </Button>
                        </div>
                    </FramePanel>
                </Frame>
            )}

            {member && members && selected && (
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Alumni di {selected.name}
                    </h2>
                    <AlumniCards profiles={members.data} onEmpty={reset} />
                    <Pager
                        current={members.current_page}
                        last={members.last_page}
                        onPage={(page) =>
                            visit({ ...filters, page: String(page) })
                        }
                    />
                </section>
            )}
        </PortalPage>
    );
}
