<?php

namespace App\Services;

use DateTimeImmutable;
use DateTimeZone;

class PsbDate
{
    /** Normalize browser datetime-local values before date validation compares them with now. */
    public static function utcInput(mixed $value): mixed
    {
        if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $value)) {
            return $value;
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $value, new DateTimeZone('Asia/Jakarta'));
        $errors = DateTimeImmutable::getLastErrors();
        if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            return $value;
        }

        return $date->setTimezone(new DateTimeZone('UTC'))->format(DATE_ATOM);
    }
}
