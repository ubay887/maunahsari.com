import type {
    AlumniProfile,
    AlumniOptions,
    PrivacyData,
    ProfileData,
} from '@/types/alumni';
export const alumniLabels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    declined: 'Ditolak',
    expired: 'Kedaluwarsa',
    full_name: 'Nama lengkap',
    gender: 'Jenis kelamin',
    photo: 'Foto',
    phone_whatsapp: 'WhatsApp',
    entry_year: 'Tahun masuk',
    leave_year: 'Tahun keluar',
    pondok: 'Pondok',
    program: 'Program',
    alumni_status: 'Status kesantrian',
    angkatan: 'Angkatan',
    province: 'Provinsi',
    regency: 'Kota/kabupaten',
    activity_status: 'Aktivitas',
    profession: 'Profesi',
    organization: 'Organisasi',
    field: 'Bidang',
    skills: 'Keahlian',
    bio: 'Bio',
    social_links: 'Tautan sosial',
    open_to: 'Kesediaan',
    lulus: 'Lulus',
    keluar: 'Keluar',
    mengabdi: 'Mengabdi',
    bekerja: 'Bekerja',
    wirausaha: 'Wirausaha',
    studi: 'Studi',
    lainnya: 'Lainnya',
    ready_to_help: 'Siap membantu',
    seeking_job: 'Mencari pekerjaan',
    hiring: 'Membuka kesempatan',
    mentoring: 'Mentoring',
    visible: 'Tampil',
    anonymous: 'Anonim',
    hidden: 'Sembunyi',
    admin: 'Admin',
    self: 'Mandiri',
    import: 'Impor',
    putra: 'Putra',
    putri: 'Putri',
    pending: 'Menunggu persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};
export function privacyDefaults(
    profile: AlumniProfile | null,
    options: AlumniOptions,
): PrivacyData {
    return {
        map_mode: profile?.map_mode ?? '',
        directory_visible:
            profile?.directory_visible === null || !profile
                ? ''
                : profile.directory_visible
                  ? '1'
                  : '0',
        field_visibility: Object.fromEntries(
            options.visibilityFields.map((field) => [
                field,
                profile?.field_visibility?.[field] ?? 'private',
            ]),
        ),
        privacy_consent: false,
        privacy_version: options.privacyVersion,
    };
}
export function profileDefaults(
    profile: AlumniProfile | null,
    options: AlumniOptions,
): ProfileData {
    return {
        ...privacyDefaults(profile, options),
        full_name: profile?.full_name ?? '',
        gender: profile?.gender ?? '',
        phone_whatsapp: profile?.phone_whatsapp ?? '',
        entry_year: String(profile?.entry_year ?? ''),
        leave_year: String(profile?.leave_year ?? ''),
        pondok: profile?.pondok ?? '',
        program_id: String(profile?.program_id ?? ''),
        alumni_status: profile?.alumni_status ?? '',
        angkatan: profile?.angkatan ?? '',
        province_id: String(profile?.province_id ?? ''),
        regency_id: String(profile?.regency_id ?? ''),
        activity_status: profile?.activity_status ?? '',
        profession: profile?.profession ?? '',
        organization: profile?.organization ?? '',
        field: profile?.field ?? '',
        skills: profile?.skills ?? [],
        bio: profile?.bio ?? '',
        social_links: profile?.social_links ?? {},
        open_to: profile?.open_to ?? [],
        photo: null,
        remove_photo: false,
    };
}
export function distanceBand(distance: number): string {
    if (!Number.isFinite(distance) || distance < 0)
        throw new RangeError('Jarak tidak valid');
    return `dalam ${distance <= 25 ? 25 : distance <= 50 ? 50 : 100} km`;
}

export type AlumniAdminSection =
    | 'statistics'
    | 'list'
    | 'queue'
    | 'create'
    | 'import';

/**
 * Resolve which admin alumni section a URL belongs to, so the sidebar and the
 * in-page nav highlight the same item. Edit pages belong to the list.
 */
export function alumniAdminSection(url: string): AlumniAdminSection | null {
    const [pathname = '', search = ''] = url.split('?');
    if (pathname === '/admin/alumni/statistik') return 'statistics';
    if (pathname === '/admin/alumni/buat') return 'create';
    if (pathname.startsWith('/admin/alumni/impor')) return 'import';
    if (pathname === '/admin/alumni') {
        return new URLSearchParams(search).get('verification_status') ===
            'pending'
            ? 'queue'
            : 'list';
    }
    return /^\/admin\/alumni\/\d+(\/edit)?$/.test(pathname) ? 'list' : null;
}
