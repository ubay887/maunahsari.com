import { usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    ChartNoAxesCombined,
    GraduationCap,
    Layers,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { AdminPage, type AdminNavItem } from '@/components/admin/admin-page';
import { dashboard } from '@/routes/admin/psb';
import { index as applicants } from '@/routes/admin/psb/applicants';
import { index as periods } from '@/routes/admin/psb/periods';
import { index as programs } from '@/routes/admin/psb/programs';
import { index as quotas } from '@/routes/admin/psb/quotas';
import { index as santris } from '@/routes/admin/santri';

export function PsbAdminPage({
    title,
    children,
    actions,
    description,
    module = 'psb',
}: {
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    description?: string;
    module?: 'psb' | 'santri';
}) {
    const { url } = usePage();
    const pathname = url.split('?')[0];
    const links =
        module === 'psb'
            ? ([
                  ['Ringkasan', dashboard(), ChartNoAxesCombined],
                  ['Pendaftar', applicants(), Users],
                  ['Periode', periods(), CalendarDays],
                  ['Kuota', quotas(), Layers],
                  ['Program', programs(), GraduationCap],
              ] as const)
            : ([
                  ['Daftar santri', santris(), GraduationCap],
                  ['Ringkasan PSB', dashboard(), ChartNoAxesCombined],
              ] as const);
    const nav: AdminNavItem[] = links.map(([label, route, icon]) => ({
        label,
        href: route,
        icon,
        active:
            pathname === route.url ||
            (route.url !== dashboard.url() &&
                Boolean(pathname?.startsWith(`${route.url}/`))),
    }));

    if (module === 'psb') {
        nav.push({
            label: 'Data santri',
            href: santris(),
            icon: ArrowUpRight,
            active: false,
        });
    }

    return (
        <AdminPage
            title={title}
            description={description}
            actions={actions}
            nav={nav}
            navLabel={module === 'psb' ? 'Modul PSB' : 'Modul santri'}
        >
            {children}
        </AdminPage>
    );
}
