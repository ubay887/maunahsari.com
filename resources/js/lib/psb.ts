import type {
    ApplicantStatus,
    DocumentType,
    RegionalAddress,
} from '@/types/psb';
export function formatAddress(value: RegionalAddress): string {
    const neighbourhood = [
        value.rt ? `RT ${value.rt}` : '',
        value.rw ? `RW ${value.rw}` : '',
    ]
        .filter(Boolean)
        .join(' / ');
    return [
        value.address,
        neighbourhood,
        value.village?.name,
        value.district?.name,
        value.city?.name,
        value.province?.name,
        value.postal_code,
    ]
        .filter(Boolean)
        .join(', ');
}
export const statusLabels: Record<ApplicantStatus, string> = {
    registered: 'Terdaftar',
    verified: 'Berkas terverifikasi',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
};
export const statusMessages: Record<ApplicantStatus, string> = {
    registered:
        'Pendaftaran Anda sudah kami terima. Lengkapi data dan berkas, lalu tunggu verifikasi pengurus.',
    verified:
        'Berkas Anda sudah terverifikasi. Hubungi narahubung untuk mengonfirmasi jadwal kehadiran dan sowan.',
    accepted:
        'Selamat, calon santri diterima. Ikuti arahan pengurus untuk administrasi berikutnya.',
    rejected: 'Pendaftaran belum dapat kami terima.',
    cancelled:
        'Pendaftaran ini dibatalkan. Hubungi narahubung bila Anda ingin mengaktifkannya kembali.',
};
export const documentLabels: Record<DocumentType, string> = {
    ijazah: 'Ijazah',
    kartu_keluarga: 'Kartu keluarga',
    pas_foto: 'Pas foto 3x4',
};
export const closedMessage = 'Kuota habis, pendaftaran ditutup.';
export function toRichText(value: string | null): string {
    if (!value) return '';
    if (/^\s*<[a-z][\s\S]*>/i.test(value)) return value;
    return value
        .split(/\r?\n/)
        .map(
            (line) =>
                `<p>${line.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')}</p>`,
        )
        .join('');
}
export function rupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}
export function dateTime(value: string | null) {
    return value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Asia/Jakarta',
          }).format(new Date(value)) + ' WIB'
        : 'Belum dicatat';
}
export function localDateTime(value: string | null) {
    if (!value) return '';
    const parts = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(new Date(value));
    return parts.replace(' ', 'T');
}
export function validateDocument(
    file: File,
    type: DocumentType,
): string | null {
    if (file.size > 2 * 1024 * 1024) return 'Ukuran berkas maksimal 2 MB.';
    const types =
        type === 'pas_foto'
            ? ['image/jpeg', 'image/png', 'image/webp']
            : ['application/pdf'];
    return types.includes(file.type) ? null : 'Format berkas tidak sesuai.';
}
