import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { ArticlePageError } from '@/components/article-page-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useArticlePageState } from '@/hooks/use-article-page-state';

export type AdminNavItem = {
    label: string;
    href: ComponentProps<typeof Link>['href'];
    active: boolean;
    icon?: LucideIcon;
};

/**
 * Scaffold for every admin screen: document title, header, optional module
 * navigation (below `lg`, where the sidebar is a sheet), request error banner
 * and a busy region. Pages only supply their content.
 */
export function AdminPage({
    title,
    description,
    actions,
    nav,
    navLabel,
    children,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    nav?: AdminNavItem[];
    navLabel?: string;
    children: ReactNode;
}) {
    const page = useArticlePageState();

    return (
        <>
            <Head title={title} />
            <div className="flex min-w-0 flex-col gap-4 p-4">
                <PageHeader
                    title={title}
                    description={description}
                    actions={actions}
                />
                {nav && nav.length > 0 && (
                    <nav
                        aria-label={navLabel}
                        className="flex flex-wrap items-center gap-1 border-b border-border pb-2 lg:hidden"
                    >
                        {nav.map(({ label, href, active, icon: Icon }) => (
                            <Button
                                key={label}
                                type="button"
                                variant="ghost"
                                className="aria-[current=page]:bg-muted dark:aria-[current=page]:bg-muted/50"
                                asChild
                            >
                                <Link
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    {Icon && <Icon aria-hidden />}
                                    {label}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                )}
                {page.error && <ArticlePageError retry={page.retry} />}
                <div
                    aria-busy={page.loading}
                    className="flex min-w-0 flex-col gap-4"
                >
                    {children}
                </div>
            </div>
        </>
    );
}
