<?php

namespace App;

enum ApplicantStatus: string
{
    case Registered = 'registered';
    case Verified = 'verified';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Registered => 'Terdaftar',
            self::Verified => 'Berkas terverifikasi',
            self::Accepted => 'Diterima',
            self::Rejected => 'Ditolak',
            self::Cancelled => 'Dibatalkan',
        };
    }

    /** @return list<self> */
    public static function occupying(): array
    {
        return [self::Registered, self::Verified, self::Accepted];
    }
}
