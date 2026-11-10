<?php

namespace App;

enum GuardianRelation: string
{
    case Father = 'Ayah';
    case Mother = 'Ibu';
    case Grandfather = 'Kakek';
    case Grandmother = 'Nenek';
    case Sibling = 'Saudara kandung';
    case Uncle = 'Paman';
    case Aunt = 'Bibi';
    case OtherGuardian = 'Wali lainnya';
}
