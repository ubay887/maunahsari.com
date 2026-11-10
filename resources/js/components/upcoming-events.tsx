import { Link, router } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import { ArticlePageError } from '@/components/article-page-error';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/events';
import type { EventCardData } from '@/types/event';

export function UpcomingEvents({
    events,
    loading = false,
    error = false,
    onRetry = () => router.reload(),
}: {
    events: EventCardData[];
    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;
}) {
    return (
        <section className="flex flex-col gap-4" aria-label="Event mendatang">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">
                    Event mendatang
                </h2>
                <Button type="button" variant="outline" asChild>
                    <Link href={index()}>Semua event</Link>
                </Button>
            </div>
            {error ? (
                <ArticlePageError retry={onRetry} />
            ) : loading ? (
                <p role="status" className="text-sm text-muted-foreground">
                    Memuat event mendatang…
                </p>
            ) : events.length ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    bordered
                    title="Belum ada jadwal kegiatan berikutnya"
                    action={
                        <Button type="button" variant="outline" asChild>
                            <Link href={index({ query: { tab: 'past' } })}>
                                Lihat kegiatan sebelumnya
                            </Link>
                        </Button>
                    }
                />
            )}
        </section>
    );
}
