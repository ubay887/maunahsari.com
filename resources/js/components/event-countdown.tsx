import { useEffect, useState } from 'react';
import type { EventStatus } from '@/types/event';

export function EventCountdown({
    startAt,
    endAt,
    status,
}: {
    startAt: string;
    endAt: string;
    status: EventStatus;
}) {
    const [remaining, setRemaining] = useState<{
        start: number;
        end: number;
    } | null>(null);
    useEffect(() => {
        const tick = () => {
            const now = new Date().getTime();
            setRemaining({
                start: new Date(startAt).getTime() - now,
                end: new Date(endAt).getTime() - now,
            });
        };
        tick();
        const timer = window.setInterval(tick, 1000);
        return () => window.clearInterval(timer);
    }, [startAt, endAt]);
    if (status === 'cancelled')
        return <p className="text-sm">Event dibatalkan.</p>;
    if (!remaining)
        return (
            <p className="text-sm text-muted-foreground">
                Menyiapkan hitung mundur…
            </p>
        );
    if (remaining.end <= 0)
        return <p className="text-sm">Event telah selesai.</p>;
    if (remaining.start <= 0)
        return <p className="text-sm">Event sedang berlangsung.</p>;
    const seconds = Math.floor(remaining.start / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return (
        <p
            className="text-sm tabular-nums"
            aria-label="Hitung mundur menuju event"
        >
            Dimulai dalam {days} hari {hours} jam {minutes} menit {seconds % 60}{' '}
            detik
        </p>
    );
}
