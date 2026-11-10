<?php

namespace App;

enum ArticleStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Scheduled = 'scheduled';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf', self::Published => 'Terbit',
            self::Scheduled => 'Terjadwal', self::Archived => 'Diarsipkan',
        };
    }
}
