import { Link } from '@inertiajs/react';
import { EventBadges } from '@/components/event-badges';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { eventDate } from '@/lib/events';
import { show } from '@/routes/events';
import type { EventCardData } from '@/types/event';

export function EventCard({ event }: { event: EventCardData }) {
    return (
        <Card className="h-full">
            {event.banner_url && (
                <Link href={show(event.slug)} tabIndex={-1} aria-hidden>
                    <img
                        src={event.banner_url}
                        alt=""
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                    />
                </Link>
            )}
            <CardHeader>
                <EventBadges
                    status={event.status}
                    phase={event.phase}
                    type={event.type}
                />
                <CardTitle className="font-display font-bold text-primary">
                    <Link href={show(event.slug)} className="hover:underline">
                        {event.title}
                    </Link>
                </CardTitle>
                <CardDescription>
                    {eventDate(event.start_at, event.timezone)} (
                    {event.timezone})
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                    {event.summary ||
                        'Lihat jadwal dan informasi kegiatan pesantren.'}
                </p>
                <p className="text-xs text-muted-foreground">
                    {event.location_name || 'Pertemuan daring'}
                </p>
            </CardContent>
            {event.categories.length > 0 && (
                <CardFooter className="mt-auto">
                    <p className="text-xs text-muted-foreground">
                        {event.categories
                            .map((category) => category.name)
                            .join(' · ')}
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}
