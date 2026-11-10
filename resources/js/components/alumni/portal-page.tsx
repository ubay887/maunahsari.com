import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ArticlePageError } from '@/components/article-page-error';
import { PageHeader } from '@/components/page-header';
import { useArticlePageState } from '@/hooks/use-article-page-state';

/**
 * Scaffold for every alumni portal screen: document title, header, request
 * error banner and a busy region. The portal shell owns width and padding.
 */
export function PortalPage({
    title,
    description,
    actions,
    children,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    const page = useArticlePageState();

    return (
        <>
            <Head title={title} />
            <div className="print:hidden">
                <PageHeader
                    title={title}
                    description={description}
                    actions={actions}
                />
            </div>
            {page.error && <ArticlePageError retry={page.retry} />}
            <div
                aria-busy={page.loading}
                className="flex min-w-0 flex-col gap-4 print:gap-0"
            >
                {children}
            </div>
        </>
    );
}
