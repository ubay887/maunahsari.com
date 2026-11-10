import { images } from '@/lib/site';

export type PondokKey = 'putra' | 'putri';

/** Bagian halaman pondok yang tetap; isi lainnya dikelola dari admin. */
export const pondokMeta: Record<
    PondokKey,
    {
        title: string;
        eyebrow: string;
        cover: string;
        coverAlt: string;
        facilitiesLabel: string;
    }
> = {
    putra: {
        title: 'Pondok Putra',
        eyebrow: "Pendidikan Tahfidhul Qur'an",
        cover: images.putraCover,
        coverAlt: 'Santri putra melantunkan Al-Qur’an bersama',
        facilitiesLabel: 'Fasilitas utama santri mukim',
    },
    putri: {
        title: 'Pondok Putri',
        eyebrow: "Pendidikan Tahfidhul Qur'an Putri",
        cover: images.putriCover,
        coverAlt: 'Santri putri bersama di pondok putri',
        facilitiesLabel: 'Fasilitas utama santriwati mukim',
    },
};
