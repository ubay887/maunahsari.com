<?php

namespace App\Http\Controllers;

use App\Actions\Psb\QuotaLock;
use App\Actions\Psb\SubmitApplication;
use App\ApplicantSource;
use App\DocumentType;
use App\Http\Requests\StoreApplicationRequest;
use App\Models\Applicant;
use App\Models\Program;
use App\Models\RegistrationPeriod;
use App\Pondok;
use App\Services\ArticleHtmlSanitizer;
use App\Services\PsbData;
use App\Services\PsbFormData;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PsbController extends Controller
{
    public function index(PsbData $data, ArticleHtmlSanitizer $sanitizer): Response
    {
        $period = $data->activePeriod() ?? RegistrationPeriod::orderByDesc('id')->first();

        return Inertia::render('psb/index', ['infoHtml' => $period?->info_note && preg_match('/<[a-z][^>]*>/i', $period->info_note) ? $sanitizer->clean($period->info_note) : null, 'period' => $period, 'programs' => Program::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get(), 'quotas' => $data->quotas($period?->id), 'canonical' => route('psb.index')]);
    }

    public function register(Request $request, PsbData $data, PsbFormData $formData): Response
    {
        $period = $data->activePeriod();
        $quotas = $data->quotas($period?->id);
        $available = collect($quotas)->where('available', true);
        if ($request->filled('program_id')) {
            $available = $available->where('program_id', $request->integer('program_id'));
        }
        if ($request->filled('gender')) {
            $available = $available->where('pondok', Pondok::fromGender($request->string('gender')->toString())->value);
        }

        return Inertia::render('psb/register', [...$formData->options(), 'period' => $period ?? RegistrationPeriod::orderByDesc('id')->first(), 'programs' => Program::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get(), 'quotas' => $quotas, 'closed' => $available->isEmpty(), 'closedMessage' => QuotaLock::CLOSED_MESSAGE, 'selectedProgram' => $request->integer('program_id'), 'selectedGender' => $request->string('gender')->toString()]);
    }

    public function store(StoreApplicationRequest $request, SubmitApplication $submit): RedirectResponse
    {
        $files = [];
        foreach (DocumentType::cases() as $type) {
            $file = $request->file('documents.'.$type->value);
            if ($file instanceof UploadedFile) {
                $files[$type->value] = $file;
            }
        }
        $applicant = $submit->handle($request->safe()->except(['documents', 'website', 'email', 'password']), $files, ApplicantSource::Online, null, $request->safe()->only(['email', 'password']));
        $account = $applicant->user;
        if ($account !== null) {
            event(new Registered($account));
            if (Auth::guest()) {
                Auth::login($account);
                $request->session()->regenerate();
            }
        }
        $request->session()->put('psb_success_id', $applicant->id);

        return to_route('psb.success');
    }

    public function success(Request $request): Response
    {
        $applicant = Applicant::whereKey($request->session()->get('psb_success_id'))->firstOrFail();

        return Inertia::render('psb/success', ['registration' => $applicant->only(['registration_number', 'full_name', 'pondok', 'residence_type']), 'programName' => $applicant->program->name, 'contact' => $applicant->registrationPeriod->getAttribute('contact_whatsapp_'.$applicant->pondok->value), 'accountEmail' => $applicant->user?->email]);
    }
}
