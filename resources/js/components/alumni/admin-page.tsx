import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AdminPage, type AdminNavItem } from '@/components/admin/admin-page';
import { alumniAdminSection, type AlumniAdminSection } from '@/lib/alumni';
import { index, create, statistics } from '@/routes/admin/alumni';
import { index as imports } from '@/routes/admin/alumni/import';

const sections: {
    key: AlumniAdminSection;
    label: string;
    route: ReturnType<typeof index>;
}[] = [
    { key: 'statistics', label: 'Statistik', route: statistics() },
    { key: 'list', label: 'Daftar alumni', route: index() },
    {
        key: 'queue',
        label: 'Antrean verifikasi',
        route: index({ query: { verification_status: 'pending' } }),
    },
    { key: 'create', label: 'Input manual', route: create() },
    { key: 'import', label: 'Impor', route: imports() },
];

export function AlumniAdminPage({
    title,
    description,
    children,
    actions,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
}) {
    const { url } = usePage();
    const current = alumniAdminSection(url);
    const nav: AdminNavItem[] = sections.map((item) => ({
        label: item.label,
        href: item.route,
        active: item.key === current,
    }));

    return (
        <AdminPage
            title={title}
            description={description}
            actions={actions}
            nav={nav}
            navLabel="Modul alumni"
        >
            {children}
        </AdminPage>
    );
}
