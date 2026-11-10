import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, MapPin, Menu, Moon, Phone, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { cn, toUrl } from '@/lib/utils';
import { images, site } from '@/lib/site';
import { home } from '@/routes';
import { home as alumniHome, publicMap } from '@/routes/alumni';
import { index as articlesIndex } from '@/routes/articles';
import { index as eventsIndex } from '@/routes/events';
import { index as psbIndex } from '@/routes/psb';
import { contact, profile } from '@/routes/site';
import { putra, putri } from '@/routes/site/pondok';

type Href = NonNullable<ComponentProps<typeof Link>['href']>;

export type SiteNavLink = { label: string; href: Href };

export type SiteNavItem =
    | { label: string; href: Href; children?: undefined }
    | { label: string; href?: undefined; children: SiteNavLink[] };

export type SiteAction = {
    label: string;
    href: Href;
    variant?: 'gold' | 'outline' | 'ghost';
    icon?: LucideIcon;
    asButton?: boolean;
};

/** Halaman yang header-nya menumpang di atas hero hijau. */
const HERO_PAGES = ['welcome'];

function isActive(pathname: string, href: Href): boolean {
    const url = toUrl(href).split('?')[0];

    return pathname === url || (url !== '/' && pathname.startsWith(`${url}/`));
}

function Brand({ overHero }: { overHero: boolean }) {
    return (
        <Link
            href={home()}
            aria-label="Halaman depan"
            className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
            <img
                src={images.seal}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full border border-border bg-background object-contain p-0.5"
            />
            <span className="flex min-w-0 flex-col gap-1">
                <span
                    className={cn(
                        'truncate font-display text-base leading-none font-bold tracking-wide',
                        overHero ? 'text-white' : 'text-primary',
                    )}
                >
                    {site.name}
                </span>
                <span
                    className={cn(
                        'truncate text-[0.6875rem] leading-none font-medium tracking-wide uppercase',
                        overHero ? 'text-gold' : 'text-gold-foreground',
                    )}
                >
                    <span className="hidden sm:inline">{site.tagline}</span>
                    <span className="sm:hidden">Kota Kediri</span>
                </span>
            </span>
        </Link>
    );
}

function navLinkClass(overHero: boolean) {
    return cn(
        'relative inline-flex items-center gap-1 rounded-md px-1 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gold after:opacity-0 after:content-[""]',
        'aria-[current=page]:after:opacity-100 data-[active=true]:after:opacity-100',
        overHero
            ? 'text-white/75 hover:text-white aria-[current=page]:text-white data-[active=true]:text-white'
            : 'text-muted-foreground hover:text-primary aria-[current=page]:text-primary data-[active=true]:text-primary',
    );
}

function DesktopNav({
    nav,
    navLabel,
    pathname,
    overHero,
}: {
    nav: SiteNavItem[];
    navLabel: string;
    pathname: string;
    overHero: boolean;
}) {
    return (
        <nav
            aria-label={navLabel}
            className="hidden items-center gap-3 xl:flex 2xl:gap-4"
        >
            {nav.map((item) => {
                if (item.children) {
                    const active = item.children.some((child) =>
                        isActive(pathname, child.href),
                    );

                    return (
                        <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger
                                data-active={active}
                                className={cn(navLinkClass(overHero), 'group')}
                            >
                                {item.label}
                                <ChevronDown
                                    aria-hidden
                                    className="size-4 transition-transform group-data-[state=open]:rotate-180"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-44">
                                {item.children.map((child) => (
                                    <DropdownMenuItem key={child.label} asChild>
                                        <Link
                                            href={child.href}
                                            aria-current={
                                                isActive(pathname, child.href)
                                                    ? 'page'
                                                    : undefined
                                            }
                                            className="aria-[current=page]:font-semibold aria-[current=page]:text-primary"
                                        >
                                            {child.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        aria-current={
                            isActive(pathname, item.href) ? 'page' : undefined
                        }
                        className={navLinkClass(overHero)}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

function ActionButton({
    action,
    overHero,
    className,
    onNavigate,
}: {
    action: SiteAction;
    overHero: boolean;
    className?: string;
    onNavigate?: () => void;
}) {
    const variant = action.variant ?? 'outline';
    const Icon = action.icon;

    return (
        <Button
            type="button"
            variant={variant}
            size="lg"
            className={cn(
                variant === 'outline' &&
                    overHero &&
                    'border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white dark:bg-white/5 dark:hover:bg-white/10',
                variant === 'ghost' &&
                    overHero &&
                    'text-white hover:bg-white/10 hover:text-white dark:hover:bg-white/10',
                className,
            )}
            asChild
        >
            <Link
                href={action.href}
                as={action.asButton ? 'button' : 'a'}
                onClick={onNavigate}
            >
                {Icon && <Icon data-icon="inline-start" aria-hidden />}
                {action.label}
            </Link>
        </Button>
    );
}

function ThemeToggle({ overHero }: { overHero: boolean }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const dark = resolvedAppearance === 'dark';

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={dark ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
            onClick={() => updateAppearance(dark ? 'light' : 'dark')}
            className={cn(
                overHero &&
                    'text-white hover:bg-white/10 hover:text-white dark:hover:bg-white/10',
            )}
        >
            {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
        </Button>
    );
}

function MobileNav({
    nav,
    navLabel,
    actions,
    pathname,
    overHero,
}: {
    nav: SiteNavItem[];
    navLabel: string;
    actions: SiteAction[];
    pathname: string;
    overHero: boolean;
}) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const featuredActions = actions.filter(
        (action) => action.variant === 'gold',
    );
    const otherActions = actions.filter((action) => action.variant !== 'gold');

    const itemClass =
        'flex rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:border-gold aria-[current=page]:bg-muted aria-[current=page]:text-primary';

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Buka menu"
                    className={cn(
                        'xl:hidden',
                        overHero &&
                            'text-white hover:bg-white/10 hover:text-white dark:hover:bg-white/10',
                    )}
                >
                    <Menu aria-hidden />
                </Button>
            </SheetTrigger>
            <SheetContent className="gap-0 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="font-display text-primary">
                        {site.name}
                    </SheetTitle>
                    <SheetDescription>{navLabel}</SheetDescription>
                </SheetHeader>
                {featuredActions.length > 0 && (
                    <div className="flex flex-col gap-2 px-4 pb-4">
                        {featuredActions.map((action) => (
                            <ActionButton
                                key={action.label}
                                action={action}
                                overHero={false}
                                onNavigate={close}
                                className="w-full"
                            />
                        ))}
                    </div>
                )}
                <nav
                    aria-label={navLabel}
                    className="flex flex-col gap-1 px-4 pb-4"
                >
                    {nav.map((item) =>
                        item.children ? (
                            <div
                                key={item.label}
                                className="flex flex-col gap-1"
                            >
                                <span className="px-3 pt-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {item.label}
                                </span>
                                {item.children.map((child) => (
                                    <Link
                                        key={child.label}
                                        href={child.href}
                                        onClick={close}
                                        aria-current={
                                            isActive(pathname, child.href)
                                                ? 'page'
                                                : undefined
                                        }
                                        className={cn(itemClass, 'ml-3')}
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={close}
                                aria-current={
                                    isActive(pathname, item.href)
                                        ? 'page'
                                        : undefined
                                }
                                className={itemClass}
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                </nav>
                {otherActions.length > 0 && (
                    <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                        {otherActions.map((action) => (
                            <ActionButton
                                key={action.label}
                                action={action}
                                overHero={false}
                                onNavigate={close}
                                className="w-full"
                            />
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function SiteFooter() {
    const links: { label: string; href: Href }[] = [
        { label: 'Beranda', href: home() },
        { label: 'Profil pesantren', href: profile() },
        { label: 'Pondok putra', href: putra() },
        { label: 'Pondok putri', href: putri() },
        { label: 'Pendaftaran (PSB)', href: psbIndex() },
        { label: 'Artikel', href: articlesIndex() },
        { label: 'Event', href: eventsIndex() },
        { label: 'Sebaran alumni', href: publicMap() },
        { label: 'Portal alumni', href: alumniHome() },
        { label: 'Narahubung', href: contact() },
    ];

    return (
        <footer className="border-t-4 border-gold surface-forest">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-12">
                <div className="flex flex-col gap-4 md:col-span-5">
                    <div className="flex items-center gap-3">
                        <img
                            src={images.seal}
                            alt=""
                            width={56}
                            height={56}
                            className="size-14 rounded-full border border-gold/30 bg-white object-contain p-1"
                        />
                        <div className="flex flex-col">
                            <span className="font-display text-lg leading-none font-bold tracking-wide text-white">
                                {site.name}
                            </span>
                            <span className="mt-1.5 text-xs font-semibold tracking-wider text-gold uppercase">
                                Pesantren Tahfidhul Qur'an
                            </span>
                        </div>
                    </div>
                    <p className="max-w-sm text-sm text-white/70">
                        {site.affiliation}
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:col-span-4">
                    <h2 className="text-xs font-bold tracking-widest text-gold uppercase">
                        Akses cepat
                    </h2>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="text-white/75 transition-colors hover:text-gold hover:underline"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-3 md:col-span-3">
                    <h2 className="text-xs font-bold tracking-widest text-gold uppercase">
                        Sekretariat
                    </h2>
                    <ul className="flex flex-col gap-2.5 text-sm text-white/75">
                        <li className="flex items-start gap-2.5">
                            <MapPin
                                aria-hidden
                                className="mt-0.5 size-4 shrink-0 text-gold"
                            />
                            <span>{site.address}</span>
                        </li>
                        {site.contacts.map((contactInfo) => (
                            <li
                                key={contactInfo.role}
                                className="flex items-center gap-2.5"
                            >
                                <Phone
                                    aria-hidden
                                    className="size-4 shrink-0 text-gold"
                                />
                                <a
                                    href={contactInfo.href}
                                    className="transition-colors hover:text-gold hover:underline"
                                >
                                    {contactInfo.phone} (
                                    {contactInfo.role.replace('Kantor ', '')})
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 bg-black/25">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/55 md:flex-row">
                    <span>
                        &copy; {new Date().getFullYear()} {site.name}. Hak cipta
                        dilindungi.
                    </span>
                    <span>Untuk para huffadh Al-Qur'an</span>
                </div>
            </div>
        </footer>
    );
}

/**
 * Cangkang bersama situs publik dan portal alumni: satu header, satu lebar
 * konten, satu ukuran teks. Di beranda, header menumpang di atas hero hijau
 * dan konten dibiarkan selebar layar agar halaman mengatur bagiannya sendiri.
 */
export default function SiteShell({
    nav,
    navLabel,
    actions = [],
    footer = false,
    children,
}: {
    nav: SiteNavItem[];
    navLabel: string;
    actions?: SiteAction[];
    footer?: boolean;
    children: ReactNode;
}) {
    const { url, component } = usePage();
    const pathname = url.split('?')[0];
    const overHero = HERO_PAGES.includes(component);

    return (
        <div className="flex min-h-screen flex-col bg-background text-sm text-foreground">
            <a
                href="#konten-utama"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:ring-3 focus:ring-ring/50 focus:outline-none"
            >
                Lompat ke konten
            </a>
            <header
                className={cn(
                    'z-40 w-full',
                    overHero
                        ? 'absolute inset-x-0 top-0'
                        : 'sticky top-0 border-b border-border bg-background/85 backdrop-blur-md',
                )}
            >
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
                    <Brand overHero={overHero} />
                    <div className="flex shrink-0 items-center gap-2 xl:gap-4">
                        <DesktopNav
                            nav={nav}
                            navLabel={navLabel}
                            pathname={pathname}
                            overHero={overHero}
                        />
                        <span
                            aria-hidden
                            className={cn(
                                'hidden h-6 w-px xl:block',
                                overHero ? 'bg-white/25' : 'bg-border',
                            )}
                        />
                        <div className="hidden items-center gap-2 xl:flex">
                            {actions.map((action) => (
                                <ActionButton
                                    key={action.label}
                                    action={action}
                                    overHero={overHero}
                                />
                            ))}
                        </div>
                        <ThemeToggle overHero={overHero} />
                        <MobileNav
                            nav={nav}
                            navLabel={navLabel}
                            actions={actions}
                            pathname={pathname}
                            overHero={overHero}
                        />
                    </div>
                </div>
            </header>
            {overHero ? (
                <main
                    id="konten-utama"
                    tabIndex={-1}
                    className="flex min-w-0 flex-1 flex-col outline-none"
                >
                    {children}
                </main>
            ) : (
                <main
                    id="konten-utama"
                    tabIndex={-1}
                    className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-4 p-4 outline-none"
                >
                    {children}
                </main>
            )}
            {footer && <SiteFooter />}
        </div>
    );
}
