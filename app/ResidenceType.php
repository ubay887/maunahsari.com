<?php

namespace App;

enum ResidenceType: string
{
    case Mukim = 'mukim';
    case Nduduk = 'nduduk';

    public function label(): string
    {
        return match ($this) {
            self::Mukim => 'Mukim',
            self::Nduduk => 'Nduduk',
        };
    }
}
