<?php

namespace App;

enum Visibility: string
{
    case Private = 'private';
    case Alumni = 'alumni';
    case Public = 'public';
}
