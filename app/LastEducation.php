<?php

namespace App;

enum LastEducation: string
{
    case NotAttending = 'Belum sekolah';
    case Kindergarten = 'TK/RA';
    case Primary = 'SD/MI';
    case JuniorSecondary = 'SMP/MTs';
    case SeniorSecondary = 'SMA/MA/SMK';
    case DiplomaOne = 'D1';
    case DiplomaTwo = 'D2';
    case DiplomaThree = 'D3';
    case Undergraduate = 'D4/S1';
    case Masters = 'S2';
    case Doctorate = 'S3';
    case Other = 'Lainnya';
}
