<?php

namespace App\Services;

class PsbPhone
{
    public static function normalize(string $value): string
    {
        if (! preg_match('/^\+?[0-9 ()-]+$/', $value)) {
            return $value;
        }
        $number = ltrim(str_replace([' ', '(', ')', '-'], '', $value), '+');

        return str_starts_with($number, '0') ? '62'.substr($number, 1) : $number;
    }
}
