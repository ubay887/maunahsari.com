import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { IslamicPattern } from '@/components/site/islamic-pattern';
import { articleDate, readingMinutes } from '@/lib/articles';
import { images } from '@/lib/site';
import { show } from '@/routes/articles';
import type { Article } from '@/types/article';
/** Cover bermerek untuk artikel yang belum punya gambar. */
function ArticleCoverFallback() {
    return (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border-b-2 border-gold surface-forest">
            <IslamicPattern
                variant="sparse-star"
                className="pointer-events-none absolute inset-0 text-gold opacity-[0.12]"
            />
            <img
                src={images.seal}
                alt=""
                width={64}
                height={64}
                loading="lazy"
                className="relative size-16 rounded-full border border-gold/40 bg-white object-contain p-1"
            />
        </div>
    );
}
export function ArticleCard({ article }: { article: Article }) {
    return (
        <Card className="h-full">
            <Link
                href={show(article.slug)}
                tabIndex={-1}
                aria-hidden
                className="-mt-(--card-spacing) block"
            >
                {article.cover_url ? (
                    <img
                        loading="lazy"
                        src={article.cover_url}
                        alt=""
                        width={640}
                        height={360}
                        className="aspect-video w-full object-cover"
                    />
                ) : (
                    <ArticleCoverFallback />
                )}
            </Link>
            <CardHeader>
                <p className="text-xs text-muted-foreground">
                    {article.categories
                        .map((category) => category.name)
                        .join(' · ')}
                </p>
                <CardTitle className="font-display font-bold text-primary">
                    <Link href={show(article.slug)} className="hover:underline">
                        {article.title}
                    </Link>
                </CardTitle>
                <CardDescription>
                    {articleDate(article.published_at)} ·{' '}
                    {readingMinutes(article.content)} menit baca
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                    {article.excerpt ||
                        'Baca kabar selengkapnya dari pesantren.'}
                </p>
            </CardContent>
            <CardFooter className="mt-auto">
                <p className="text-xs text-muted-foreground">
                    Oleh {article.author.name}
                </p>
            </CardFooter>
        </Card>
    );
}
