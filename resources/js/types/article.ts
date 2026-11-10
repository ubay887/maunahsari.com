export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type Taxonomy = {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    parent?: { id: number; name: string } | null;
    articles_count?: number;
    events_count?: number;
    created_at?: string;
};
export type Article = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    cover_url: string | null;
    status: ArticleStatus;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
    views_count: number;
    created_at: string;
    updated_at: string;
    author: { id: number; name: string };
    categories: Taxonomy[];
    tags: Taxonomy[];
};
export type Paginated<T> = {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
};
export type ArticleFormProps = {
    article?: Article;
    categories: Taxonomy[];
    tags: Taxonomy[];
    canPublish: boolean;
    timezone: string;
    statuses: { value: ArticleStatus; label: string }[];
};
