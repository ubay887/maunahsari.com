<?php

namespace App\Actions\Psb;

use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class AcceptApplicant
{
    public function __construct(private QuotaLock $lock) {}

    public function handle(Applicant $applicant, User $actor): Santri
    {
        $newPhoto = null;
        $oldPhoto = null;
        try {
            $result = DB::transaction(function () use ($applicant, $actor, &$newPhoto, &$oldPhoto): Santri {
                $this->lock->period($applicant->registration_period_id);
                $locked = Applicant::query()->lockForUpdate()->findOrFail($applicant->id);
                if (! in_array($locked->status, [ApplicantStatus::Verified, ApplicantStatus::Accepted], true)) {
                    throw ValidationException::withMessages(['status' => 'Verifikasi berkas sebelum menerima pendaftar.']);
                }
                $documents = $locked->documents()->lockForUpdate()->get()->keyBy(fn ($document): string => $document->type->value);
                foreach (DocumentType::cases() as $type) {
                    $document = $documents->get($type->value);
                    if ($document === null || ! $document->is_verified || ! Storage::disk('local')->exists($document->path)) {
                        throw ValidationException::withMessages(['status' => 'Seluruh berkas wajib harus tersedia dan terverifikasi.']);
                    }
                }
                $santri = Santri::firstOrNew(['applicant_id' => $locked->id]);
                $photo = $documents->get(DocumentType::PasFoto->value);
                if ($photo === null) {
                    throw ValidationException::withMessages(['status' => 'Pas foto wajib tersedia.']);
                }
                $targetPhoto = 'santris/'.$locked->id.'/'.hash('sha256', $photo->path).'.'.pathinfo($photo->path, PATHINFO_EXTENSION);
                if ($santri->photo_path !== $targetPhoto || ! Storage::disk('local')->exists($targetPhoto)) {
                    $oldPhoto = $santri->photo_path;
                    $newPhoto = $targetPhoto;
                    if (! Storage::disk('local')->copy($photo->path, $newPhoto)) {
                        throw ValidationException::withMessages(['status' => 'Foto santri gagal disalin. Silakan coba lagi.']);
                    }
                    $santri->photo_path = $newPhoto;
                }
                $santri->fill([...$locked->only(SubmitApplication::SANTRI_FIELDS), 'entry_year' => (int) substr($locked->registrationPeriod->academic_year, 0, 4), 'is_active' => true])->save();
                if ($locked->status !== ApplicantStatus::Accepted) {
                    $locked->statusHistories()->create(['from_status' => $locked->status, 'to_status' => ApplicantStatus::Accepted, 'changed_by' => $actor->id]);
                    $locked->update(['status' => ApplicantStatus::Accepted, 'decided_at' => now(), 'decided_by' => $actor->id, 'decision_reason' => null]);
                }

                return $santri;
            });
            if ($oldPhoto !== null && $oldPhoto !== $newPhoto) {
                DB::afterCommit(fn () => Storage::disk('local')->delete($oldPhoto));
            }

            return $result;
        } catch (Throwable $exception) {
            if ($newPhoto !== null) {
                Storage::disk('local')->delete($newPhoto);
            }
            throw $exception;
        }
    }
}
