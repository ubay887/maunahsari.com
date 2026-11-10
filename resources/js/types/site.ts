export type SiteContact = {
    role: string;
    phone: string;
    description: string;
};

export type SiteSocial = { name: string; handle: string; href: string };

export type ContactContent = {
    address: string;
    affiliation: string;
    contacts: SiteContact[];
    social: SiteSocial[];
    magazine_url: string | null;
};

/** Konten kontak yang dibagikan ke seluruh halaman, dengan tautan WhatsApp. */
export type SiteInfo = Omit<ContactContent, 'contacts'> & {
    contacts: (SiteContact & { href: string })[];
};

export type ProfileContent = {
    history_html: string;
    location_html: string;
    founder: {
        name: string;
        facts: { label: string; value: string }[];
        bio_html: string;
    };
    caretaker: {
        period: string;
        name: string;
        lineage: string | null;
        bio_html: string;
        works: string[];
        organizations: string[];
    };
};

export type PondokProgram = {
    title: string;
    description: string;
    target: string;
};

export type PondokActivity = {
    time: string;
    title: string;
    description: string;
};

export type PondokContent = {
    programs: PondokProgram[];
    activities: PondokActivity[];
    facilities: string[];
    quota_note: string;
};

export type SitePageKey =
    | 'profile'
    | 'pondok-putra'
    | 'pondok-putri'
    | 'contact';

export type SitePageSummary = {
    key: SitePageKey;
    label: string;
    description: string;
    public_url: string;
    updated_at: string | null;
    updated_by: string | null;
};
