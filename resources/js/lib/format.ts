const TIME_ZONE = 'Asia/Jakarta';

/** A medium date in Indonesian, or `empty` when there is no value. */
export function formatDate(value: string | null | undefined, empty = '—') {
    return value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
              timeZone: TIME_ZONE,
          }).format(new Date(value))
        : empty;
}

/** A medium date and short time in Indonesian, or `empty` without a value. */
export function formatDateTime(value: string | null | undefined, empty = '—') {
    return value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: TIME_ZONE,
          }).format(new Date(value))
        : empty;
}

export function formatNumber(value: number | null | undefined, empty = '—') {
    return value === null || value === undefined
        ? empty
        : value.toLocaleString('id-ID');
}
