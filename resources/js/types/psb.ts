export type Pondok = 'putra' | 'putri';
export type ApplicantStatus =
    | 'registered'
    | 'verified'
    | 'accepted'
    | 'rejected'
    | 'cancelled';
export type DocumentType = 'ijazah' | 'kartu_keluarga' | 'pas_foto';
export type Program = {
    id: number;
    name: string;
    slug: string;
    description: string;
    requires_hafalan: boolean;
    sort_order: number;
    is_active: boolean;
};
export type Period = {
    id: number;
    name: string;
    academic_year: string;
    is_open: boolean;
    opens_at: string;
    closes_at: string | null;
    fee_url_putra: string | null;
    fee_url_putri: string | null;
    contact_whatsapp_putra: string | null;
    contact_whatsapp_putri: string | null;
    info_note: string | null;
};
export type QuotaUnavailableReason =
    | 'closed'
    | 'period_closed'
    | 'program_inactive'
    | 'no_capacity'
    | 'full';
export type Quota = {
    id: number;
    registration_period_id: number;
    program_id: number;
    pondok: Pondok;
    capacity: number;
    is_open: boolean;
    used: number;
    remaining: number;
    available: boolean;
    unavailable_reason: QuotaUnavailableReason | null;
    program: Program;
};
export type ApplicantDocument = {
    id: number;
    type: DocumentType;
    original_name: string;
    size: number;
    mime: string;
    is_verified: boolean;
    verified_at: string | null;
};
export type Payment = {
    id: number;
    amount: number;
    paid_at: string;
    note: string | null;
};
export type StatusHistory = {
    id: number;
    from_status: ApplicantStatus | null;
    to_status: ApplicantStatus;
    reason: string | null;
    created_at: string;
    actor: { name: string } | null;
};
export type Applicant = {
    nik: string | null;
    id: number;
    registration_number: string;
    registration_period_id: number;
    program_id: number;
    pondok: Pondok;
    residence_type: 'mukim' | 'nduduk';
    source: 'online' | 'offline';
    status: ApplicantStatus;
    full_name: string;
    nickname: string | null;
    gender: 'male' | 'female';
    birth_place: string;
    birth_date: string;
    address: string;
    last_education: string;
    hafalan_juz: number | null;
    can_read_binnadhor: boolean;
    can_write_pegon: boolean;
    guardian_name: string;
    guardian_relation: string;
    guardian_phone: string;
    agreed_to_rules: boolean;
    visit_scheduled_at: string | null;
    visited_at: string | null;
    sowan_done_at: string | null;
    admin_note: string | null;
    decision_reason: string | null;
    program: Program;
    registration_period: Period;
    documents: ApplicantDocument[];
    payments: Payment[];
    status_histories: StatusHistory[];
    created_at: string;
} & RegionalAddress;
export type Santri = Pick<
    Applicant,
    | 'id'
    | 'nik'
    | 'full_name'
    | 'nickname'
    | 'gender'
    | 'pondok'
    | 'residence_type'
    | 'program'
    | 'birth_place'
    | 'birth_date'
    | 'address'
    | 'guardian_name'
    | 'guardian_phone'
> &
    RegionalAddress & {
        applicant_id: number;
        entry_year: number;
        is_active: boolean;
        applicant?: { id: number; registration_number: string } | null;
    };
export type SelectOption = { value: string; label: string };
export type AddressOptions = {
    provinces: SelectOption[];
    cities: SelectOption[];
    districts: SelectOption[];
    villages: SelectOption[];
};
export type RegionalAddress = {
    address: string;
    province_code: string | null;
    city_code: string | null;
    district_code: string | null;
    village_code: string | null;
    rt: string | null;
    rw: string | null;
    postal_code: string | null;
    province?: { name: string } | null;
    city?: { name: string } | null;
    district?: { name: string } | null;
    village?: { name: string } | null;
};
export type AddressData = {
    [
        Key in
            | 'province_code'
            | 'city_code'
            | 'district_code'
            | 'village_code'
            | 'rt'
            | 'rw'
            | 'postal_code'
            | 'address'
    ]: string;
};
/** Biodata yang diisikan ke formulir; cukup sebagian dari Applicant agar portal calon santri tidak menerima data internal. */
export type FormApplicant = Pick<
    Applicant,
    | 'id'
    | 'registration_period_id'
    | 'program_id'
    | 'residence_type'
    | 'full_name'
    | 'nickname'
    | 'nik'
    | 'gender'
    | 'birth_place'
    | 'birth_date'
    | 'address'
    | 'province_code'
    | 'city_code'
    | 'district_code'
    | 'village_code'
    | 'rt'
    | 'rw'
    | 'postal_code'
    | 'last_education'
    | 'hafalan_juz'
    | 'can_read_binnadhor'
    | 'can_write_pegon'
    | 'guardian_name'
    | 'guardian_relation'
    | 'guardian_phone'
> & { agreed_to_rules?: boolean };
export type PortalApplicant = {
    registration_number: string;
    full_name: string;
    guardian_name: string;
    status: ApplicantStatus;
    status_label: string;
    pondok: string;
    residence_type: string;
    program: string;
    period: string;
    registered_at: string | null;
    visit_scheduled_at: string | null;
    decision_reason: string | null;
    can_edit: boolean;
    contact: string | null;
    fee_url: string | null;
};
export type PortalPayment = {
    id: number;
    amount: number;
    paid_at: string;
    note: string | null;
};
export type PortalDocument = {
    type: DocumentType;
    label: string;
    id: number | null;
    original_name: string | null;
    size: number | null;
    is_verified: boolean;
};
export type PortalHistory = {
    status: ApplicantStatus;
    status_label: string;
    at: string | null;
};
export type FormOptions = {
    periods: Period[];
    programs: Program[];
    guardianRelations: SelectOption[];
    educationLevels: SelectOption[];
    addressOptions: AddressOptions;
};
