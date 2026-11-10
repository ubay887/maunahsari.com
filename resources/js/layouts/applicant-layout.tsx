import {
    FileText,
    Home,
    ReceiptText,
    UserRound,
    UserCog,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import PortalShell from '@/layouts/portal-shell';
import type { PortalNavItem } from '@/layouts/portal-shell';
import { home, receipt } from '@/routes/psb/portal';
import { index as documents } from '@/routes/psb/portal/documents';
import { index as payments } from '@/routes/psb/portal/payments';
import { edit as profile } from '@/routes/psb/portal/profile';
import { edit as account } from '@/routes/profile';

const nav: PortalNavItem[] = [
    { label: 'Beranda', href: home(), icon: Home, exact: true },
    { label: 'Data', href: profile(), icon: UserRound },
    { label: 'Berkas', href: documents(), icon: FileText },
    { label: 'Biaya', href: payments(), icon: Wallet },
];

const more: PortalNavItem[] = [
    { label: 'Bukti pendaftaran', href: receipt(), icon: ReceiptText },
    { label: 'Akun saya', href: account(), icon: UserCog },
];

export default function ApplicantLayout({ children }: { children: ReactNode }) {
    return (
        <PortalShell label="Portal calon santri" nav={nav} more={more}>
            {children}
        </PortalShell>
    );
}
