<?php

namespace App;

enum AdminRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Author = 'author';
}
