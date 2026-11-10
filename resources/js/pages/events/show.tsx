import { Head, Link } from '@inertiajs/react';
import { CalendarPlus, Copy, MapPin, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ArticleContent } from '@/components/article-content';
import { ArticlePageError } from '@/components/article-page-error';
import { EventBadges } from '@/components/event-badges';
import { EventCountdown } from '@/components/event-countdown';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UpcomingEvents } from '@/components/upcoming-events';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { eventDate } from '@/lib/events';
import { index, calendar } from '@/routes/events';
import type { Event, EventCardData } from '@/types/event';

export default function Show({
    event,
    preview,
    canonical,
    description,
    schema,
    shareUrl,
    whatsappUrl,
    googleCalendarUrl,
    upcomingEvents,
}: {
    event: Event;
    preview: boolean;
    canonical: string;
    description: string;
    schema: string | null;
    shareUrl: string;
    whatsappUrl: string | null;
    googleCalendarUrl: string;
    upcomingEvents: EventCardData[];
}) {
    const page = useArticlePageState();
    const title = event.meta_title || event.title;
    return (
        <>
            <Head title={title}>
                <meta
                    head-key="description"
                    name="description"
                    content={description}
                />
                <link head-key="canonical" rel="canonical" href={canonical} />
                <meta head-key="og:title" property="og:title" content={title} />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={description}
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:url" property="og:url" content={canonical} />
                {event.banner_url && (
                    <meta
                        head-key="og:image"
                        property="og:image"
                        content={event.banner_url}
                    />
                )}
                {preview && (
                    <meta
                        head-key="robots"
                        name="robots"
                        content="noindex,nofollow"
                    />
                )}
                {schema && (
                    <script head-key="event-schema" type="application/ld+json">
                        {schema}
                    </script>
                )}
            </Head>
            <div>
                <Button type="button" variant="ghost" asChild>
                    <Link href={index()}>Kembali ke event</Link>
                </Button>
            </div>
            {preview && (
                <Alert variant="warning">
                    <AlertTitle>Pratinjau admin</AlertTitle>
                    <AlertDescription>
                        Draf belum ditampilkan kepada pengunjung.
                    </AlertDescription>
                </Alert>
            )}
            {event.status === 'cancelled' && (
                <Alert variant="destructive">
                    <AlertTitle>Event dibatalkan</AlertTitle>
                    <AlertDescription>
                        Hubungi panitia untuk informasi lebih lanjut.
                    </AlertDescription>
                </Alert>
            )}
            {page.error && <ArticlePageError retry={page.retry} />}
            <article className="flex min-w-0 flex-col gap-4">
                <header className="flex flex-col gap-4">
                    <EventBadges
                        status={event.status}
                        phase={event.phase}
                        type={event.type}
                    />
                    <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
                        {event.title}
                    </h1>
                    {event.summary && (
                        <p className="text-sm text-muted-foreground">
                            {event.summary}
                        </p>
                    )}
                </header>
                {event.banner_url && (
                    <img
                        src={event.banner_url}
                        alt={event.title}
                        className="aspect-video w-full object-cover"
                    />
                )}
                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="flex min-w-0 flex-col gap-4">
                        <ArticleContent html={event.description} />
                    </div>
                    <aside className="flex min-w-0 flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Jadwal kegiatan</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-muted-foreground">
                                        Mulai
                                    </p>
                                    <time
                                        className="text-sm"
                                        dateTime={event.start_at}
                                    >
                                        {eventDate(
                                            event.start_at,
                                            event.timezone,
                                        )}
                                    </time>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-muted-foreground">
                                        Selesai
                                    </p>
                                    <time
                                        className="text-sm"
                                        dateTime={event.end_at}
                                    >
                                        {eventDate(
                                            event.end_at,
                                            event.timezone,
                                        )}
                                    </time>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Zona waktu: {event.timezone}
                                </p>
                                <EventCountdown
                                    startAt={event.start_at}
                                    endAt={event.end_at}
                                    status={event.status}
                                />
                                {event.status !== 'draft' && (
                                    <div className="flex flex-col items-start gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                        >
                                            <a href={calendar.url(event.slug)}>
                                                <CalendarPlus aria-hidden />
                                                Unduh kalender (.ics)
                                            </a>
                                        </Button>
                                        {event.status !== 'cancelled' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                asChild
                                            >
                                                <a
                                                    href={googleCalendarUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Google Calendar
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Lokasi dan kontak</CardTitle>
                            </CardHeader>
                            <CardContent className="flex min-w-0 flex-col gap-4">
                                {event.type !== 'online' && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">
                                            {event.location_name}
                                        </p>
                                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                                            {event.address}
                                        </p>
                                        {event.map_url && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                asChild
                                            >
                                                <a
                                                    href={event.map_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <MapPin aria-hidden />
                                                    Lihat peta
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {event.type !== 'offline' &&
                                    event.meeting_url && (
                                        <div className="flex min-w-0 flex-col gap-2">
                                            <p className="text-sm font-medium">
                                                Tautan meeting
                                            </p>
                                            <a
                                                className="text-sm break-all text-primary underline"
                                                href={event.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {event.meeting_url}
                                            </a>
                                        </div>
                                    )}
                                {event.registration_url &&
                                    event.status !== 'cancelled' &&
                                    event.phase !== 'past' && (
                                        <Button type="button" asChild>
                                            <a
                                                href={event.registration_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Daftar
                                            </a>
                                        </Button>
                                    )}
                                {whatsappUrl && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Hubungi panitia
                                        </a>
                                    </Button>
                                )}
                                {!event.registration_url && !whatsappUrl && (
                                    <p className="text-sm text-muted-foreground">
                                        Informasi pendaftaran dan kontak belum
                                        tersedia.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" asChild>
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Share2 aria-hidden />
                            Bagikan via WhatsApp
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
            <UpcomingEvents
                events={upcomingEvents}
                loading={page.loading}
                error={page.error}
                onRetry={page.retry}
            />
        </>
    );
}
