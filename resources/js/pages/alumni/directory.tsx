import { router } from '@inertiajs/react';
import { PortalPage } from '@/components/alumni/portal-page';
import { AlumniCards } from '@/components/alumni/cards';
import { AlumniFilterBar } from '@/components/alumni/filter-bar';
import { Pager } from '@/components/portal/kit';
import { directory } from '@/routes/alumni';
import type { AlumniCard, AlumniOptions } from '@/types/alumni';
import type { Paginated } from '@/types/article';

export default function DirectoryPage({
    profiles,
    filters,
    ...options
}: AlumniOptions & {
    profiles: Paginated<AlumniCard>;
    filters: Record<string, string>;
}) {
    const visit = (next: Record<string, string>) =>
        router.get(directory.url(), next, {
            preserveState: true,
            preserveScroll: true,
        });

    return (
        <PortalPage
            title="Direktori"
            description="Cari alumni menurut angkatan dan wilayah."
        >
            <AlumniFilterBar
                filters={filters}
                options={options}
                onApply={visit}
            />
            <AlumniCards profiles={profiles.data} onEmpty={() => visit({})} />
            <Pager
                current={profiles.current_page}
                last={profiles.last_page}
                onPage={(page) => visit({ ...filters, page: String(page) })}
            />
        </PortalPage>
    );
}
