<?php

namespace App;

enum ContactRequestStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Declined = 'declined';
    case Expired = 'expired';
}
