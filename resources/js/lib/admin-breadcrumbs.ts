import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const segmentLabels: Record<string, string> = {
    alumni: 'Alumni',
    statistik: 'Statistik',
    buat: 'Input manual',
    impor: 'Impor data',
    articles: 'Artikel',
    create: 'Tulis baru',
    taxonomies: 'Kategori & tag',
    events: 'Event',
    site: 'Pengelolaan situs',
    psb: 'Penerimaan santri',
    applicants: 'Pendaftar',
    periods: 'Periode pendaftaran',
    programs: 'Program pendidikan',
    quotas: 'Kuota program',
    santri: 'Data santri',
};

/**
 * Build breadcrumbs for an admin URL so every page shows where it sits,
 * without each page declaring its own trail.
 *
 * @return Items from Dashboard to the current page; empty outside /admin.
 */
export function adminBreadcrumbs(url: string): BreadcrumbItem[] {
    const pathname = url.split('?')[0] ?? '';
    const segments = pathname.split('/').filter(Boolean);

    if (segments[0] !== 'admin') {
        return [];
    }

    const trail: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];
    let path = '/admin';

    for (let index = 1; index < segments.length; index++) {
        const segment = segments[index];
        path += `/${segment}`;

        if (segment in segmentLabels) {
            trail.push({ title: segmentLabels[segment], href: path });
            continue;
        }

        if (segments[index + 1] === 'edit') {
            path += '/edit';
            index++;
            trail.push({ title: 'Edit', href: path });
            continue;
        }

        trail.push({ title: 'Detail', href: path });
    }

    return trail;
}
