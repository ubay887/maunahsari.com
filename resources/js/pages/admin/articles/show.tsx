import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { DetailList } from '@/components/admin/detail-list';
import { ArticleContent } from '@/components/article-content';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { articleStatusLabels } from '@/lib/articles';
import { formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { edit, index } from '@/routes/admin/articles';
import { show as publicShow } from '@/routes/articles';
import type { Article } from '@/types/article';

const statusVariants = {
    draft: 'secondary',
    published: 'success-light',
    scheduled: 'warning-light',
    archived: 'outline',
} as const;

export default function Show({
    article,
    canUpdate,
}: {
    article: Article;
    canUpdate: boolean;
    canPublish: boolean;
}) {
    return (
        <AdminPage
            title={article.title}
            description={article.excerpt ?? undefined}
            actions={
                <>
                    <Button type="button" variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft aria-hidden />
                            Daftar artikel
                        </Link>
                    </Button>
                    {article.status === 'published' && (
                        <Button type="button" variant="outline" asChild>
                            <a
                                href={publicShow.url(article.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink aria-hidden />
                                Lihat di situs
                            </a>
                        </Button>
                    )}
                    {canUpdate && (
                        <Button type="button" asChild>
                            <Link href={edit(article.id)}>
                                <Pencil aria-hidden />
                                Edit
                            </Link>
                        </Button>
                    )}
                </>
            }
        >
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Isi artikel</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            {article.cover_url && (
                                <img
                                    src={article.cover_url}
                                    alt=""
                                    className="aspect-video w-full object-cover"
                                />
                            )}
                            {article.content ? (
                                <ArticleContent html={article.content} />
                            ) : (
                                <EmptyState title="Artikel belum memiliki isi" />
                            )}
                        </FramePanel>
                    </Frame>
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Informasi</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: 'Status',
                                        value: (
                                            <Badge
                                                variant={
                                                    statusVariants[
                                                        article.status
                                                    ]
                                                }
                                            >
                                                {
                                                    articleStatusLabels[
                                                        article.status
                                                    ]
                                                }
                                            </Badge>
                                        ),
                                    },
                                    {
                                        label: 'Penulis',
                                        value: article.author.name,
                                    },
                                    {
                                        label: 'Kategori',
                                        value: article.categories
                                            .map((item) => item.name)
                                            .join(', '),
                                    },
                                    {
                                        label: 'Tag',
                                        value: article.tags
                                            .map((item) => item.name)
                                            .join(', '),
                                    },
                                    {
                                        label: 'Tanggal terbit',
                                        value: formatDate(article.published_at),
                                    },
                                    {
                                        label: 'Tayangan',
                                        value: formatNumber(
                                            article.views_count,
                                        ),
                                    },
                                    { label: 'Slug', value: article.slug },
                                    {
                                        label: 'Dibuat',
                                        value: formatDateTime(
                                            article.created_at,
                                        ),
                                    },
                                    {
                                        label: 'Diperbarui',
                                        value: formatDateTime(
                                            article.updated_at,
                                        ),
                                    },
                                ]}
                            />
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Mesin pencari</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: 'Judul meta',
                                        value: article.meta_title,
                                    },
                                    {
                                        label: 'Deskripsi meta',
                                        value: article.meta_description,
                                    },
                                ]}
                            />
                        </FramePanel>
                    </Frame>
                </div>
            </div>
        </AdminPage>
    );
}
