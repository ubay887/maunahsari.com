import { Link } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/articles';
import ArticleForm from './article-form';
import type { ArticleFormProps } from '@/types/article';
export default function Edit(props: ArticleFormProps) {
    return (
        <AdminPage
            title="Edit artikel"
            description={props.article?.title}
            actions={
                props.article && (
                    <Button type="button" variant="outline" asChild>
                        <Link
                            href={show(props.article.slug, {
                                query: { preview: 1 },
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Pratinjau artikel
                        </Link>
                    </Button>
                )
            }
        >
            <ArticleForm {...props} />
        </AdminPage>
    );
}
