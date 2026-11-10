import { usePage } from '@inertiajs/react';
import {
    Home,
    Link2,
    Map,
    MessageSquare,
    Radar,
    ShieldCheck,
    UserCog,
    UserRound,
    Users,
    Database,
} from 'lucide-react';
import type { ReactNode } from 'react';
import PortalShell from '@/layouts/portal-shell';
import type { PortalNavItem } from '@/layouts/portal-shell';
import { directory, home, map, radar } from '@/routes/alumni';
import { index as claim } from '@/routes/alumni/claim';
import { index as contacts } from '@/routes/alumni/contacts';
import { index as data } from '@/routes/alumni/data';
import { edit as privacy } from '@/routes/alumni/privacy';
import { edit as profile } from '@/routes/alumni/profile';
import { edit as account } from '@/routes/profile';

export default function AlumniLayout({ children }: { children: ReactNode }) {
    const access = usePage<{
        alumniAccess: { canBrowse: boolean; hasProfile: boolean };
    }>().props.alumniAccess;

    const beranda: PortalNavItem = {
        label: 'Beranda',
        href: home(),
        icon: Home,
        exact: true,
    };
    const profil: PortalNavItem = {
        label: 'Profil',
        href: profile(),
        icon: UserRound,
    };

    const nav: PortalNavItem[] = access.canBrowse
        ? [
              beranda,
              { label: 'Radar', href: radar(), icon: Radar },
              { label: 'Direktori', href: directory(), icon: Users },
              { label: 'Kontak', href: contacts(), icon: MessageSquare },
          ]
        : [
              beranda,
              profil,
              access.hasProfile
                  ? { label: 'Privasi', href: privacy(), icon: ShieldCheck }
                  : { label: 'Klaim', href: claim(), icon: Link2 },
          ];

    const more: PortalNavItem[] = [
        ...(access.canBrowse
            ? [
                  profil,
                  { label: 'Peta alumni', href: map(), icon: Map },
                  { label: 'Privasi', href: privacy(), icon: ShieldCheck },
              ]
            : []),
        { label: 'Data saya', href: data(), icon: Database },
        { label: 'Akun saya', href: account(), icon: UserCog },
    ];

    return (
        <PortalShell label="Portal alumni" nav={nav} more={more}>
            {children}
        </PortalShell>
    );
}
