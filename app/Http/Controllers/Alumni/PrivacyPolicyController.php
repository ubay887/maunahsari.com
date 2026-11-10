<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyPolicyController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('public/alumni-privacy', ['version' => config('alumni.privacy_version'), 'contact' => ['name' => config('alumni.contact_name'), 'email' => config('alumni.contact_email'), 'whatsapp' => config('alumni.contact_whatsapp')]]);
    }
}
