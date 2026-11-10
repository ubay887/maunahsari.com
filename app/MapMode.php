<?php

namespace App;

enum MapMode: string
{
    case Visible = 'visible';
    case Anonymous = 'anonymous';
    case Hidden = 'hidden';
}
