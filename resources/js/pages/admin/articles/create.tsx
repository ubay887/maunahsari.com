import { AdminPage } from '@/components/admin/admin-page';
import ArticleForm from './article-form';
import type { ArticleFormProps } from '@/types/article';
export default function Create(props: ArticleFormProps) {
    return (
        <AdminPage
            title="Tulis artikel"
            description="Bagikan kabar dan kegiatan pesantren."
        >
            <ArticleForm {...props} />
        </AdminPage>
    );
}
