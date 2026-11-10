<?php

namespace App;

enum DocumentType: string
{
    case Ijazah = 'ijazah';
    case KartuKeluarga = 'kartu_keluarga';
    case PasFoto = 'pas_foto';

    public function label(): string
    {
        return match ($this) {
            self::Ijazah => 'Ijazah',
            self::KartuKeluarga => 'Kartu keluarga',
            self::PasFoto => 'Pas foto',
        };
    }
}
