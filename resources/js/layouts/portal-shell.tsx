import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { images, site } from '@/lib/site';
import { cn } from '@/lib/utils';
import { home, logout } from '@/routes';

type Href = NonNullable<ComponentProps<typeof Link>['href']>;

export type PortalNavItem = {
    label: string;
    href: Href;
    icon: LucideIcon;
    /** Aktif hanya pada alamat yang persis sama (untuk beranda portal). */
    exact?: boolean;
};

type PortalUser = { name: string; email: string };

const gridColumns: Record<number, string> = {
    2: 'grid-cols-3',
    3: 'grid-cols-4',
    4: 'grid-cols-5',
};

const tabClass =
    'flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-muted aria-[current=page]:text-primary data-[active=true]:bg-muted data-[active=true]:text-primary';

function useIsActive() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (item: PortalNavItem): boolean =>
        item.exact ? isCurrentUrl(item.href) : isCurrentOrParentUrl(item.href);
}

function Brand({ label }: { label: string }) {
    return (
        <Link
            href={home()}
            aria-label="Halaman depan"
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
            <img
                src={images.seal}
                alt=""
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-full border border-border bg-background object-contain p-0.5"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-display text-sm leading-none font-bold tracking-wide text-primary">
                    {site.name}
                </span>
                <span className="truncate text-xs leading-none text-muted-foreground">
                    {label}
                </span>
            </span>
        </Link>
    );
}

function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Ganti tema terang atau gelap"
            onClick={() =>
                updateAppearance(
                    resolvedAppearance === 'dark' ? 'light' : 'dark',
                )
            }
        >
            <Moon className="dark:hidden" aria-hidden />
            <Sun className="hidden dark:block" aria-hidden />
        </Button>
    );
}

function LogoutButton({ className }: { className?: string }) {
    return (
        <Button type="button" variant="outline" className={className} asChild>
            <Link href={logout()} as="button">
                <LogOut data-icon="inline-start" aria-hidden />
                Keluar
            </Link>
        </Button>
    );
}

function DesktopNav({
    label,
    nav,
    more,
    user,
}: {
    label: string;
    nav: PortalNavItem[];
    more: PortalNavItem[];
    user: PortalUser;
}) {
    const isActive = useIsActive();

    return (
        <nav aria-label={label} className="hidden items-center gap-1 md:flex">
            {[...nav].map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActive(item) ? 'page' : undefined}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                </Link>
            ))}
            <DropdownMenu>
                <DropdownMenuTrigger
                    data-active={more.some((item) => isActive(item))}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[active=true]:bg-muted data-[active=true]:text-foreground"
                >
                    <Menu className="size-4" aria-hidden />
                    Lainnya
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                    <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
                        <span className="truncate text-sm font-medium">
                            {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {more.map((item) => (
                        <DropdownMenuItem key={item.label} asChild>
                            <Link
                                href={item.href}
                                aria-current={
                                    isActive(item) ? 'page' : undefined
                                }
                            >
                                <item.icon aria-hidden />
                                {item.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={logout()} as="button" className="w-full">
                            <LogOut aria-hidden />
                            Keluar
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
}

function MobileMore({
    more,
    user,
    label,
}: {
    more: PortalNavItem[];
    user: PortalUser;
    label: string;
}) {
    const [open, setOpen] = useState(false);
    const isActive = useIsActive();

    return (
        <li className="min-w-0">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <button
                        type="button"
                        data-active={more.some((item) => isActive(item))}
                        className={cn(tabClass, 'w-full')}
                    >
                        <Menu className="size-5" aria-hidden />
                        Lainnya
                    </button>
                </SheetTrigger>
                <SheetContent
                    side="bottom"
                    className="max-h-[85svh] gap-0 overflow-y-auto"
                >
                    <SheetHeader>
                        <SheetTitle className="truncate pr-8">
                            {user.name}
                        </SheetTitle>
                        <SheetDescription className="truncate">
                            {user.email} · {label}
                        </SheetDescription>
                    </SheetHeader>
                    <nav
                        aria-label={`${label}, menu lainnya`}
                        className="flex flex-col gap-1 px-4 pb-4"
                    >
                        {more.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                aria-current={
                                    isActive(item) ? 'page' : undefined
                                }
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-muted aria-[current=page]:text-primary"
                            >
                                <item.icon
                                    className="size-4 text-muted-foreground"
                                    aria-hidden
                                />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <LogoutButton className="w-full" />
                    </div>
                </SheetContent>
            </Sheet>
        </li>
    );
}

function BottomNav({
    label,
    nav,
    more,
    user,
}: {
    label: string;
    nav: PortalNavItem[];
    more: PortalNavItem[];
    user: PortalUser;
}) {
    const isActive = useIsActive();

    return (
        <nav
            aria-label={`${label}, menu utama`}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden print:hidden"
        >
            <ul
                className={cn(
                    'mx-auto grid max-w-md gap-1 px-2 py-1.5',
                    gridColumns[nav.length] ?? 'grid-cols-5',
                )}
            >
                {nav.map((item) => (
                    <li key={item.label} className="min-w-0">
                        <Link
                            href={item.href}
                            aria-current={isActive(item) ? 'page' : undefined}
                            className={tabClass}
                        >
                            <item.icon className="size-5" aria-hidden />
                            <span className="max-w-full truncate">
                                {item.label}
                            </span>
                        </Link>
                    </li>
                ))}
                <MobileMore more={more} user={user} label={label} />
            </ul>
        </nav>
    );
}

/**
 * Cangkang portal calon santri dan alumni: header ringkas, menu utama di
 * bawah layar pada ponsel, dan menu horizontal di header mulai `md`.
 */
export default function PortalShell({
    label,
    nav,
    more,
    children,
}: {
    label: string;
    nav: PortalNavItem[];
    more: PortalNavItem[];
    children: ReactNode;
}) {
    const user = usePage<{ auth: { user: PortalUser } }>().props.auth.user;

    return (
        <div className="flex min-h-svh flex-col bg-background print:bg-white">
            <a
                href="#konten"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-3 focus:ring-ring/50"
            >
                Lewati ke konten
            </a>
            <header className="sticky top-0 z-30 border-b border-border bg-background print:hidden">
                <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
                    <Brand label={label} />
                    <div className="flex items-center gap-1">
                        <DesktopNav
                            label={label}
                            nav={nav}
                            more={more}
                            user={user}
                        />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main
                id="konten"
                className="mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col gap-6 px-4 py-4 pb-28 md:py-8 md:pb-10 print:p-0"
            >
                {children}
            </main>
            <BottomNav label={label} nav={nav} more={more} user={user} />
        </div>
    );
}
