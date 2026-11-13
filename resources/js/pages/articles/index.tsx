import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { useState } from 'react';
import { ArticleCard } from '@/components/article-card';
import { ArticlePageError } from '@/components/article-page-error';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { index } from '@/routes/articles';
import { feed } from '@/routes/articles';
import type { Article, Paginated } from '@/types/article';
type Filters = { search: string };
export default function Index({
    articles,
    filters,
    canonical,
}: {
    articles: Paginated<Article>;
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
                role="search"
                onSubmit={(event) => {
                    event.preventDefault();
                    visit({ page: 1, search });
                }}
                className="flex w-full max-w-xl items-center gap-2"
            >
                <Field className="min-w-0 flex-1">
                    <FieldLabel htmlFor="public-search" className="sr-only">
                        Cari artikel
                    </FieldLabel>
                    <InputGroup>
                        <InputGroupAddon>
                            <Search aria-hidden="true" />
                        </InputGroupAddon>
                        <InputGroupInput
                            id="public-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari judul atau ringkasan…"
                        />
                        {search && (
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    size="icon-xs"
                                    aria-label="Hapus pencarian"
                                    onClick={() => {
                                        setSearch('');
                                        visit({ page: 1, search: '' });
                                    }}
                                >
                                    <X aria-hidden="true" />
                                </InputGroupButton>
                            </InputGroupAddon>
                        )}
                    </InputGroup>
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
                                visit({ page: 1, search: '' });
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
