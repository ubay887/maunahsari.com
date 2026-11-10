import { router } from '@inertiajs/react';
import { PortalPage } from '@/components/alumni/portal-page';
import { Alert, AlertDescription } from '@/components/reui/alert';
import { AlumniCards } from '@/components/alumni/cards';
import { AlumniFilterBar } from '@/components/alumni/filter-bar';
import { SelectField } from '@/components/select-field';
import { Pager } from '@/components/portal/kit';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
} from '@/components/reui/frame';
import { radar } from '@/routes/alumni';
import type { AlumniCard, AlumniOptions } from '@/types/alumni';
import type { Paginated } from '@/types/article';
export default function RadarPage({
    profiles,
    filters,
    coordinatesAvailable,
    ...options
}: AlumniOptions & {
    profiles: Paginated<AlumniCard>;
    filters: Record<string, string>;
    coordinatesAvailable: boolean;
}) {
    const visit = (next: Record<string, string>) =>
        router.get(radar.url(), next, {
            preserveState: true,
            preserveScroll: true,
        });
    return (
        <PortalPage
            title="Radar"
            description="Alumni di sekitar wilayah yang Anda pilih."
        >
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Wilayah dan radius</FrameTitle>
                </FrameHeader>
                <FramePanel className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Pusat pencarian"
                        value={filters.regency_id ?? ''}
                        onChange={(value) =>
                            visit({ ...filters, regency_id: value, page: '1' })
                        }
                        options={options.regencies.map((item) => ({
                            value: String(item.id),
                            label: item.name,
                        }))}
                    />
                    <SelectField
                        label="Radius"
                        value={filters.radius ?? '25'}
                        onChange={(value) =>
                            visit({ ...filters, radius: value, page: '1' })
                        }
                        options={[25, 50, 100].map((value) => ({
                            value: String(value),
                            label: `Dalam ${value} km`,
                        }))}
                    />
                </FramePanel>
            </Frame>
            <AlumniFilterBar
                radarMode
                filters={filters}
                options={options}
                onApply={(next) =>
                    visit({
                        ...next,
                        regency_id: filters.regency_id ?? '',
                        radius: filters.radius ?? '25',
                    })
                }
            />
            {!coordinatesAvailable && (
                <Alert variant="warning" role="status">
                    <AlertDescription>
                        Koordinat pusat wilayah belum tersedia. Pilih wilayah
                        lain.
                    </AlertDescription>
                </Alert>
            )}
            <AlumniCards
                profiles={profiles.data}
                onEmpty={() =>
                    visit({
                        regency_id: filters.regency_id ?? '',
                        radius: filters.radius ?? '25',
                    })
                }
            />
            <Pager
                current={profiles.current_page}
                last={profiles.last_page}
                onPage={(page) => visit({ ...filters, page: String(page) })}
            />
        </PortalPage>
    );
}
