<?php

namespace App;

enum Pondok: string
{
    case Putra = 'putra';
    case Putri = 'putri';

    public function label(): string
    {
        return match ($this) {
            self::Putra => 'Putra',
            self::Putri => 'Putri',
        };
    }

    public static function fromGender(string $gender): self
    {
        return $gender === 'male' ? self::Putra : self::Putri;
    }
}
