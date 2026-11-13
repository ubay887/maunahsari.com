import { Head, Link } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ArticleCard } from '@/components/article-card';
import { ArticleContent } from '@/components/article-content';
import { ArticlePageError } from '@/components/article-page-error';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { articleDate, readingMinutes } from '@/lib/articles';
import { home } from '@/routes';
import { index } from '@/routes/articles';
import type { Article } from '@/types/article';
export default function Show({
    article,
    related,
    canonical,
    description,
    shareUrl,
    preview,
}: {
    article: Article;
    related: Article[];
    canonical: string;
    description: string;
    shareUrl: string;
    preview: boolean;
}) {
    const page = useArticlePageState();
    const title = article.meta_title || article.title;
    return (
        <>
            <Head title={title}>
                <meta
                    head-key="description"
                    name="description"
                    content={description}
                />
                <link head-key="canonical" rel="canonical" href={canonical} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonical} />
                {article.cover_url && (
                    <meta property="og:image" content={article.cover_url} />
                )}
                <meta
                    name="twitter:card"
                    content={
                        article.cover_url ? 'summary_large_image' : 'summary'
                    }
                />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                {article.cover_url && (
                    <meta name="twitter:image" content={article.cover_url} />
                )}
                {preview && <meta name="robots" content="noindex,nofollow" />}
            </Head>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={home()}>Beranda</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={index()}>Artikel</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{article.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {preview && (
                <Alert variant="warning">
                    <AlertTitle>Pratinjau</AlertTitle>
                    <AlertDescription>
                        Artikel ini sedang ditinjau. Pratinjau tidak menambah
                        jumlah tayangan.
                    </AlertDescription>
                </Alert>
            )}
            {page.error && <ArticlePageError retry={page.retry} />}
            <article className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4">
                <header className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {article.categories.map((category) => (
                            <Badge variant="outline" key={category.id}>
                                {category.name}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
                        {article.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Oleh {article.author.name} ·{' '}
                        {articleDate(article.published_at)} ·{' '}
                        {readingMinutes(article.content)} menit baca
                    </p>
                    {article.excerpt && (
                        <p className="text-sm text-muted-foreground">
                            {article.excerpt}
                        </p>
                    )}
                </header>
                {article.cover_url && (
                    <img
                        src={article.cover_url}
                        alt={article.title}
                        className="aspect-video w-full object-cover"
                    />
                )}
                <ArticleContent html={article.content} />
                <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                        <Badge variant="outline" key={tag.id}>
                            #{tag.name}
                        </Badge>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" asChild>
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Share2 aria-hidden />
                            WhatsApp
                        </a>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            void navigator.clipboard
                                .writeText(canonical)
                                .then(() => toast.success('Tautan disalin.'))
                                .catch(() =>
                                    toast.error('Tautan belum dapat disalin.'),
                                );
                        }}
                    >
                        <Copy aria-hidden />
                        Salin tautan
                    </Button>
                </div>
            </article>
            <section
                className="flex flex-col gap-4"
                aria-label="Artikel terkait"
            >
                <h2 className="text-xl font-semibold tracking-tight">
                    Artikel terkait
                </h2>
                {related.length ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {related.map((item) => (
                            <ArticleCard key={item.id} article={item} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        bordered
                        title="Belum ada artikel terkait"
                        action={
                            <Button type="button" variant="outline" asChild>
                                <Link href={index()}>Jelajahi artikel</Link>
                            </Button>
                        }
                    />
                )}
            </section>
        </>
    );
}
