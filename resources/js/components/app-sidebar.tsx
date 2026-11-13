import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    BadgeCheck,
    ChartNoAxesCombined,
    GraduationCap,
    FileText,
    LayoutGrid,
    Palette,
    PanelsTopLeft,
    UserRound,
    UserRoundCog,
    Layers,
    BookOpen,
    ArrowUpRight,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import { alumniAdminSection } from '@/lib/alumni';
import {
    index as alumniIndex,
    statistics as alumniStatistics,
} from '@/routes/admin/alumni';
import { index as articlesIndex } from '@/routes/admin/articles';
import { dashboard as psbDashboard } from '@/routes/admin/psb';
import { index as applicantIndex } from '@/routes/admin/psb/applicants';
import { index as periodIndex } from '@/routes/admin/psb/periods';
import { index as quotaIndex } from '@/routes/admin/psb/quotas';
import { index as programIndex } from '@/routes/admin/psb/programs';
import { index as santriIndex } from '@/routes/admin/santri';
import { index as eventsIndex } from '@/routes/admin/events';
import { index as siteIndex } from '@/routes/admin/site';
import { index as usersIndex } from '@/routes/admin/users';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, exact: true },
];
const admissionNavItems: NavItem[] = [
    {
        title: 'Ringkasan PSB',
        href: psbDashboard(),
        icon: ClipboardList,
        exact: true,
    },
    { title: 'Pendaftar', href: applicantIndex(), icon: UserRound },
    { title: 'Periode pendaftaran', href: periodIndex(), icon: CalendarDays },
    { title: 'Kuota program', href: quotaIndex(), icon: Layers },
    { title: 'Program pendidikan', href: programIndex(), icon: BookOpen },
    { title: 'Data santri', href: santriIndex(), icon: GraduationCap },
];
const settingsNavItems: NavItem[] = [
    { title: 'Akun', href: editProfile(), icon: UserRound, exact: true },
    { title: 'Tampilan', href: editAppearance(), icon: Palette, exact: true },
];

export function AppSidebar() {
    const {
        alumniAdminAccess,
        articleAccess,
        eventAccess,
        psbAccess,
        siteAccess,
        userAdminAccess,
    } = usePage<{
        alumniAdminAccess?: { canManage: boolean };
        articleAccess?: { canWrite: boolean };
        eventAccess?: { canManage: boolean };
        psbAccess?: { canManage: boolean };
        siteAccess?: { canManage: boolean };
        userAdminAccess?: { canManage: boolean };
    }>().props;
    const { url } = usePage();
    const { setOpenMobile } = useSidebar();
    const alumniSection = alumniAdminSection(url);
    const alumniNavItems: NavItem[] = [
        {
            title: 'Statistik',
            href: alumniStatistics(),
            icon: ChartNoAxesCombined,
            isActive: alumniSection === 'statistics',
        },
        {
            title: 'Daftar alumni',
            href: alumniIndex(),
            icon: Users,
            isActive: alumniSection === 'list',
        },
        {
            title: 'Antrean verifikasi',
            href: alumniIndex({ query: { verification_status: 'pending' } }),
            icon: BadgeCheck,
            isActive: alumniSection === 'queue',
        },
    ];
    const publicationItems: NavItem[] = [
        ...(articleAccess?.canWrite
            ? [{ title: 'Artikel', href: articlesIndex(), icon: FileText }]
            : []),
        ...(eventAccess?.canManage
            ? [
                  {
                      title: 'Event',
                      href: eventsIndex(),
                      icon: CalendarDays,
                  },
              ]
            : []),
        ...(siteAccess?.canManage
            ? [
                  {
                      title: 'Pengelolaan situs',
                      href: siteIndex(),
                      icon: PanelsTopLeft,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={dashboard()}
                                prefetch
                                aria-label="Buka dashboard"
                                onClick={() => setOpenMobile(false)}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="sidebar-scrollbar overflow-x-hidden">
                <NavMain items={mainNavItems} label="Utama" />
                {alumniAdminAccess?.canManage && (
                    <NavMain items={alumniNavItems} label="Alumni" />
                )}
                {psbAccess?.canManage && (
                    <NavMain
                        items={admissionNavItems}
                        label="Penerimaan & santri"
                    />
                )}
                <NavMain items={publicationItems} label="Publikasi" />
                {userAdminAccess?.canManage && (
                    <NavMain
                        items={[
                            {
                                title: 'Pengguna',
                                href: usersIndex(),
                                icon: UserRoundCog,
                            },
                        ]}
                        label="Sistem"
                    />
                )}
                <NavMain items={settingsNavItems} label="Pengaturan" />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: 'Lihat situs publik' }}
                        >
                            <Link
                                href={home()}
                                onClick={() => setOpenMobile(false)}
                            >
                                <ArrowUpRight aria-hidden="true" />
                                <span>Lihat situs publik</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
