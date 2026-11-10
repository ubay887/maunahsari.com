<?php

namespace App;

enum EventStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf', self::Published => 'Terbit', self::Cancelled => 'Dibatalkan',
        };
    }
}
