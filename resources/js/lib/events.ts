export const eventStatusLabels = {
    draft: 'Draf',
    published: 'Terbit',
    cancelled: 'Dibatalkan',
} as const;
export const eventTypeLabels = {
    offline: 'Luring',
    online: 'Daring',
    hybrid: 'Hybrid',
} as const;
export const eventPhaseLabels = {
    upcoming: 'Akan datang',
    ongoing: 'Berlangsung',
    past: 'Selesai',
} as const;
export function eventDate(value: string, timezone: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: timezone,
    }).format(new Date(value));
}

export function eventDateRangeLabel(from: string, to: string): string {
    const format = (value: string) =>
        new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(`${value}T00:00:00Z`));

    if (from && to) {
        return from === to ? format(from) : `${format(from)} – ${format(to)}`;
    }
    if (from) return `Sejak ${format(from)}`;
    if (to) return `Hingga ${format(to)}`;
    return 'Semua tanggal';
}

export function eventDateFilterState(
    from: string,
    to: string,
    appliedFrom: string,
    appliedTo: string,
    loading = false,
): { invalid: boolean; canApply: boolean } {
    const invalid = from !== '' && to !== '' && from > to;

    return {
        invalid,
        canApply:
            !loading && !invalid && (from !== appliedFrom || to !== appliedTo),
    };
}

export function eventSchedule(
    startAt: string,
    endAt: string,
): {
    date: string;
    time: string;
} {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const day = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeZone: 'Asia/Jakarta',
    });
    const date = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    });
    const time = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
    });

    return {
        date:
            day.format(start) === day.format(end)
                ? date.format(start)
                : `${date.format(start)} – ${date.format(end)}`,
        time: `${time.format(start)} – ${time.format(end)} WIB`,
    };
}
