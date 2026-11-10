<?php

namespace App;

enum UserRole: string
{
    case Admin = 'admin';
    case Alumni = 'alumni';
    case Applicant = 'applicant';
}
