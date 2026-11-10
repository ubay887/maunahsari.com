import { Link } from '@inertiajs/react';
import { ExternalLink, Pencil } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import { edit } from '@/routes/admin/site';
import type { SitePageSummary } from '@/types/site';

export default function Index({ pages }: { pages: SitePageSummary[] }) {
    return (
        <AdminPage
            title="Pengelolaan situs"
            description="Ubah isi halaman publik tanpa perlu deploy."
        >
            <Frame>
                <FrameHeader>
                    <FrameTitle>Halaman situs</FrameTitle>
                    <FrameDescription>
                        Halaman yang belum pernah diubah memakai isi bawaan.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-0 p-0">
                    <ul className="divide-y divide-border">
                        {pages.map((page) => (
                            <li
                                key={page.key}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-sm font-semibold">
                                            {page.label}
                                        </h2>
                                        {page.updated_at ? (
                                            <Badge variant="success-light">
                                                Disesuaikan
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                Isi bawaan
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {page.description}
                                    </p>
                                    {page.updated_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Diubah{' '}
                                            {formatDateTime(page.updated_at)}
                                            {page.updated_by &&
                                                ` oleh ${page.updated_by}`}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <a
                                            href={page.public_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink
                                                data-icon="inline-start"
                                                aria-hidden
                                            />
                                            Lihat
                                        </a>
                                    </Button>
                                    <Button type="button" asChild>
                                        <Link href={edit(page.key)}>
                                            <Pencil
                                                data-icon="inline-start"
                                                aria-hidden
                                            />
                                            Ubah
                                        </Link>
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </FramePanel>
            </Frame>
        </AdminPage>
    );
}
