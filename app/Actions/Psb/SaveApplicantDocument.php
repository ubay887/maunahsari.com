<?php

namespace App\Actions\Psb;

use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\ApplicantDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class SaveApplicantDocument
{
    public function __construct(private QuotaLock $lock) {}

    public function handle(Applicant $applicant, DocumentType $type, ?UploadedFile $file, bool $onlyWhileRegistered = false): void
    {
        $newPath = null;
        $oldPath = null;
        try {
            DB::transaction(function () use ($applicant, $type, $file, $onlyWhileRegistered, &$newPath, &$oldPath): void {
                $this->lock->period($applicant->registration_period_id);
                $locked = Applicant::query()->lockForUpdate()->findOrFail($applicant->id);
                if ($locked->status === ApplicantStatus::Accepted) {
                    throw ValidationException::withMessages(['document' => 'Batalkan penerimaan sebelum mengubah berkas pendaftar yang diterima.']);
                }
                if ($onlyWhileRegistered && $locked->status !== ApplicantStatus::Registered) {
                    throw ValidationException::withMessages(['document' => 'Berkas terkunci karena pendaftaran sudah diproses. Hubungi narahubung untuk perubahan.']);
                }
                $document = $locked->documents()->where('type', $type)->first();
                $oldPath = $document?->path;
                if ($file === null) {
                    $document?->delete();

                    return;
                }
                $path = $file->store('psb/'.$applicant->id, 'local');
                if ($path === false) {
                    throw ValidationException::withMessages(['document' => 'Berkas gagal disimpan. Silakan coba lagi.']);
                }
                $newPath = $path;
                ApplicantDocument::updateOrCreate(['applicant_id' => $applicant->id, 'type' => $type], ['path' => $path, 'original_name' => $file->getClientOriginalName(), 'size' => $file->getSize(), 'mime' => $file->getMimeType(), 'is_verified' => false, 'verified_at' => null, 'verified_by' => null]);
            });
        } catch (Throwable $exception) {
            if ($newPath !== null) {
                Storage::disk('local')->delete($newPath);
            }
            throw $exception;
        }
        if ($oldPath !== null) {
            DB::afterCommit(fn () => Storage::disk('local')->delete($oldPath));
        }
    }
}
