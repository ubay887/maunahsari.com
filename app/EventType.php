<?php

namespace App;

enum EventType: string
{
    case Offline = 'offline';
    case Online = 'online';
    case Hybrid = 'hybrid';

    public function label(): string
    {
        return match ($this) {
            self::Offline => 'Luring', self::Online => 'Daring', self::Hybrid => 'Hybrid',
        };
    }
}
