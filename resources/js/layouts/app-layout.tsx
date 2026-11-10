import { usePage } from '@inertiajs/react';
import AlumniLayout from '@/layouts/alumni-layout';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { adminBreadcrumbs } from '@/lib/admin-breadcrumbs';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const { url } = usePage();
    if (auth.user.role === 'alumni')
        return <AlumniLayout>{children}</AlumniLayout>;
    return (
        <AppLayoutTemplate
            breadcrumbs={
                breadcrumbs.length > 0 ? breadcrumbs : adminBreadcrumbs(url)
            }
        >
            {children}
        </AppLayoutTemplate>
    );
}
