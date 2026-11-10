<?php

namespace App;

enum ActivityStatus: string
{
    case Bekerja = 'bekerja';
    case Wirausaha = 'wirausaha';
    case Studi = 'studi';
    case Mengabdi = 'mengabdi';
    case Lainnya = 'lainnya';
}
