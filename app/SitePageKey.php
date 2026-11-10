<?php

namespace App;

enum SitePageKey: string
{
    case Profile = 'profile';
    case PondokPutra = 'pondok-putra';
    case PondokPutri = 'pondok-putri';
    case Contact = 'contact';

    public function label(): string
    {
        return match ($this) {
            self::Profile => 'Profil pesantren',
            self::PondokPutra => 'Pondok putra',
            self::PondokPutri => 'Pondok putri',
            self::Contact => 'Narahubung & identitas',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Profile => 'Sejarah, lokasi, pendiri, dan pengasuh.',
            self::PondokPutra => 'Program, kegiatan harian, fasilitas, dan kuota pondok putra.',
            self::PondokPutri => 'Program, kegiatan harian, fasilitas, dan kuota pondok putri.',
            self::Contact => 'Alamat, kontak WhatsApp, dan media sosial. Tampil juga di footer.',
        };
    }

    public function publicRouteName(): string
    {
        return match ($this) {
            self::Profile => 'site.profile',
            self::PondokPutra => 'site.pondok.putra',
            self::PondokPutri => 'site.pondok.putri',
            self::Contact => 'site.contact',
        };
    }

    public function isPondok(): bool
    {
        return in_array($this, [self::PondokPutra, self::PondokPutri], true);
    }
}
