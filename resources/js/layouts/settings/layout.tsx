import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profil', href: edit(), icon: null },
    { title: 'Keamanan', href: editSecurity(), icon: null },
    { title: 'Tampilan', href: editAppearance(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex min-w-0 flex-col gap-4 p-4">
            <PageHeader
                title="Pengaturan"
                description="Kelola profil dan keamanan akun Anda."
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
                <nav
                    aria-label="Pengaturan"
                    className="flex flex-wrap gap-1 lg:w-48 lg:shrink-0 lg:flex-col"
                >
                    {sidebarNavItems.map((item) => (
                        <Button
                            key={toUrl(item.href)}
                            variant="ghost"
                            asChild
                            className="aria-[current=page]:bg-muted lg:w-full lg:justify-start dark:aria-[current=page]:bg-muted/50"
                        >
                            <Link
                                href={item.href}
                                aria-current={
                                    isCurrentOrParentUrl(item.href)
                                        ? 'page'
                                        : undefined
                                }
                            >
                                {item.title}
                            </Link>
                        </Button>
                    ))}
                </nav>

                <div className="flex max-w-2xl min-w-0 flex-1 flex-col gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
