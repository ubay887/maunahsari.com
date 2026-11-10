import type { ReactNode } from 'react';
import { ArticlePageError } from '@/components/article-page-error';
import { useArticlePageState } from '@/hooks/use-article-page-state';
export function PublicState({ children }: { children: ReactNode }) {
    const page = useArticlePageState();
    return (
        <div className="flex flex-col gap-4" aria-busy={page.loading}>
            {page.error && <ArticlePageError retry={page.retry} />} {children}
        </div>
    );
}
