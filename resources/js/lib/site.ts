export const site = {
    name: "PTQ Ma'unah Sari",
    orgName: "Pesantren Tahfidhul Qur'an Ma'unah Sari",
    tagline: 'Bandar Kidul - Mojoroto - Kota Kediri',
    address:
        'Jl. KH. Agus Salim No.8, Bandar Kidul, Kec. Mojoroto, Kota Kediri, Jawa Timur 64118',
    affiliation:
        "Lembaga pendidikan Tahfidhul Qur'an berafiliasi dengan Rabithah Ma'had Al-Islamiyyah (RMI) Nahdlatul Ulama yang mendidik santri putra-putri berwawasan Ahlussunnah wal Jama'ah An-Nahdliyyah.",
    founded: 1967,
    contacts: [
        {
            role: 'Kantor Putra',
            phone: '0812-4530-6020',
            href: 'https://wa.me/6281245306020',
            description:
                'Informasi asrama putra, kuota almari santri baru putra, dan koordinasi sowan putra.',
        },
        {
            role: 'Kantor Putri',
            phone: '0856-4571-7767',
            href: 'https://wa.me/6285645717767',
            description:
                'Informasi asrama putri, gelombang riyadloh berkala 3 bulanan, dan koordinasi sowan putri.',
        },
    ],
    social: [
        {
            name: 'Instagram',
            handle: '@maunahsari',
            href: 'https://www.instagram.com/maunahsari',
        },
        {
            name: 'Facebook',
            handle: 'PP Maunah Sari',
            href: 'https://www.facebook.com/ppmaunahsari',
        },
        {
            name: 'TikTok',
            handle: '@maunahsari',
            href: 'https://www.tiktok.com/@maunahsari',
        },
        {
            name: 'YouTube',
            handle: "Tahfidhul Qur'an Ma'unah Sari",
            href: 'https://www.youtube.com/channel/UCH3bNfhbfEJpPjm9gfGvvSQ',
        },
    ],
    magazineUrl: 'https://khobarunamaunahsari.blogspot.com/',
} as const;

export const images = {
    seal: '/images/logos/seal_logo.webp',
    logo: '/images/logos/logo.webp',
    profileCover: '/images/covers/profil_cover.webp',
    putraCover: '/images/covers/putra_cover.webp',
    putriCover: '/images/covers/putri_cover.webp',
    psbBanner: '/images/banners/psb_banner.webp',
    gusHamid: '/images/people/gus_hamid.webp',
    agusKhalaf: '/images/people/agus_khalaf.webp',
} as const;
