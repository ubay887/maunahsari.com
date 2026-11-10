import { usePage } from '@inertiajs/react';
import { LayoutDashboard, LogIn } from 'lucide-react';
import type { ReactNode } from 'react';
import SiteShell from '@/layouts/site-shell';
import type { SiteAction, SiteNavItem } from '@/layouts/site-shell';
import { dashboard, home, login } from '@/routes';
import { home as alumniHome, publicMap } from '@/routes/alumni';
import { home as psbPortal } from '@/routes/psb/portal';
import { index as articlesIndex } from '@/routes/articles';
import { index as eventsIndex } from '@/routes/events';
import { index as psbIndex } from '@/routes/psb';
import { contact, profile } from '@/routes/site';
import { putra, putri } from '@/routes/site/pondok';

const nav: SiteNavItem[] = [
    { label: 'Beranda', href: home() },
    { label: 'Profil', href: profile() },
    {
        label: 'Pondok',
        children: [
            { label: 'Pondok putra', href: putra() },
            { label: 'Pondok putri', href: putri() },
        ],
    },
    { label: 'Artikel', href: articlesIndex() },
    { label: 'Event', href: eventsIndex() },
    {
        label: 'Alumni',
        children: [
            { label: 'Sebaran alumni', href: publicMap() },
            { label: 'Portal alumni', href: alumniHome() },
        ],
    },
    { label: 'Narahubung', href: contact() },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;

    const isAdmin = auth.user?.role === 'admin';
    const isApplicant = auth.user?.role === 'applicant';

    const actions: SiteAction[] = [
        { label: 'Pendaftaran (PSB)', href: psbIndex(), variant: 'gold' },
        {
            label: !auth.user
                ? 'Masuk portal'
                : isAdmin
                  ? 'Dashboard'
                  : isApplicant
                    ? 'Portal calon santri'
                    : 'Portal alumni',
            href: !auth.user
                ? login()
                : isAdmin
                  ? dashboard()
                  : isApplicant
                    ? psbPortal()
                    : alumniHome(),
            icon: auth.user ? LayoutDashboard : LogIn,
            variant: 'ghost',
        },
    ];

    return (
        <SiteShell
            nav={nav}
            navLabel="Navigasi publik"
            actions={actions}
            footer
        >
            {children}
        </SiteShell>
    );
}
