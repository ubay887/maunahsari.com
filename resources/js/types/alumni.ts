export type AlumniCard = {
    id: number;
    full_name?: string;
    gender?: string;
    photo?: string | null;
    entry_year?: number;
    leave_year?: number | null;
    pondok?: string;
    program?: string | null;
    alumni_status?: string;
    angkatan?: string;
    province?: string;
    regency?: string;
    activity_status?: string;
    profession?: string | null;
    organization?: string | null;
    field?: string | null;
    skills?: string[] | null;
    bio?: string | null;
    social_links?: Record<string, string> | null;
    open_to?: string[] | null;
    distance_band?: string;
};
export type AlumniProfile = AlumniCard & {
    user_id: number | null;
    santri_id: number | null;
    program_id: number | null;
    province_id: number;
    regency_id: number;
    phone_whatsapp: string | null;
    verification_status: string;
    rejection_reason: string | null;
    map_mode: string | null;
    directory_visible: boolean | null;
    field_visibility: Record<string, string> | null;
    source: string;
    verified_at?: string | null;
    claimed_at?: string | null;
};
export type AlumniOptions = {
    provinces: { id: number; name: string; code: string }[];
    regencies: {
        id: number;
        province_id: number;
        name: string;
        code: string;
    }[];
    programs: { id: number; name: string }[];
    privacyVersion: string;
    visibilityFields: string[];
};
export type PrivacyData = {
    map_mode: string;
    directory_visible: string;
    field_visibility: Record<string, string>;
    privacy_consent: boolean;
    privacy_version: string;
};
export type ProfileData = PrivacyData & {
    full_name: string;
    gender: string;
    phone_whatsapp: string;
    entry_year: string;
    leave_year: string;
    pondok: string;
    program_id: string;
    alumni_status: string;
    angkatan: string;
    province_id: string;
    regency_id: string;
    activity_status: string;
    profession: string;
    organization: string;
    field: string;
    skills: string[];
    bio: string;
    social_links: Record<string, string>;
    open_to: string[];
    photo: File | null;
    remove_photo: boolean;
    santri_id?: string;
};
export type AlumniContact = {
    id: number;
    incoming: boolean;
    message: string;
    status: string;
    created_at: string;
    other: AlumniCard | null;
};
export type MapGroup = {
    level: 'regency';
    id: number;
    name: string;
    province: string | null;
    latitude: number;
    longitude: number;
    count: number;
    label: string;
};
export type MapData = {
    groups: MapGroup[];
    by_angkatan: { name: string; count: number; label: string }[];
    total: number;
};

export type AlumniAdminRow = Pick<
    AlumniProfile,
    | 'id'
    | 'full_name'
    | 'gender'
    | 'entry_year'
    | 'leave_year'
    | 'angkatan'
    | 'pondok'
    | 'program'
    | 'alumni_status'
    | 'province'
    | 'regency'
    | 'activity_status'
    | 'profession'
    | 'organization'
    | 'field'
    | 'verification_status'
    | 'verified_at'
    | 'map_mode'
    | 'directory_visible'
    | 'source'
    | 'claimed_at'
> & { created_at: string | null };
