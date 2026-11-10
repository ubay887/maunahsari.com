import { Head, Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { useState } from 'react';
import { ArticleCard } from '@/components/article-card';
import { ArticlePageError } from '@/components/article-page-error';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { index } from '@/routes/articles';
import { feed } from '@/routes/articles';
import type { Article, Paginated, Taxonomy } from '@/types/article';
type Filters = { search: string; category: string; tag: string };
export default function Index({
    articles,
    categories,
    tags,
    filters,
    canonical,
}: {
    articles: Paginated<Article>;
    categories: Taxonomy[];
    tags: Taxonomy[];
    filters: Filters;
    canonical: string;
}) {
    const page = useArticlePageState();
    const [search, setSearch] = useState(filters.search);
    function visit(changes: Record<string, string | number>) {
        router.get(
            index.url(),
            { ...filters, search, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    return (
        <>
            <Head title="Artikel">
                <meta
                    name="description"
                    content="Kabar, pendidikan, dan kegiatan santri serta alumni pesantren."
                />
                <link rel="canonical" href={canonical} />
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title="Feed artikel"
                    href={feed.url()}
                />
            </Head>
            <PageHeader
                size="lg"
                title="Artikel"
                description="Kabar, pendidikan, dan cerita dari pesantren."
            />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    visit({ page: 1, search });
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <Field className="min-w-0 flex-1 basis-full sm:basis-auto">
                    <FieldLabel htmlFor="public-search">
                        Cari artikel
                    </FieldLabel>
                    <Input
                        id="public-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Judul atau ringkasan…"
                    />
                </Field>
                <Field className="w-auto">
                    <FieldLabel htmlFor="public-category">Kategori</FieldLabel>
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(value) =>
                            visit({
                                page: 1,
                                category: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger id="public-category">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua kategori</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.slug}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="w-auto">
                    <FieldLabel htmlFor="public-tag">Tag</FieldLabel>
                    <Select
                        value={filters.tag || 'all'}
                        onValueChange={(value) =>
                            visit({
                                page: 1,
                                tag: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger id="public-tag">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua tag</SelectItem>
                            {tags.map((tag) => (
                                <SelectItem key={tag.id} value={tag.slug}>
                                    {tag.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Button type="submit">Cari</Button>
            </form>
            {page.error ? (
                <ArticlePageError retry={page.retry} />
            ) : articles.data.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {articles.data.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    bordered
                    title="Belum ada artikel yang sesuai"
                    action={
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                visit({
                                    page: 1,
                                    search: '',
                                    category: '',
                                    tag: '',
                                });
                            }}
                        >
                            Lihat semua artikel
                        </Button>
                    }
                />
            )}
            <nav
                aria-label="Halaman artikel"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <p className="text-xs text-muted-foreground">
                    Halaman {articles.current_page} dari {articles.last_page} ·{' '}
                    {articles.total} artikel
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={articles.current_page <= 1 || page.loading}
                        asChild={articles.current_page > 1 && !page.loading}
                    >
                        {articles.current_page > 1 && !page.loading ? (
                            <Link
                                preserveState
                                preserveScroll
                                href={index({
                                    query: {
                                        ...filters,
                                        page: articles.current_page - 1,
                                    },
                                })}
                            >
                                Sebelumnya
                            </Link>
                        ) : (
                            'Sebelumnya'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={
                            articles.current_page >= articles.last_page ||
                            page.loading
                        }
                        asChild={
                            articles.current_page < articles.last_page &&
                            !page.loading
                        }
                    >
                        {articles.current_page < articles.last_page &&
                        !page.loading ? (
                            <Link
                                preserveState
                                preserveScroll
                                href={index({
                                    query: {
                                        ...filters,
                                        page: articles.current_page + 1,
                                    },
                                })}
                            >
                                Berikutnya
                            </Link>
                        ) : (
                            'Berikutnya'
                        )}
                    </Button>
                </div>
            </nav>
        </>
    );
}
