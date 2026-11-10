export const articleStatusLabels = {
    draft: 'Draf',
    published: 'Terbit',
    scheduled: 'Terjadwal',
    archived: 'Diarsipkan',
} as const;
export function slugify(value: string): string {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 240)
        .replace(/-+$/g, '');
}
export function readingMinutes(text: string): number {
    const words = text
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}
export function articleDate(value: string | null): string {
    return value
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
              new Date(value),
          )
        : 'Belum terbit';
}
export function localDateTime(value: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    const part = (number: number) => String(number).padStart(2, '0');
    return (
        date.getFullYear() +
        '-' +
        part(date.getMonth() + 1) +
        '-' +
        part(date.getDate()) +
        'T' +
        part(date.getHours()) +
        ':' +
        part(date.getMinutes())
    );
}
